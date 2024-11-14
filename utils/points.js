const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_database.db');
const user = require('../utils/user.js');
module.exports = {
	getUserPoints: async function(userId) {
		return new Promise((resolve, reject) => {
			db.get('SELECT points FROM users WHERE id = ?', [userId], (err, row) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(row ? row.points : reject(err));
				}
			});
		});
	},
	setUserPoints: function(userId, points) {
		db.run('UPDATE users SET points = ? WHERE id = ?', [points, userId], (err) => {
			if (err) {
				console.error(err);
			}
		});
	},
	addPoint: async function(points, interaction) {
		let p;
		try {
			p = await this.getUserPoints(interaction.user.id);
			p += points;
		}
		catch (e) {
			user.createUser(interaction);
			p = points;
		}
		this.setUserPoints(interaction.user.id, p);
		return p;
	},
};