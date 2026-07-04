import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Safety checks
    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address format" }, { status: 400 });
    }

    if (name) {
      if (name.length > 32) {
        return NextResponse.json({ message: "Summoner name cannot exceed 32 characters" }, { status: 400 });
      }
      // Only allow letters, numbers, spaces, underscores, and hyphens (prevent HTML injection)
      if (!/^[a-zA-Z0-9 _-]+$/.test(name)) {
        return NextResponse.json({ message: "Summoner name contains invalid characters" }, { status: 400 });
      }
    }

    // Password checks
    if (password.length < 14 || password.length > 128) {
      return NextResponse.json({ message: "Password must be between 14 and 128 characters" }, { status: 400 });
    }
    
    if (/^[0-9]+$/.test(password)) {
      return NextResponse.json({ message: "Password cannot be numbers only" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Invalid registration details. Email might already exist." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash: hashedPassword,
      }
    });

    return NextResponse.json({ message: "User created", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
