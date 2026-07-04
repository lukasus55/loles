export interface ChampionData {
  id: string;
  name: string;
  iconUrl: string;
}

export async function getChampions(): Promise<ChampionData[]> {
  try {
    // 1. Fetch latest version
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!versionRes.ok) throw new Error("Failed to fetch DDragon versions");
    
    const versions = await versionRes.json();
    const latestVersion = versions[0];

    // 2. Fetch champions for that version
    const champsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`, {
      next: { revalidate: 86400 }
    });

    if (!champsRes.ok) throw new Error("Failed to fetch DDragon champions");

    const champsData = await champsRes.json();
    const championsObj = champsData.data;

    // 3. Map to lightweight array
    const championsList: ChampionData[] = Object.keys(championsObj).map(key => {
      const champ = championsObj[key];
      return {
        id: champ.id,
        name: champ.name,
        iconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`
      };
    });

    // Sort alphabetically by name
    return championsList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching champions:", error);
    return []; 
  }
}
