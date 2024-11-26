const { nasaToken } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const utils = require('../utils/utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pnasa')
		.setDescription('Sends a nasa image of the day'),
	async execute(interaction) {
		const img = await utils.parseJson('https://api.nasa.gov/planetary/apod?api_key=' + nasaToken);
		const title = await utils.translate(img.title, 'es');
		const embed = new EmbedBuilder()
			.setColor('#804000')
			.setTitle('Nasa Image Of The Day')
			.setDescription(title)
			.setImage(img.url);
		await interaction.reply({ embeds: [embed] });
	},
};