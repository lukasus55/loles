import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChampions } from "@/lib/riot/ddragon";
import { MatchupNoteForm } from "@/components/notes/MatchupNoteForm";

export default async function NewNotePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const champions = await getChampions();

  return (
    <div className="container mx-auto px-4 py-8">
      <MatchupNoteForm mode="create" champions={champions} />
    </div>
  );
}
