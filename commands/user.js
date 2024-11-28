const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const points = require('../utils/points.js');
const COLORS = require('../utils/colors.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('puser')
		.setDescription('Replies with user info'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const member = interaction.options.getMember('user') || interaction.member;
			const roles = member.roles.cache
				.filter(role => role.id !== interaction.guild.id)
				.map(role => role.name)
				.join(', ') || 'No roles';
			const serverPoints = await points.getUserPoints(member.id);
			const embeds = [];
			const embed = new EmbedBuilder()
				.setColor(COLORS.BLUE)
				.setTitle(member.user.username)
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addFields(
					{ name: 'Username', value: member.user.tag, inline: true },
					{ name: 'User ID', value: member.id, inline: true },
					{ name: 'Server Join Date', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
					{ name: 'Roles', value: roles, inline: false },
					{ name: 'Pupito Points', value: `${serverPoints}`, inline: true },
				)
				.setFooter({
					text: 'Customized Member Card',
					iconURL: interaction.guild.iconURL({ dynamic: true }),
				})
				.setTimestamp();
			embeds.push(embed);
			let currentPage = 0;
			if (embeds.length == 1) {
				await interaction.editReply({ embeds: [embeds[currentPage]] });
			}
			else if (embeds.length > 1) {
				const buttons = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('<==')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('==>')
						.setStyle(ButtonStyle.Primary),
				);
				const reply = await interaction.editReply({ embeds: [embeds[currentPage]], components: [buttons] });
				const collector = reply.createMessageComponentCollector({ time: 60000 });
				collector.on('collect', async (int) => {
					if (!int.isButton()) return;
					if (int.customId === 'prev') {
						currentPage = (currentPage - 1 + embeds.length) % embeds.length;
					}
					else if (int.customId === 'next') {
						currentPage = (currentPage + 1) % embeds.length;
					}
					await int.update({
						embeds: [embeds[currentPage]],
						components: [buttons],
					});
				});
			}
			else {
				await interaction.editReply('No hay datos para mostrar');
			}
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Error al ejecutar el comando');
		}
	},
};