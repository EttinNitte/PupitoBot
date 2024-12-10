const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('waifu')
		.setDescription('Obtén una imagen aleatoria de waifu.'),

	async execute(interaction) {
		const url = 'https://api.waifu.pics/sfw/waifu';

		try {
			const response = await axios.get(url);
			const imageUrl = response.data.url;
			await interaction.reply({
				embeds: [
					{
						color: 0x5865f2,
						title: 'Waifu Random',
						image: { url: imageUrl },
					},
				],
			});
		}
		catch (error) {
			console.error(error);
			await interaction.reply('Ocurrió un error al obtener la waifu. Inténtalo de nuevo más tarde.');
		}
	},
};