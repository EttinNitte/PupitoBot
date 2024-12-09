const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const COLORS = require('../utils/colors.js');
const utils = require('../utils/utils.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('steam')
		.setDescription('Busca información sobre un juego en Steam.')
		.addStringOption(option =>
			option.setName('juego')
				.setDescription('El nombre del juego que deseas buscar.')
				.setRequired(true),
		),
	async execute(interaction) {
		const gameName = interaction.options.getString('juego');
		const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=us`;
		try {
			await interaction.deferReply();
			const searchResponse = await axios.get(searchUrl);
			const results = searchResponse.data.items;
			if (!results || results.length === 0) {
				return interaction.reply(`No se encontraron resultados para el juego: **${gameName}**.`);
			}
			const game = results[0];
			const appId = game.id;
			const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
			const detailsResponse = await axios.get(detailsUrl);
			const gameDetails = detailsResponse.data[appId].data;
			if (!gameDetails) {
				return interaction.reply(`No se pudieron obtener detalles para el juego: **${gameName}**.`);
			}
			const title = gameDetails.name;
			let description = gameDetails.short_description || 'No hay descripción disponible.';
			description = await utils.translate(description, 'es');
			const price = gameDetails.is_free
				? 'Gratis'
				: gameDetails.price_overview
					? `${gameDetails.price_overview.final_formatted}`
					: 'Precio no disponible';
			const imageUrl = gameDetails.header_image;
			const link = `https://store.steampowered.com/app/${appId}`;

			const embed = new EmbedBuilder()
				.setColor(COLORS.DARK_BLUE)
				.setTitle(title)
				.setDescription (description[0])
				.setFields([
					{ name: 'Link: ', value: link, inline: false },
					{ name: 'Precio', value: price, inline: true },
					{ name: 'Plataforma', value: gameDetails.platforms ? Object.keys(gameDetails.platforms).join(', ') : 'Desconocido', inline: true },
				])
				.setImage(imageUrl);
			/* const embed = new EmbedBuilder()
				*/
			interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			interaction.editReply('Hubo un error al buscar información del juego. Inténtalo más tarde.');
		}
	},
};

