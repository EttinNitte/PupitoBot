const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_database.db');
module.exports = {
	createUser: function(interaction) {
		db.run('INSERT INTO users (id,name,tag,points) VALUES(?,?,?,?)', [interaction.user.id, interaction.user.name, interaction.user.tag, 0]);
		console.log('created user');
	},
};