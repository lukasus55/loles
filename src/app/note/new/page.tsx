import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChampions } from "@/lib/riot/ddragon";
import { MatchupNoteForm } from "@/components/notes/MatchupNoteForm";

export default async function NewNotePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const champions = await getChampions();
  const resolvedParams = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <MatchupNoteForm 
        mode="create" 
        champions={champions} 
        initialFilters={{
          role: typeof resolvedParams.role === 'string' ? resolvedParams.role as any : undefined,
          myPick: typeof resolvedParams.myPick === 'string' ? resolvedParams.myPick : null,
          enemyPick: typeof resolvedParams.enemyPick === 'string' ? resolvedParams.enemyPick : null,
          mySupp: typeof resolvedParams.mySupp === 'string' ? resolvedParams.mySupp : null,
          enemySupp: typeof resolvedParams.enemySupp === 'string' ? resolvedParams.enemySupp : null,
        }}
      />
    </div>
  );
}
