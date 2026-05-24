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
        match_id, player_tag, team_id, brawler_id, is_win, is_mvp
      ) VALUES ($1, $2, $3, $4, $5, $6);
    `;

    // Insert Blue Team
    for (const player of blueTeam) {
      await client.query(performanceInsertQuery, [
        matchId,
        player.tag,
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
app.listen(port, () => {
  console.log(`========================================`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`========================================`);

  // Initialize background polling cron task
  try {
    startPollingWorker();
    console.log('📬 Background battle log polling worker scheduled.');
  } catch (cronError) {
    console.error('Failed to start background polling worker:', cronError);
  }
});
