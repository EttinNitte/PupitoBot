const { nasaToken } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
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
			const img = await utils.parseJson('https://api.nasa.gov/planetary/apod?api_key=' + nasaToken);
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
			const embed = new EmbedBuilder()
				.setColor(COLORS.BLACK)
				.setTitle('Nasa')
				.setDescription('Información del día')
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