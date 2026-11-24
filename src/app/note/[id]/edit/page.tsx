import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { MatchupOrigin, buildMatchupUrl } from "@/lib/matchup/url";
import { Role } from "@/components/notes/RoleFilter";

export default async function LegacyEditNoteRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [{ id }, resolvedSearch] = await Promise.all([params, searchParams]);

  const note = await prisma.matchupNote.findUnique({
    where: { id },
    select: {
      userId: true,
      role: true,
      myChampion: true,
      enemyChampion: true,
      mySupport: true,
      enemySupport: true,
    },
  });

  if (!note || note.userId !== session.user.id) {
    notFound();
  }

  const rawFrom = typeof resolvedSearch.from === "string" ? resolvedSearch.from : undefined;
  const from: MatchupOrigin | undefined =
    rawFrom === "stats" || rawFrom === "history" || rawFrom === "matchups" ? rawFrom : undefined;

  redirect(
    buildMatchupUrl(
      {
        role: note.role as Role,
        myPick: note.myChampion,
        enemyPick: note.enemyChampion,
        mySupp: note.mySupport,
        enemySupp: note.enemySupport,
      },
      { from }
    )
  );
}
