const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pbonk')
		.setDescription('Bonk someone')
		.addStringOption(option => option.setName('bonk').setDescription('Tag someone to bonk').setRequired(true)),
	async execute(interaction) {
		const string = interaction.options.getString('bonk');
		const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle('BonK!')
			.setDescription(`${interaction.user.tag} bonks ${string}`)
			.setImage('https://i.imgur.com/MXBC3cc.jpeg');
		await interaction.reply({ embeds: [embed] });
	},
};