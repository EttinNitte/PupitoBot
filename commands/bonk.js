const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const COLORS = require('../utils/colors.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('bonk')
		.setDescription('Bonk someone')
		.addStringOption(option => option.setName('bonk').setDescription('Tag someone to bonk').setRequired(true)),
	async execute(interaction) {
		const string = interaction.options.getString('bonk');
		await interaction.deferReply();
		try {
			const embed = new EmbedBuilder()
				.setColor(COLORS.OLIVE)
				.setTitle('BonK!')
				.setDescription(`${interaction.user.tag} bonks ${string}`)
				.setImage('https://i.imgur.com/MXBC3cc.jpeg');
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al ejecutar el comando');
		}
	},
};