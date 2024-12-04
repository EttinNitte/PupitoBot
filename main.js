const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const loadResource = require('./utils/loadResource.js');
let client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
client.commands = new Collection();
client = loadResource.importCommands(client);
client = loadResource.importEvents(client);
client = loadResource.importMusicCommands(client);
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, client);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
client.login(token);