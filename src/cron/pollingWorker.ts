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
  // Flatten and extract tags of all players in the match
  const playerTags: string[] = [];
  if (teams) {
    for (const team of teams) {
      for (const player of team) {
        playerTags.push(player.tag);
      }
    }
  }
  
  // Sort the tags lexicographically to ensure order-independence (e.g. blue vs red team swapped)
  const sortedTags = [...playerTags].sort();
  
  const rawFingerprintString = `${battleTime}:${sortedTags.join(',')}`;
  
  // Generate a clean, fixed-size SHA-256 hash
  return crypto.createHash('sha256').update(rawFingerprintString).digest('hex');
}

/**
 * Parses battleTime string (e.g., "20260524T181022.000Z") into standard Date object
 */
export function parseBattleTime(battleTime: string): Date {
  // Format: YYYYMMDDTHHMMSS.SSSZ -> YYYY-MM-DDTHH:MM:SS.SSSZ
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
 * Mock function simulating the official Supercell Developer API response for /players/{playerTag}/battlelog.
 * Features 3 mock matches for #8YCCJ8JG and #2Y002LYY:
 * - Match 1: shared challenge match (to verify deduplication)
 * - Match 2: challenge match unique to #8YCCJ8JG
 * - Match 3: non-challenge match (should be filtered out)
 * - Match 4: challenge match unique to #2Y002LYY
 */
export async function simulateFetchBattleLog(playerTag: string): Promise<BattleLogResponse> {
  console.log(`[API Mock] Simulating GET /players/${encodeURIComponent(playerTag)}/battlelog`);

  // Shared match data
  const sharedMatch: BattleLogItem = {
    battleTime: '20260524T181022.000Z',
    event: { id: 15000010, mode: 'gemGrab', map: 'Hard Rock Mine' },
    battle: {
      mode: 'gemGrab',
      type: 'challenge', // MATCHES strict condition
      result: 'victory',
      duration: 182,
      starPlayer: {
        tag: '#22G2L902',
        name: 'SpikeMaster',
        brawler: { id: 16000007, name: 'SPIKE' }
      },
      teams: [
        [
          { tag: '#8YCCJ8JG', name: 'EsportsPro1', brawler: { id: 16000000, name: 'SHELLY' } },
          { tag: '#2Y002LYY', name: 'EsportsPro2', brawler: { id: 16000005, name: 'COLT' } },
          { tag: '#22G2L902', name: 'SpikeMaster', brawler: { id: 16000007, name: 'SPIKE' } }
        ],
        [
          { tag: '#9PP92GG8', name: 'ChallengerA', brawler: { id: 16000001, name: 'NITA' } },
          { tag: '#8VV82LL9', name: 'ChallengerB', brawler: { id: 16000002, name: 'EL_PRIMO' } },
          { tag: '#7UU72YY1', name: 'ChallengerC', brawler: { id: 16000003, name: 'BULL' } }
        ]
      ]
    }
  };

  // Match only for player #8YCCJ8JG
  const matchPlayer1Only: BattleLogItem = {
    battleTime: '20260524T173000.000Z',
    event: { id: 15000015, mode: 'brawlBall', map: 'Pinhole Plaza' },
    battle: {
      mode: 'brawlBall',
      type: 'challenge', // MATCHES strict condition
      result: 'defeat',
      duration: 120,
      starPlayer: {
        tag: '#ENEMYMVP',
        name: 'Baller99',
        brawler: { id: 16000010, name: 'MORTIS' }
      },
      teams: [
        [
          { tag: '#8YCCJ8JG', name: 'EsportsPro1', brawler: { id: 16000000, name: 'SHELLY' } },
          { tag: '#PLAYERX', name: 'PlayerX', brawler: { id: 16000012, name: 'POCO' } },
          { tag: '#PLAYERY', name: 'PlayerY', brawler: { id: 16000015, name: 'STU' } }
        ],
        [
          { tag: '#ENEMYMVP', name: 'Baller99', brawler: { id: 16000010, name: 'MORTIS' } },
          { tag: '#PLAYERW', name: 'PlayerW', brawler: { id: 16000020, name: 'EMZ' } },
          { tag: '#PLAYERV', name: 'PlayerV', brawler: { id: 16000022, name: 'BARLEY' } }
        ]
      ]
    }
  };

  // Non-challenge match (should be filtered out)
  const ignoredMatch: BattleLogItem = {
    battleTime: '20260524T160000.000Z',
    event: { id: 15000020, mode: 'soloShowdown', map: 'Cavern Churn' },
    battle: {
      mode: 'soloShowdown',
      type: 'soloShowdown', // FAILS strict condition (not "challenge")
      result: undefined,
      duration: 95
    }
  };

  // Match only for player #2Y002LYY
  const matchPlayer2Only: BattleLogItem = {
    battleTime: '20260524T150000.000Z',
    event: { id: 15000030, mode: 'heist', map: 'Kaboom Canyon' },
    battle: {
      mode: 'heist',
      type: 'challenge', // MATCHES strict condition
      result: 'victory',
      duration: 150,
      starPlayer: {
        tag: '#2Y002LYY',
        name: 'EsportsPro2',
        brawler: { id: 16000005, name: 'COLT' }
      },
      teams: [
        [
          { tag: '#2Y002LYY', name: 'EsportsPro2', brawler: { id: 16000005, name: 'COLT' } },
          { tag: '#PLAYERA', name: 'PlayerA', brawler: { id: 16000035, name: 'BROCK' } },
          { tag: '#PLAYERB', name: 'PlayerB', brawler: { id: 16000040, name: 'DYNAMIKE' } }
        ],
        [
          { tag: '#PLAYERC', name: 'PlayerC', brawler: { id: 16000041, name: 'JESSIE' } },
          { tag: '#PLAYERD', name: 'PlayerD', brawler: { id: 16000042, name: 'PENNY' } },
          { tag: '#PLAYERE', name: 'PlayerE', brawler: { id: 16000043, name: 'TICK' } }
        ]
      ]
    }
  };

  if (playerTag === '#8YCCJ8JG') {
    return { items: [sharedMatch, matchPlayer1Only, ignoredMatch] };
  } else if (playerTag === '#2Y002LYY') {
    return { items: [sharedMatch, matchPlayer2Only, ignoredMatch] };
  } else {
    // Fallback default response with no items or just a basic layout
    return { items: [] };
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
      const response = await simulateFetchBattleLog(playerTag);
      const items = response.items || [];

      console.log(`[Cron Poller] Retrieved ${items.length} items for player ${playerTag}`);

      for (const item of items) {
        // 1. Strict filtering logic: type must be "challenge"
        if (item.battle.type !== 'challenge') {
          console.debug(`[Cron Poller] Skipping match at ${item.battleTime} because type is "${item.battle.type}" (not "challenge")`);
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

        // Standard tournament id placeholder
        const tournamentId = 'CHAMPIONSHIP_CHALLENGE_2026';

        // Designate blue_team_id and red_team_id
        // Brawl Stars API returns teams[0] and teams[1]. We map team 0 to "blue" and team 1 to "red".
        const blueTeamId = 'blue';
        const redTeamId = 'red';

        // Mock draft bans
        const blueBans = ['SHELLY', 'MORTIS'];
        const redBans = ['POCO', 'STU'];

        // Determine winner_team_id
        // The API returns result ("victory", "defeat", or "draw") relative to the player we queried.
        // We find which team the queried player was in to decide the absolute winner.
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
          winnerTeamId = null; // Draw
        }

        // 3. Database transaction to insert matches and performance logs safely
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Insert match with ON CONFLICT DO NOTHING
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

          // If the match was successfully inserted (rowCount > 0), insert player performances
          if (matchResult.rowCount && matchResult.rowCount > 0) {
            newMatchesCount++;
            console.log(`[Cron Poller] [NEW MATCH] Inserted match with fingerprint: ${matchId}`);

            const performanceInsertQuery = `
              INSERT INTO match_player_performance (
                match_id, player_tag, team_id, brawler_id, is_win, is_mvp
              ) VALUES ($1, $2, $3, $4, $5, $6);
            `;

            const starPlayerTag = item.battle.starPlayer?.tag;

            // Iterate over all players in both teams and save their individual performance records
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
