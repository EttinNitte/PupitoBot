const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if (Array.isArray(command)) {
		commands.push(...command.map(cmd => cmd.data.toJSON()));
	}
	else {
		commands.push(command.data.toJSON());
	}
}
const musicCommandsPath = path.join(__dirname, 'commands/music');
const musicCommandFiles = fs.readdirSync(musicCommandsPath).filter(file => file.endsWith('.js'));
for (const file of musicCommandFiles) {
	const filePath = path.join(musicCommandsPath, file);
	const command = require(filePath);
	if (Array.isArray(command)) {
		commands.push(...command.map(cmd => cmd.data.toJSON()));
	}
	else {
		commands.push(command.data.toJSON());
	}
}
const rest = new REST({ version: '9' }).setToken(token);
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);