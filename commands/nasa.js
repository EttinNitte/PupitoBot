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
		await interaction.deferReply();
		try {
			const date = new Date().toISOString().split('T')[0];
			const response = await fetch(`https://api.farmsense.net/v1/moonphases/?d=${new Date(date).getTime()}`);
			const data = await response.json();
			const img = await utils.parseJson('https://api.nasa.gov/planetary/apod?api_key=' + nasaToken);
			const imgTitle = await utils.translate(img.title, 'es');
			const phase = data[0]?.Phase || 'Unknown';
			const illumination = data[0]?.Illumination || 'Unknown';
			const phaseTxt = await utils.translate(phase, 'es');
			const illuminationTxt = await utils.translate(illumination.toString(), 'es');
			const embed = new EmbedBuilder()
				.setColor(COLORS.BLACK)
				.setTitle('Nasa')
				.setDescription('Información del día')
				.setFields(
					{ name: 'Fase Lunar', value: phaseTxt, inline: true },
					{ name: 'Iluminación', value: illuminationTxt, inline: true },
					{ name: 'Imagen del día', value: imgTitle, inline: false },
				)
				.setImage(img.url);
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al ejecutar el comando');
		}
	},
};