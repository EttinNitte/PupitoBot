const { nasa } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const utils = require('../utils/utils.js');
const COLORS = require('../utils/colors.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('nasa')
		.setDescription('Sends a nasa image of the day'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const date = new Date().toISOString().split('T')[0];
			const response = await fetch(`https://api.farmsense.net/v1/moonphases/?d=${new Date(date).getTime()}`);
			const data = await response.json();
			const img = await utils.parseJson('https://api.nasa.gov/planetary/apod?api_key=' + nasa);
			const imgTitle = await utils.translate(img.title, 'es');
			const phase = data[0]?.Phase || 'Unknown';
			const illumination = data[0]?.Illumination || 'Unknown';
			const type = checkURLType(img.url);
			const fieldsData = [
				{ name: 'Fase Lunar', value: phase, inline: true },
				{ name: 'Iluminación', value: illumination.toString(), inline: true },
				{ name: 'Imagen del día', value: imgTitle[0], inline: false },
			];
			let url = null;
			if (type == 'YouTube Video') {
				fieldsData.push({ name: img.url, value: '\n', inline: false });
			}
			else if (type == 'Image URL') {
				url = img.url;
			}
			const embedFields = [];
			fieldsData.forEach(item => {
				embedFields.push({
					name: item.name,
					value: item.value,
					inline: item.inline,
				});
			});
			const asteroidsResponse = await axios.get(
				`https://api.nasa.gov/neo/rest/v1/feed?start_date=${new Date().toISOString().split('T')[0]}&api_key=${nasa}`,
			);
			const asteroidsData = asteroidsResponse.data.near_earth_objects;
			const asteroids = Object.values(asteroidsData).flat().slice(0, 3);
			const epicResponse = await axios.get(
				`https://api.nasa.gov/EPIC/api/natural/images?api_key=${nasa}`,
			);
			const epicData = epicResponse.data.slice(0, 3);
			const asteroidsInfo = asteroids.map(asteroid => {
				return `☄️ **${asteroid.name}** - Distancia: ${asteroid.close_approach_data[0].miss_distance.kilometers} km - Fecha: ${asteroid.close_approach_data[0].close_approach_date}`;
			}).join('\n');
			const epicInfo = epicData.map(image => {
				const d = image.date.split(' ')[0];
				const [year, month, day] = d.split('-');
				const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${image.image}.png`; return `🌍 **${image.caption}** - Fecha: ${image.date} - [Ver imagen](${imageUrl})`;
			}).join('\n');
			const desc = `🌌 **Eventos Astronómicos Recientes:**\n\n**Asteroides Cercanos:**\n${asteroidsInfo}\n\n**Observaciones desde EPIC:**\n${epicInfo}`;
			const embed = new EmbedBuilder()
				.setColor(COLORS.BLACK)
				.setTitle('Nasa')
				.setDescription(desc)
				.setThumbnail('https://gpm.nasa.gov/sites/default/files/document_files/NASA-Logo-Large.png')
				.setFields(embedFields)
				.setImage(url);
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al ejecutar el comando');
		}
	},
};
function checkURLType(url) {
	const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
	const imageRegex = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
	if (youtubeRegex.test(url)) {
		return 'YouTube Video';
	}
	else if (imageRegex.test(url)) {
		return 'Image URL';
	}
	else {
		return 'Unknown';
	}
}