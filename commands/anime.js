const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const utils = require('../utils/utils.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomanime')
		.setDescription('Get a random anime from a genre selected by the user.'),
	async execute(interaction) {
		const baseUrl = 'https://api.jikan.moe/v4/anime';
		const genreUrl = 'https://api.jikan.moe/v4/genres/anime';
		await interaction.deferReply();
		try {
			const genreResponse = await axios.get(genreUrl);
			const genres = genreResponse.data.data;
			if (!genres || genres.length === 0) {
				await interaction.editReply('Could not fetch genres. Please try again later.');
				return;
			}
			const chunkSize = Math.ceil(genres.length / 3);
			const genreChunks = [];
			for (let i = 0; i < genres.length; i += chunkSize) {
				genreChunks.push(genres.slice(i, i + chunkSize));
			}
			const fields = genreChunks.map((chunk, index) => ({
				name: `Column ${index + 1}`,
				value: chunk.map(genre => `${genre.name} (ID: ${genre.mal_id})`).join('\n'),
				inline: true,
			}));
			await interaction.editReply({
				embeds: [
					{
						color: 0x5865f2,
						title: 'Available Genres',
						description: 'Reply with a genre ID to select it.',
						fields,
					},
				],
			});
			const filter = msg => msg.author.id === interaction.user.id;
			const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });
			collector.on('collect', async msg => {
				const genreId = parseInt(msg.content.trim(), 10);
				if (!genres.some(g => g.mal_id === genreId)) {
					await interaction.followUp('Invalid genre ID. Please try again.');
					collector.stop('invalid');
					return;
				}
				collector.stop('valid');
				const initialResponse = await axios.get(baseUrl, {
					params: {
						genres: genreId,
						order_by: 'score',
						sort: 'desc',
						page: 1,
					},
				});
				const totalResults = initialResponse.data.pagination.items.total;
				const resultsPerPage = initialResponse.data.pagination.items.per_page;
				const totalPages = Math.ceil(totalResults / resultsPerPage);
				if (totalResults === 0) {
					await interaction.editReply(`No anime found for genre ID: ${genreId}.`);
					return;
				}
				const randomPage = Math.floor(Math.random() * totalPages) + 1;
				const randomPageResponse = await axios.get(baseUrl, {
					params: {
						genres: genreId,
						order_by: 'score',
						sort: 'desc',
						page: randomPage,
					},
				});
				const animeList = randomPageResponse.data.data;
				if (!animeList || animeList.length === 0) {
					await interaction.editReply(`No anime found on page ${randomPage}.`);
					return;
				}
				const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];
				const synopsis = await utils.translate(randomAnime.synopsis, 'es');
				const animeGenres = await randomAnime.genres.map(g => g.name).join(', ') || 'N/A';
				const themes = await randomAnime.themes.map(g => g.name).join(', ') || 'N/A';
				await interaction.editReply({
					embeds: [
						{
							color: 0x5865f2,
							title: randomAnime.title,
							url: randomAnime.url,
							description: synopsis[0] || 'No synopsis available.',
							thumbnail: { url: randomAnime.images.jpg.image_url },
							fields: [
								{ name: 'Tipo', value: randomAnime.type || 'Unknown', inline: true },
								{ name: 'Episodios', value: randomAnime.episodes?.toString() || 'Unknown', inline: true },
								{ name: 'Puntaje', value: randomAnime.score?.toString() || 'N/A', inline: true },
								{ name: 'Géneros', value: animeGenres, inline: true },
								{ name: 'Temas', value: themes, inline: true },
								{ name: 'Emitido', value: (randomAnime.season || 'N/A') + ' - ' + (randomAnime.year || 'N/A'), inline: true },
							],
						},
					],
				});

				await msg.delete().catch(console.error);
			});

			collector.on('end', (_, reason) => {
				if (reason === 'time') {
					interaction.followUp('Time ran out! Please try the command again.');
				}
			});
		}
		catch (error) {
			console.error('Error fetching random anime:', error);
			await interaction.reply('An error occurred while fetching the anime. Please try again later.');
		}
	},
};
