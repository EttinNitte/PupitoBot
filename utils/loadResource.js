const fs = require('node:fs');
const path = require('node:path');
module.exports = {
	importCommands: function(client) {
		const commandsPath = path.resolve('./commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if (Array.isArray(command)) {
				command.forEach(cmd => {
					client.commands.set(cmd.data.name, cmd);
				});
			}
			else {
				client.commands.set(command.data.name, command);
			}
		}
		return client;
	},
	importMusicCommands: function(client) {
		const musicCommandsPath = path.resolve('./commands/music');
		const musicCommandFiles = fs.readdirSync(musicCommandsPath).filter(file => file.endsWith('.js'));
		for (const file of musicCommandFiles) {
			const musicFilePath = path.join(musicCommandsPath, file);
			const musicCommand = require(musicFilePath);
			// Set a new item in the Collection
			// With the key as the command name and the value as the exported module
			client.commands.set(musicCommand.data.name, musicCommand);
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