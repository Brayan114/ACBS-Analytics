-- Migration Script: Initialize Database Schema

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id VARCHAR(255) PRIMARY KEY,
    tournament_id VARCHAR(255),
    map_name VARCHAR(255),
    game_mode VARCHAR(255),
    blue_team_id VARCHAR(255),
    red_team_id VARCHAR(255),
    blue_bans VARCHAR(255)[],
    red_bans VARCHAR(255)[],
    winner_team_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

-- Create match_player_performance table
CREATE TABLE IF NOT EXISTS match_player_performance (
    performance_id SERIAL PRIMARY KEY,
    match_id VARCHAR(255) REFERENCES matches(match_id) ON DELETE CASCADE,
    player_tag VARCHAR(255) NOT NULL,
    team_id VARCHAR(255),
    brawler_id VARCHAR(255) NOT NULL,
    is_win BOOLEAN NOT NULL DEFAULT FALSE,
    is_mvp BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_match_player_performance_match_id ON match_player_performance(match_id);
CREATE INDEX IF NOT EXISTS idx_match_player_performance_player_tag ON match_player_performance(player_tag);
