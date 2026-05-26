export interface ScrimPlayer {
  player_tag: string;
  player_name?: string;
  team_id: string;
  brawler_id: string;
  is_win: boolean;
  is_mvp: boolean;
}

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
