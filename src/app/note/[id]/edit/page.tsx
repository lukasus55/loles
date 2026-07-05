import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getChampions } from "@/lib/riot/ddragon";
import { MatchupNoteForm } from "@/components/notes/MatchupNoteForm";
import prisma from "@/lib/prisma";

export default async function EditNotePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const noteId = resolvedParams.id;
  
  const note = await prisma.matchupNote.findUnique({
    where: { id: noteId }
  });

  if (!note || note.userId !== session.user.id) {
    notFound();
  }

  const champions = await getChampions();

  return (
    <div className="container mx-auto px-4 py-8">
      <MatchupNoteForm 
        mode="edit" 
        champions={champions} 
        initialData={{ ...note, notes: note.notes || "" }} 
        from={typeof resolvedSearch.from === 'string' ? resolvedSearch.from : undefined}
      />
    </div>
  );
}
