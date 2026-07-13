import { HomeClient } from "@/components/home/HomeClient";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOLES",
};

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <HomeClient />
      <Footer />
    </main>
  );
}
