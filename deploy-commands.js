const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');
const utils = require('./utils/utils.js');

const commands = [];
async function loadCommands() {
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if (Array.isArray(command)) {
			const translatedCommands = await Promise.all(
				command.map(async cmd => {
					let txt = await utils.translate(cmd.data.description, 'es');
					txt = txt[0].split('\n');
					console.log(txt[0]);
					cmd.data.setDescription(txt[0]);
					return cmd.data.toJSON();
				}),
			);
			commands.push(...translatedCommands);
		}
		else {
			let txt = await utils.translate(command.data.description, 'es');
			txt = txt[0].split('\n');
			console.log(txt[0]);
			command.data.setDescription(txt[0]);
			commands.push(command.data.toJSON());
		}
	}
	const musicCommandsPath = path.join(__dirname, 'commands/music');
	const musicCommandFiles = fs.readdirSync(musicCommandsPath).filter(file => file.endsWith('.js'));
	for (const file of musicCommandFiles) {
		const filePath = path.join(musicCommandsPath, file);
		const command = require(filePath);
		if (Array.isArray(command)) {
			const translatedCommands = await Promise.all(
				command.map(async cmd => {
					let txt = await utils.translate(cmd.data.description, 'es');
					txt = txt[0].split('\n');
					console.log(txt[0]);
					cmd.data.setDescription(txt[0]);
					return cmd.data.toJSON();
				}),
			);
			commands.push(...translatedCommands);
		}
		else {
			let txt = await utils.translate(command.data.description, 'es');
			txt = txt[0].split('\n');
			console.log(txt[0]);
			command.data.setDescription(txt[0]);
			commands.push(command.data.toJSON());
		}
	}
	return commands;
}
loadCommands().then(c => {
	const rest = new REST({ version: '9' }).setToken(token);
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: c })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
}).catch(err => {
	console.error('Error loading commands:', err);
});

