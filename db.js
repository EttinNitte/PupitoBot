const sqlite3 = require('sqlite3').verbose();

// Open the database (it will create the file if it doesn't exist)
const db = new sqlite3.Database('./bot_database.db');

// Create the 'users' table with the schema
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,      -- Unique user ID (Discord user ID, typically a string)
    name TEXT,                -- User's name (Discord username)
    tag TEXT,                 -- User's tag (Discord discriminator like #1234)
    points INTEGER            -- User's points
  )
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
