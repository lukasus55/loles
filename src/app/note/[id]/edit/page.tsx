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

  let whereClause: any = {
    userId: session.user.id,
    championName: note.myChampion,
    enemyChampionName: note.enemyChampion,
    gameDuration: { gte: 240 }
  };
  
  if (note.role === "ADC" || note.role === "SUPP") {
    if (note.mySupport) whereClause.partnerChampionName = note.mySupport;
    if (note.enemySupport) whereClause.enemyPartnerChampionName = note.enemySupport;
  }

  const matches = await prisma.match.findMany({ where: whereClause, select: { win: true } });
  const dynamicWins = matches.filter(m => m.win).length;
  const dynamicLosses = matches.filter(m => !m.win).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <MatchupNoteForm 
        mode="edit" 
        champions={champions} 
        initialData={{ ...note, notes: note.notes || "", wins: dynamicWins, losses: dynamicLosses }} 
        from={typeof resolvedSearch.from === 'string' ? resolvedSearch.from : undefined}
      />
    </div>
  );
}
