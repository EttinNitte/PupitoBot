const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const utils = require('../utils/utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pcat')
		.setDescription('Sends a random cat'),
	async execute(interaction) {
		const cat = await utils.parseJson('https://api.thecatapi.com/v1/images/search');
		const fact = await utils.parseJson('https://catfact.ninja/fact');
		const embed = new EmbedBuilder()
			.setColor('#804000')
			.setTitle('Random cat')
			.setDescription(`${fact.fact}`)
			.setImage(cat[0].url);
		await interaction.reply({ embeds: [embed] });
	},
};