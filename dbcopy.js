const sqlite3 = require('sqlite3').verbose();

// Open the database (it will create the file if it doesn't exist)
const db = new sqlite3.Database('./bot_database.db');

// Create the 'users' table with the schema
db.run(`
  	DROP TABLE user;
  )
`, (err) => {
	if (err) {
		console.error('Error creating table:', err);
	}
	else {
		console.log('Table "user" created or already exists.');
	}
});

// Close the database connection (optional here, but good practice)
db.close();
