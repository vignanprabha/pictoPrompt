CREATE DATABASE IF NOT EXISTS flight_ai_game;
USE flight_ai_game;

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  display_name VARCHAR(80) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
  id CHAR(36) PRIMARY KEY,
  level ENUM('easy','medium','hard') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  generator_model VARCHAR(80),
  seed INT,
  meta JSON,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  state ENUM('active','completed','eliminated') NOT NULL DEFAULT 'active',
  current_stage ENUM('easy','medium','hard','done') NOT NULL DEFAULT 'easy',
  total_score DECIMAL(6,2),
  images_completed INT DEFAULT 0,
  eliminated_at VARCHAR(20),
  eliminated_stage ENUM('easy','medium','hard'),
  eliminated_image_order TINYINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE session_images (
  id CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  image_id CHAR(36) NOT NULL,
  level ENUM('easy','medium','hard') NOT NULL,
  stage_order TINYINT NOT NULL,
  stage_name ENUM('easy','medium','hard','done') NOT NULL,
  user_prompt TEXT,
  score DECIMAL(5,2),            -- similarity % 0..100
  points INT,                    -- weighted points toward 200
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sess FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_img FOREIGN KEY (image_id) REFERENCES images(id),
  UNIQUE KEY uniq_sess_order (session_id, stage_order)
);

CREATE INDEX idx_images_level_active ON images (level, active);
CREATE INDEX idx_sessions_leaderboard ON sessions (state, total_score, completed_at);
