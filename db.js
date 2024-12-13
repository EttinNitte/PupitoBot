const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_database.db');
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,      -- Unique user ID (Discord user ID, typically a string)
    tag TEXT,                 -- User's tag (Discord discriminator like #1234)
    points INTEGER            -- User's points
);

CREATE TABLE PLAYLIST (
    id_playlist INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                           
    user_id TEXT NOT NULL                        
);

-- Create the PLAYLIST_SONGS table
CREATE TABLE PLAYLIST_SONGS (
    id_song INTEGER PRIMARY KEY AUTOINCREMENT,
    id_playlist INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (id_playlist) REFERENCES PLAYLIST (id_playlist) 
    ON DELETE CASCADE                           
);
CREATE TABLE IF NOT EXISTS TRIVIA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES USER (user_id)
);

`, (err) => {
	if (err) {
		console.error('Error creating table:', err);
	}
	else {
		console.log('Table "users" created or already exists.');
	}
});

// Close the database connection (optional here, but good practice)
db.close();
