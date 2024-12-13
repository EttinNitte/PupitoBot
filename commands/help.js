const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('commands')
		.setDescription('Displays a list of commands'),
	async execute(interaction) {
		const commands = Array.from(interaction.client.commands.values()).filter(command =>
			!command.data.description.toLowerCase().includes('music' || 'musica') ||
            !command.data.description.toLowerCase().includes('playlist' || 'lista de reproducción') ||
            !command.data.description.toLowerCase().includes('song' || 'canción') ||
            !command.data.description.toLowerCase().includes('queue' || 'cola'),
		);

		if (commands.length === 0) {
			return interaction.reply({ content: 'No commands found!', ephemeral: true });
		}

		const commandsPerPage = 25;
		const totalPages = Math.ceil(commands.length / commandsPerPage);
		let currentPage = 0;
		const generateEmbed = (page) => {
			const start = page * commandsPerPage;
			const end = start + commandsPerPage;
			const pageCommands = commands.slice(start, end);
			const embed = new EmbedBuilder()
				.setColor(0x1DB954)
				.setTitle('🎵 Commands')
				.setDescription('Aquí todos los comandos disponibles')
				.setFooter({ text: `Page ${page + 1} of ${totalPages}` });
			pageCommands.forEach(command => {
				embed.addFields({
					name: `/${command.data.name}`,
					value: command.data.description || 'No description provided.',
					inline: false,
				});
			});
			return embed;
		};
		const createButtons = () => {
			const row = new ActionRowBuilder();
			if (currentPage > 0) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setLabel('Previous')
						.setStyle(ButtonStyle.Primary),
				);
			}
			if (currentPage < totalPages - 1) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next')
						.setStyle(ButtonStyle.Primary),
				);
			}
			return row;
		};
		await interaction.reply({
			embeds: [generateEmbed(currentPage)],
			components: [createButtons()],
		});
		const filter = i => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.customId === 'next') {
				if (currentPage < totalPages - 1) {
					currentPage++;
					await buttonInteraction.update({
						embeds: [generateEmbed(currentPage)],
						components: [createButtons()],
					});
				}
			}
			else if (buttonInteraction.customId === 'previous') {
				if (currentPage > 0) {
					currentPage--;
					await buttonInteraction.update({
						embeds: [generateEmbed(currentPage)],
						components: [createButtons()],
					});
				}
			}
		});
		collector.on('end', () => {
			interaction.editReply({
				components: [],
			});
		});
	},
};
