import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { pool } from './config/db';
import { startPollingWorker } from './cron/pollingWorker';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint with database status check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      service: 'brawl-stars-backend',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check database query failure:', error);
    res.status(500).json({
      status: 'ERROR',
      service: 'brawl-stars-backend',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/drafts: Receives manual draft picks, bans, and checked-in telemetry
app.post('/api/drafts', async (req: Request, res: Response) => {
  const { tournamentId, mapName, gameMode, blueBans, redBans, blueTeam, redTeam } = req.body;

  if (!blueTeam || !redTeam) {
    return res.status(400).json({ error: 'Missing required team draft data.' });
  }

  const matchId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert draft match
    const matchInsertQuery = `
      INSERT INTO matches (
        match_id, tournament_id, map_name, game_mode,
        blue_team_id, red_team_id, blue_bans, red_bans,
        winner_team_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `;

    await client.query(matchInsertQuery, [
      matchId,
      tournamentId || 'CHAMPIONSHIP_CHALLENGE_2026',
      mapName || 'Hard Rock Mine',
      gameMode || 'Gem Grab',
      'blue',
      'red',
      blueBans || [],
      redBans || [],
      null, // No winner yet for active drafts
      new Date(),
    ]);

    // Query template for player performance logs
    const performanceInsertQuery = `
      INSERT INTO match_player_performance (
        match_id, player_tag, player_name, team_id, brawler_id, is_win, is_mvp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    // Insert Blue Team
    for (const player of blueTeam) {
      await client.query(performanceInsertQuery, [
        matchId,
        player.tag,
        player.name || player.tag,
        'blue',
        player.brawlerId,
        false,
        false,
      ]);
    }

    // Insert Red Team
    for (const player of redTeam) {
      await client.query(performanceInsertQuery, [
        matchId,
        player.tag,
        player.name || player.tag,
        'red',
        player.brawlerId,
        false,
        false,
      ]);
    }

    await client.query('COMMIT');
    console.log(`[API] Successfully saved manual draft match: ${matchId}`);
    res.status(201).json({ status: 'SUCCESS', matchId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[API] Error persisting draft match details:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown database error' });
  } finally {
    client.release();
  }
});

// Helper function to format numeric strings with commas
function formatNumberWithCommas(value: number | string): string {
  const num = typeof value === 'number' ? value : parseInt(value, 10);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

// GET /api/scrims/recent: Fetch recent matches
app.get('/api/scrims/recent', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        m.match_id, 
        m.created_at, 
        m.game_mode, 
        m.blue_team_id, 
        m.red_team_id,
        m.winner_team_id,
        COALESCE(
          json_agg(
            json_build_object(
              'player_tag', p.player_tag,
              'player_name', p.player_name,
              'brawler_id', p.brawler_id,
              'is_mvp', p.is_mvp
            )
          ) FILTER (WHERE p.player_tag IS NOT NULL AND p.team_id = 'blue'), '[]'
        ) as blue_players,
        COALESCE(
          json_agg(
            json_build_object(
              'player_tag', p.player_tag,
              'player_name', p.player_name,
              'brawler_id', p.brawler_id,
              'is_mvp', p.is_mvp
            )
          ) FILTER (WHERE p.player_tag IS NOT NULL AND p.team_id = 'red'), '[]'
        ) as red_players
      FROM matches m
      LEFT JOIN match_player_performance p ON m.match_id = p.match_id
      GROUP BY m.match_id
      ORDER BY m.created_at DESC
      LIMIT 20;
    `;
    const result = await client.query(query);
    
    const scrims = result.rows.map((row: any) => {
      let teamAScore = 0;
      let teamBScore = 0;
      if (row.winner_team_id === 'blue') teamAScore = 1;
      else if (row.winner_team_id === 'red') teamBScore = 1;

      return {
        id: row.match_id,
        timeAgo: row.created_at,
        mode: row.game_mode || 'Friendly 3v3',
        teamA: (row.blue_team_id === 'blue' || !row.blue_team_id) ? 'Blue Team' : row.blue_team_id,
        teamAScore,
        teamB: (row.red_team_id === 'red' || !row.red_team_id) ? 'Red Team' : row.red_team_id,
        teamBScore,
        bluePlayers: row.blue_players,
        redPlayers: row.red_players
      };
    });

    res.json(scrims);
  } catch (error) {
    console.error('[API] Error fetching recent scrims:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/players/:tag: Fetch player profile from official API and map to PlayerProfile format
app.get('/api/players/:tag', async (req: Request, res: Response) => {
  let playerTag = req.params.tag.toUpperCase();
  // Ensure the player tag starts with '#' for the Brawl Stars API
  if (!playerTag.startsWith('#')) {
    playerTag = '#' + playerTag;
  }

  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    console.error('[API] BRAWL_STARS_API_KEY is not configured.');
    return res.status(500).json({ error: 'Brawl Stars API Key is not configured on the server.' });
  }

  const encodedTag = encodeURIComponent(playerTag);
  const url = `https://api.brawlstars.com/v1/players/${encodedTag}`;

  console.log(`[API] Fetching player profile from Supercell: GET ${url}`);

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    console.log(`[API] Supercell API Response Status: ${apiRes.status}`);

    if (apiRes.status === 404) {
      return res.status(404).json({ error: 'Player not found. Please verify the tag.' });
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`[API] Supercell API error ${apiRes.status}:`, errText);
      return res.status(apiRes.status).json({ 
        error: `Brawl Stars API error: ${apiRes.statusText || 'Request failed'}` 
      });
    }

    const data = await apiRes.json() as any;

    // Map Supercell API response structure to frontend PlayerProfile structure
    const expLevel = data.expLevel || 0;
    const expPoints = data.expPoints || 0;
    const trophies = data.trophies || 0;
    const highestTrophies = data.highestTrophies || 0;
    const victories3v3 = data['3vs3Victories'] || 0;
    const soloWins = data.soloVictories || 0;
    const duoWins = data.duoVictories || 0;
    const showdownWins = soloWins + duoWins;
    const isChampionshipQualified = data.isChampionshipQualified ? 'YES' : 'NO';
    const clubName = data.club && data.club.name ? data.club.name : 'No Club';

    // Brawlers mapping
    const rawBrawlers = data.brawlers || [];
    
    // Sort brawlers by highest trophies descending
    const sortedBrawlers = [...rawBrawlers].sort((a: any, b: any) => {
      const tA = a.highestTrophies || 0;
      const tB = b.highestTrophies || 0;
      return tB - tA;
    });

    // Extract best brawler
    let bestBrawler = {
      name: 'SHELLY',
      trophies: '0',
      current: '0',
      portrait: '/brawlers/borderless/16000000.png'
    };

    if (sortedBrawlers.length > 0) {
      const topB = sortedBrawlers[0];
      bestBrawler = {
        name: (topB.name || 'Brawler').toUpperCase(),
        trophies: formatNumberWithCommas(topB.highestTrophies || 0),
        current: formatNumberWithCommas(topB.trophies || 0),
        portrait: `/brawlers/borderless/${topB.id}.png`
      };
    }

    // Map top 8 best brawlers for the horizontal list
    const bestBrawlers = sortedBrawlers.slice(0, 8).map((b: any, idx: number) => {
      return {
        name: (b.name || 'Brawler').toUpperCase(),
        trophies: formatNumberWithCommas(b.highestTrophies || 0),
        max: formatNumberWithCommas(b.trophies || 0),
        portrait: `/brawlers/borderless/${b.id}.png`,
        rank: idx + 1
      };
    });

    // Map ALL brawlers for the Brawlers Tab grid
    const allBrawlers = sortedBrawlers.map((b: any) => {
      return {
        id: b.id,
        name: (b.name || 'Brawler').toUpperCase(),
        power: b.power || 1,
        rank: b.rank || 1,
        trophies: formatNumberWithCommas(b.trophies || 0),
        highestTrophies: formatNumberWithCommas(b.highestTrophies || 0),
        portrait: `/brawlers/borderless/${b.id}.png`,
        starPowers: (b.starPowers || []).map((sp: any) => ({ id: sp.id, name: sp.name })),
        gadgets: (b.gadgets || []).map((g: any) => ({ id: g.id, name: g.name })),
        gears: (b.gears || []).map((g: any) => ({ id: g.id, name: g.name }))
      };
    });

    const responsePayload = {
      tag: playerTag,
      name: data.name || 'Unknown Player',
      iconId: data.icon && data.icon.id ? data.icon.id : 28000000,
      nameColor: data.nameColor || '#ffffff',
      club: clubName,
      level: expLevel,
      trophies: formatNumberWithCommas(trophies),
      highestTrophies: formatNumberWithCommas(highestTrophies),
      wins3v3: formatNumberWithCommas(victories3v3),
      showdownWins: formatNumberWithCommas(showdownWins),
      prestigeTrophies: formatNumberWithCommas(trophies > 10000 ? Math.floor(trophies / 40) : 0), // Derived prestige stats
      winStreak: '0', // In-game wins streak is not present in general profiles
      prestigeLevel: Math.max(1, Math.floor(trophies / 1000)).toString(), // Derived prestige level
      brawlersUnlocked: rawBrawlers.length,
      championship: isChampionshipQualified,
      bestBrawler,
      experience: {
        level: expLevel.toString(),
        points: `${formatNumberWithCommas(expPoints)} XP`
      },
      roboRumble: data.bestRoboRumbleTime ? `Time: ${data.bestRoboRumbleTime}s` : '-',
      bigBrawler: data.bestTimeAsBigBrawler ? `Time: ${data.bestTimeAsBigBrawler}s` : '-',
      bestBrawlers,
      allBrawlers
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error(`[API] Error fetching player profile for tag ${playerTag}:`, error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
});

// GET /api/players/:tag/battlelog: Fetch player battle log from official API
app.get('/api/players/:tag/battlelog', async (req: Request, res: Response) => {
  let playerTag = req.params.tag.toUpperCase();
  if (!playerTag.startsWith('#')) {
    playerTag = '#' + playerTag;
  }

  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Brawl Stars API Key is not configured.' });
  }

  const encodedTag = encodeURIComponent(playerTag);
  const url = `https://api.brawlstars.com/v1/players/${encodedTag}/battlelog`;

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (apiRes.status === 404) {
      return res.status(404).json({ error: 'Player or battlelog not found.' });
    }

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: `Brawl Stars API error: ${apiRes.statusText}` });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error(`[API] Error fetching battlelog for ${playerTag}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve frontend build static files in production
import path from 'path';
import fs from 'fs';

const frontendBuildPath = path.join(__dirname, 'frontend');
const frontendDevBuildPath = path.join(__dirname, '../dist/frontend');
const finalFrontendPath = fs.existsSync(frontendBuildPath) ? frontendBuildPath : frontendDevBuildPath;

app.use(express.static(finalFrontendPath));

// Fallback index.html page for Single Page Application client routing
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // If it's an api request, skip static file fallback
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(finalFrontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend bundle not found. Please build frontend first.');
  }
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    status: 'ERROR',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server & Worker
app.listen(port, async () => {
  console.log(`========================================`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`========================================`);

  // Run DB schema migration/alter to ensure column exists
  try {
    await pool.query('ALTER TABLE match_player_performance ADD COLUMN IF NOT EXISTS player_name VARCHAR(255);');
    console.log('[Database] Migrated: player_name column ensured in match_player_performance.');
  } catch (dbMigrateErr) {
    console.error('[Database] Failed to run migration query:', dbMigrateErr);
  }

  // Initialize background polling cron task
  try {
    startPollingWorker();
    console.log('📬 Background battle log polling worker scheduled.');
  } catch (cronError) {
    console.error('Failed to start background polling worker:', cronError);
  }
});
