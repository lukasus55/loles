import { redirect } from "next/navigation";
import { buildMatchupUrl, parseMatchupSearchParams } from "@/lib/matchup/url";

export default async function LegacyNewNoteRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const parsed = parseMatchupSearchParams(resolved);

  if (parsed) {
    redirect(
      buildMatchupUrl(
        {
          role: parsed.role,
          myPick: parsed.myPick,
          enemyPick: parsed.enemyPick,
          mySupp: parsed.mySupp,
          enemySupp: parsed.enemySupp,
        },
        { from: parsed.from, tab: parsed.tab }
      )
    );
  }

  redirect("/matchups");
}
