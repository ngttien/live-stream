CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Users table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    display_name   VARCHAR(100),
    avatar_url     VARCHAR(255),
    bio            TEXT,
    stream_key     VARCHAR(100) UNIQUE NOT NULL,
    is_streaming   BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0,
    created_at     TIMESTAMP DEFAULT NOW(),
    last_login     TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username      ON users(username);
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_stream_key    ON users(stream_key);
CREATE INDEX idx_users_is_streaming  ON users(is_streaming);

-- =============================================
-- Rooms table
-- =============================================
CREATE TABLE IF NOT EXISTS rooms (
    id             SERIAL PRIMARY KEY,
    room_id        VARCHAR(50)  UNIQUE NOT NULL,
    streamer_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    thumbnail_url  VARCHAR(255),
    category       VARCHAR(50)  NOT NULL,
    is_live        BOOLEAN DEFAULT FALSE,
    viewer_count   INTEGER DEFAULT 0,
    peak_viewers   INTEGER DEFAULT 0,
    started_at     TIMESTAMP,
    ended_at       TIMESTAMP,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_room_id      ON rooms(room_id);
CREATE INDEX idx_rooms_streamer_id  ON rooms(streamer_id);
CREATE INDEX idx_rooms_is_live      ON rooms(is_live);
CREATE INDEX idx_rooms_category     ON rooms(category);
CREATE INDEX idx_rooms_created_at   ON rooms(created_at DESC);

-- =============================================
-- Messages table
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id         SERIAL PRIMARY KEY,
    room_id    INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username   VARCHAR(50) NOT NULL,
    content    TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id     ON messages(room_id);
CREATE INDEX idx_messages_user_id     ON messages(user_id);
CREATE INDEX idx_messages_created_at  ON messages(created_at DESC);

-- =============================================
-- Follows table
-- =============================================
CREATE TABLE IF NOT EXISTS follows (
    follower_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_follows_follower_id  ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- =============================================
-- Bans table
-- =============================================
CREATE TABLE IF NOT EXISTS bans (
    id         SERIAL PRIMARY KEY,
    room_id    INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    banned_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason     TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX idx_bans_room_id      ON bans(room_id);
CREATE INDEX idx_bans_user_id      ON bans(user_id);
CREATE INDEX idx_bans_expires_at   ON bans(expires_at);

-- =============================================
-- Stream stats table (analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS stream_stats (
    id            SERIAL PRIMARY KEY,
    room_id       INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    viewer_count  INTEGER NOT NULL,
    message_count INTEGER DEFAULT 0,
    recorded_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stream_stats_room_id     ON stream_stats(room_id);
CREATE INDEX idx_stream_stats_recorded_at ON stream_stats(recorded_at DESC);

-- =============================================
-- Notifications table (optional)
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    TEXT,
    data       JSONB,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id     ON notifications(user_id);
CREATE INDEX idx_notifications_is_read     ON notifications(is_read);
CREATE INDEX idx_notifications_created_at  ON notifications(created_at DESC);

-- =============================================
-- Trigger: auto-update `updated_at`
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Trigger: auto-update follower_count
-- =============================================
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users
           SET follower_count = follower_count + 1
         WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users
           SET follower_count = GREATEST(follower_count - 1, 0)
         WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

-- =============================================
-- View: live streams (real-time dashboard)
-- =============================================
CREATE OR REPLACE VIEW live_streams_view AS
SELECT
    r.room_id,
    r.title,
    r.category,
    r.viewer_count,
    r.started_at,
    u.username        AS streamer_username,
    u.display_name    AS streamer_display_name,
    u.avatar_url      AS streamer_avatar,
    u.follower_count  AS streamer_followers,
    EXTRACT(EPOCH FROM (NOW() - r.started_at)) AS duration_seconds
FROM rooms r
JOIN users u ON r.streamer_id = u.id
WHERE r.is_live = TRUE
ORDER BY r.viewer_count DESC;

-- =============================================
-- View: popular streamers
-- =============================================
CREATE OR REPLACE VIEW popular_streamers_view AS
SELECT
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.follower_count,
    u.is_streaming,
    COUNT(r.id)                  AS total_streams,
    COALESCE(SUM(r.peak_viewers), 0) AS total_views
FROM users u
LEFT JOIN rooms r ON u.id = r.streamer_id
GROUP BY u.id
ORDER BY u.follower_count DESC;