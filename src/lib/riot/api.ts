export const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) {
  console.warn("RIOT_API_KEY is not set in environment variables. Riot API calls will fail.");
}

// Map standard platform routing values to continental routing values
export const getContinentalRouting = (region: string): string => {
  const r = region.toLowerCase();
  if (['na1', 'br1', 'la1', 'la2'].includes(r)) return 'americas';
  if (['euw1', 'eun1', 'tr1', 'ru'].includes(r)) return 'europe';
  if (['kr', 'jp1'].includes(r)) return 'asia';
  if (['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'].includes(r)) return 'sea';
  return 'europe'; // default fallback
};

export const fetchRiotAccount = async (gameName: string, tagLine: string, region: string) => {
  const continent = getContinentalRouting(region);
  const res = await fetch(
    `https://${continent}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: { "X-Riot-Token": RIOT_API_KEY! } }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error("Summoner not found. Please check the spelling of your Game Name and Tagline.");
    if (res.status === 403) throw new Error("Invalid Riot API Key. Check your environment variables.");
    throw new Error(`Riot Account API Error: ${res.status}`);
  }

  return res.json(); // { puuid, gameName, tagLine }
};

export const fetchSummonerByPuuid = async (puuid: string, region: string) => {
  const res = await fetch(
    `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    { headers: { "X-Riot-Token": RIOT_API_KEY! } }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error("Summoner profile not found in this region.");
    if (res.status === 403) throw new Error("Invalid Riot API Key.");
    throw new Error(`Riot Summoner API Error: ${res.status}`);
  }

  return res.json(); // { profileIconId, summonerLevel, id, ... }
};

export const fetchMatchIds = async (puuid: string, region: string, count: number = 10) => {
  const continent = getContinentalRouting(region);
  const res = await fetch(
    `https://${continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
    { headers: { "X-Riot-Token": RIOT_API_KEY! } }
  );
  if (!res.ok) {
    const errorText = await res.text().catch(() => "No response body");
    throw new Error(`Riot Match IDs API Error: ${res.status} - ${errorText}`);
  }
  return res.json(); // string[]
};

export const fetchMatchDetails = async (matchId: string, region: string) => {
  const continent = getContinentalRouting(region);
  const res = await fetch(
    `https://${continent}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    { headers: { "X-Riot-Token": RIOT_API_KEY! } }
  );
  if (!res.ok) throw new Error(`Riot Match Details API Error: ${res.status}`);
  return res.json();
};

export const fetchLeagueEntries = async (summonerId: string, region: string) => {
  const res = await fetch(
    `https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`,
    { headers: { "X-Riot-Token": RIOT_API_KEY! } }
  );
  if (!res.ok) {
    if (res.status === 404 || res.status === 403) return []; // No rank or Forbidden
    const errorText = await res.text().catch(() => "No response body");
    throw new Error(`Riot League API Error: ${res.status} - ${errorText}`);
  }
  return res.json();
};
