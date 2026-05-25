import cron from 'node-cron';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { pool, query } from '../config/db';

dotenv.config();

// Interfaces matching the official Supercell Brawl Stars battlelog API structure
interface Brawler {
  id: number;
  name: string;
}

interface Player {
  tag: string;
  name: string;
  brawler: Brawler;
}

interface Battle {
  mode: string;
  type: string;
  result?: 'victory' | 'defeat' | 'draw';
  duration?: number;
  starPlayer?: Player;
  teams?: Player[][];
}

interface EventDetails {
  id: number;
  mode: string;
  map: string;
}

interface BattleLogItem {
  battleTime: string;
  event: EventDetails;
  battle: Battle;
}

interface BattleLogResponse {
  items: BattleLogItem[];
}

/**
 * Generate a unique composite fingerprint for a match to ensure deduplication.
 * Formula: SHA-256 hash of (battleTime + ":" + sorted player tags joined by commas)
 */
export function generateMatchFingerprint(battleTime: string, teams: Player[][]): string {
  const playerTags: string[] = [];
  if (teams) {
    for (const team of teams) {
      for (const player of team) {
        playerTags.push(player.tag);
      }
    }
  }
  
  // Sort lexicographically to ensure order-independence
  const sortedTags = [...playerTags].sort();
  const rawFingerprintString = `${battleTime}:${sortedTags.join(',')}`;
  
  return crypto.createHash('sha256').update(rawFingerprintString).digest('hex');
}

/**
 * Parses battleTime string (e.g., "20260524T181022.000Z") into standard Date object
 */
export function parseBattleTime(battleTime: string): Date {
  try {
    const year = battleTime.substring(0, 4);
    const month = battleTime.substring(4, 6);
    const day = battleTime.substring(6, 8);
    const time = battleTime.substring(9, 15);
    const hours = time.substring(0, 2);
    const minutes = time.substring(2, 4);
    const seconds = time.substring(4, 6);
    
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`);
  } catch (err) {
    return new Date();
  }
}

/**
 * Executes a live HTTPS request to the official Supercell Developer API endpoint
 * to retrieve the battle logs of a player.
 */
export async function fetchBattleLog(playerTag: string): Promise<BattleLogResponse> {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    throw new Error('BRAWL_STARS_API_KEY environment variable is missing.');
  }

  // URL-encode the player tag (converts '#' to '%23')
  const encodedTag = encodeURIComponent(playerTag);
  const url = `https://api.brawlstars.com/v1/players/${encodedTag}/battlelog`;

  console.log(`[Cron Poller] Fetching battlelog from Supercell API: GET ${url}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log(`[Cron Poller] HTTP Status Code for player ${playerTag}: ${res.status}`);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Supercell API request failed with HTTP ${res.status}: ${errorBody}`);
    }

    const data = await res.json() as BattleLogResponse;
    const itemsCount = data.items ? data.items.length : 0;
    
    console.log(`[Cron Poller] Successfully retrieved ${itemsCount} items for player ${playerTag}`);
    return data;
  } catch (error) {
    console.error(`[Cron Poller] Error requesting battlelog for player ${playerTag}:`, error);
    throw error;
  }
}

/**
 * Poll battle logs for all configured players, filter, deduplicate, and store them.
 */
