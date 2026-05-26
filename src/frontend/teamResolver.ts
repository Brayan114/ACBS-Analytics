export interface ScrimPlayer {
  player_tag: string;
  player_name?: string;
  team_id: string;
  brawler_id: string;
  is_win: boolean;
  is_mvp: boolean;
}

const BRAWLER_NAME_TO_ID: Record<string, string> = {
  'SHELLY': '16000000',
  'COLT': '16000001',
  'NITA': '16000002',
  'BULL': '16000003',
  'BROCK': '16000004',
  'EL PRIMO': '16000005',
  'EL_PRIMO': '16000005',
  'BARLEY': '16000006',
  'POCO': '16000007',
  'JESSIE': '16000008',
  'DYNAMIKE': '16000009',
  'TICK': '16000010',
  '8-BIT': '16000011',
  'EMZ': '16000012',
  'STU': '16000013',
  'PIPER': '16000014',
  'RICO': '16000015',
  'DARRYL': '16000016',
  'PENNY': '16000017',
  'CARL': '16000018',
  'PAM': '16000019',
  'FRANK': '16000020',
  'BIBI': '16000021',
  'ROSA': '16000022',
  'GENE': '16000023',
  'TARA': '16000024',
  'MORTIS': '16000025',
  'SPIKE': '16000026',
  'CROW': '16000027',
  'LEON': '16000028',
  'SANDY': '16000029',
  'COLETTE': '16000030',
  'GALE': '16000031',
  'SURGE': '16000032',
  'AMBER': '16000033',
  'LOU': '16000034',
  'RUFFS': '16000035',
  'BELLE': '16000036',
  'SQUEAK': '16000037',
  'BUZZ': '16000038',
  'GRIFF': '16000039',
  'ASH': '16000040',
  'LOLA': '16000041',
  'FANG': '16000042',
  'EVE': '16000043',
  'JANET': '16000044',
  'OTIS': '16000045',
  'SAM': '16000046',
  'BUSTER': '16000047',
  'CHESTER': '16000048',
  'GRAY': '16000049',
  'MANDY': '16000050',
  'R-T': '16000051',
  'MAISIE': '16000052',
  'HANK': '16000053',
  'CORDELIUS': '16000054',
  'DOUG': '16000055',
  'PEARL': '16000056',
  'CHUCK': '16000057',
  'CHARLIE': '16000058',
  'MICO': '16000059',
  'LARRY & LAWRIE': '16000060',
  'MELODIE': '16000061',
  'ANGELO': '16000062',
  'DRACO': '16000063',
  'CLANCY': '16000064',
  'MOE': '16000065',
  'KENJI': '16000066',
  'JUJU': '16000067',
  'SHADE': '16000068'
};

/**
 * Resolves a brawler ID (whether string name or number) to the standard numeric string format
 */
export const resolveBrawlerId = (brawlerId: string | number): string => {
  if (!brawlerId) return '16000000';
  const idStr = brawlerId.toString().toUpperCase().trim();
  if (/^\d+$/.test(idStr)) {
    return idStr;
  }
  return BRAWLER_NAME_TO_ID[idStr] || '16000000';
};

/**
 * Resolves a team's display name.
 * If teamName is default (e.g. 'blue', 'red', 'Blue Team', 'Red Team'),
 * it falls back to the team leader/first player's actual player_name or player_tag.
 */
export const resolveTeamName = (teamName: string, teamPlayers: ScrimPlayer[]): string => {
  const defaults = ['blue', 'red', 'Blue Team', 'Red Team'];
  if (!defaults.includes(teamName)) {
    return teamName;
  }
  if (teamPlayers && teamPlayers.length > 0) {
    const leader = teamPlayers[0];
    const leaderName = leader.player_name || leader.player_tag;
    return `${leaderName}'s Team`;
  }
  return teamName;
};
