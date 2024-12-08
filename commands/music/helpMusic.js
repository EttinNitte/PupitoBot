const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('musiccommands')
		.setDescription('Displays a list of music-related commands dynamically'),
	async execute(interaction) {
		const musicCommands = interaction.client.commands.filter(command =>
			command.data.description.toLowerCase().includes('music' || 'musica') ||
            command.data.description.toLowerCase().includes('playlist' || 'lista de reproducicon') ||
            command.data.description.toLowerCase().includes('song' || 'cancion') ||
            command.data.description.toLowerCase().includes('queue' || 'cola'),
		);
		if (musicCommands.size === 0) {
			return interaction.reply({ content: 'No music-related commands found!', ephemeral: true });
		}
		const embed = new EmbedBuilder()
			.setColor(0x1DB954)
			.setTitle('🎵 Music Commands')
			.setDescription('Aqui todos los comandos disponibles para musica:')
			.setFooter({ text: 'Use these commands to control Pupito bot!' });
		musicCommands.forEach(command => {
			embed.addFields({
				name: `/${command.data.name}`,
				value: command.data.description || 'No description provided.',
				inline: false,
			});
		});
		await interaction.reply({ embeds: [embed] });
	},
};