export async function pollAllPlayers() {
  const targetPlayerTagsEnv = process.env.TARGET_PLAYER_TAGS || '';
  const playerTags = targetPlayerTagsEnv
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (playerTags.length === 0) {
    console.warn('[Cron Poller] No target player tags configured in environment variables.');
    return;
  }

  console.log(`[Cron Poller] Target player tags to poll: ${JSON.stringify(playerTags)}`);

  let newMatchesCount = 0;
  let skippedMatchesCount = 0;

  for (const playerTag of playerTags) {
    try {
      // Calling the live Supercell API
      const response = await fetchBattleLog(playerTag);
      const items = response.items || [];

      for (const item of items) {
        // 1. Filtering logic: accept "challenge", "ranked", "soloRanked", and "friendly"
        const allowedTypes = ['challenge', 'ranked', 'soloRanked', 'friendly'];
        if (!allowedTypes.includes(item.battle.type)) {
          console.debug(`[Cron Poller] Skipping match at ${item.battleTime} because type is "${item.battle.type}" (not competitive/friendly)`);
          continue;
        }

        const teams = item.battle.teams;
        if (!teams || teams.length < 2) {
          console.warn(`[Cron Poller] Skipping challenge match at ${item.battleTime} because it lacks 3v3 team data`);
          continue;
        }

        // 2. Generate composite fingerprint hash
        const matchId = generateMatchFingerprint(item.battleTime, teams);
        const mapName = item.event.map;
        const gameMode = item.event.mode;
        const createdAt = parseBattleTime(item.battleTime);

        const tournamentId = 'CHAMPIONSHIP_CHALLENGE_2026';
        const blueTeamId = 'blue';
        const redTeamId = 'red';

        const blueBans = ['SHELLY', 'MORTIS'];
        const redBans = ['POCO', 'STU'];

        // Determine winner_team_id
        let isQueryPlayerInBlue = false;
        for (const p of teams[0]) {
          if (p.tag === playerTag) {
            isQueryPlayerInBlue = true;
            break;
          }
        }

        let winnerTeamId: string | null = null;
        if (item.battle.result === 'victory') {
          winnerTeamId = isQueryPlayerInBlue ? 'blue' : 'red';
        } else if (item.battle.result === 'defeat') {
          winnerTeamId = isQueryPlayerInBlue ? 'red' : 'blue';
        } else {
          winnerTeamId = null;
        }

        // 3. Database transaction
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const matchInsertQuery = `
            INSERT INTO matches (
              match_id, tournament_id, map_name, game_mode,
              blue_team_id, red_team_id, blue_bans, red_bans,
              winner_team_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (match_id) DO NOTHING
            RETURNING match_id;
          `;

          const matchResult = await client.query(matchInsertQuery, [
            matchId,
            tournamentId,
            mapName,
            gameMode,
            blueTeamId,
            redTeamId,
            blueBans,
            redBans,
            winnerTeamId,
            createdAt,
          ]);

          if (matchResult.rowCount && matchResult.rowCount > 0) {
            newMatchesCount++;
            console.log(`[Cron Poller] [NEW MATCH] Inserted match with fingerprint: ${matchId}`);

            const performanceInsertQuery = `
              INSERT INTO match_player_performance (
                match_id, player_tag, team_id, brawler_id, is_win, is_mvp
              ) VALUES ($1, $2, $3, $4, $5, $6);
            `;

            const starPlayerTag = item.battle.starPlayer?.tag;

            for (let teamIdx = 0; teamIdx < teams.length; teamIdx++) {
              const currentTeamId = teamIdx === 0 ? 'blue' : 'red';
              const isWin = winnerTeamId === currentTeamId;

              for (const playerInfo of teams[teamIdx]) {
                const isMvp = starPlayerTag === playerInfo.tag;

                await client.query(performanceInsertQuery, [
                  matchId,
                  playerInfo.tag,
                  currentTeamId,
                  playerInfo.brawler.name,
                  isWin,
                  isMvp,
                ]);
              }
            }
          } else {
            skippedMatchesCount++;
            console.debug(`[Cron Poller] [DEDUPLICATED] Match with fingerprint ${matchId} already exists in DB.`);
          }

          await client.query('COMMIT');
        } catch (dbErr) {
          await client.query('ROLLBACK');
          console.error(`[Cron Poller] DB Error executing insert transaction for match ${matchId}:`, dbErr);
        } finally {
          client.release();
        }
      }
    } catch (apiErr) {
      console.error(`[Cron Poller] Error fetching battle logs for player ${playerTag}:`, apiErr);
    }
  }

  console.log(`[Cron Poller] Polling cycle complete. Saved ${newMatchesCount} new matches. Deduplicated/skipped ${skippedMatchesCount} matches.`);
}

/**
 * Initialize and start the node-cron scheduler.
 */
export function startPollingWorker() {
  const cronExpression = process.env.POLL_INTERVAL_CRON || '*/5 * * * *';

  console.log(`[Cron Poller] Scheduling battle log polling cron job with expression: "${cronExpression}"`);

  cron.schedule(cronExpression, async () => {
    console.log(`[Cron Poller] Starting background polling cycle at ${new Date().toISOString()}...`);
    try {
      await pollAllPlayers();
    } catch (err) {
      console.error('[Cron Poller] Error in scheduled background cycle:', err);
    }
  });
}
