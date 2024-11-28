const { nasaToken } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const utils = require('../utils/utils.js');
const COLORS = require('../utils/colors.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('pnasa')
		.setDescription('Sends a nasa image of the day'),
	async execute(interaction) {
		const img = await utils.parseJson('https://api.nasa.gov/planetary/apod?api_key=' + nasaToken);
		const title = await utils.translate(img.title, 'es');
		await interaction.deferReply();
		try {
			const embed = new EmbedBuilder()
				.setColor(COLORS.BLACK)
				.setTitle('Nasa Image Of The Day')
				.setDescription(title)
				.setImage(img.url);
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al ejecutar el comando');
		}
	},
};