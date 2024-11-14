const fs = require('node:fs');
const path = require('node:path');
module.exports = {
	importCommands: function(client) {
		const commandsPath = path.resolve('./commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			client.commands.set(command.data.name, command);
		}
		return client;
	},
	importEvents: function(client) {
		const eventsPath = path.resolve('./events');
		const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);
			const event = require(filePath);
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args));
			}
			else {
				client.on(event.name, (...args) => event.execute(...args));
			}
		}
		return client;
	},
};