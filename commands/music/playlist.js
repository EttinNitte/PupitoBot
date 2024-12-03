const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, ButtonBuilder, ButtonStyle, TextInputStyle, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_database.db');
const utils = require('../../utils/utils.js');

const listPlaylist = {
	data: new SlashCommandBuilder()
		.setName('plists')
		.setDescription('Lists all playlists with their creators.'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const query = `
                    SELECT 
                        P.id_playlist, 
                        P.name AS playlist_name, 
                        P.user_id,
                        COUNT(PS.id_song) AS song_count
                    FROM 
                        PLAYLIST P
                    LEFT JOIN 
                        PLAYLIST_SONGS PS 
                    ON 
                        P.id_playlist = PS.id_playlist
                    GROUP BY 
                        P.id_playlist, P.name, P.user_id;
                `;
			db.all(query, [], async (err, rows) => {
				if (err) {
					console.error(err);
					return interaction.editReply('An error occurred while fetching playlists.');
				}
				if (rows.length === 0) {
					return interaction.editReply('No playlists found in the database.');
				}
				const playlistsPerPage = 20;
				const totalPages = Math.ceil(rows.length / playlistsPerPage);
				const generateEmbed = (page) => {
					const start = (page - 1) * playlistsPerPage;
					const end = start + playlistsPerPage;
					const pagePlaylists = rows.slice(start, end);
					const embed = new EmbedBuilder()
						.setTitle(`Playlists (Page ${page} of ${totalPages})`)
						.setColor(0x00AE86)
						.setTimestamp()
						.setFooter({ text: 'Playlist Bot', iconURL: interaction.client.user.avatarURL() });
					pagePlaylists.forEach((row) => {
						const creatorMention = `<@${row.user_id}>`;
						embed.addFields({
							name: '\n',
							value: `${row.id_playlist}.- **Playlist**: ${row.playlist_name} (${row.song_count} songs)- **Creator:** ${creatorMention}`,
							inline: false,
						});
					});
					return embed;
				};
				const createPaginationButtons = (page) => {
					const row = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('prev')
							.setLabel('◀️ Previous')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(page === 1),
						new ButtonBuilder()
							.setCustomId('next')
							.setLabel('▶️ Next')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(page === totalPages),
					);
					return row;
				};
				let currentPage = 1;
				const embed = generateEmbed(currentPage);
				const buttons = createPaginationButtons(currentPage);
				const message = await interaction.editReply({
					embeds: [embed],
					components: rows.length > playlistsPerPage ? [buttons] : [],
				});
				const collector = message.createMessageComponentCollector({
					time: 60000,
				});
				collector.on('collect', async (btnInteraction) => {
					if (btnInteraction.user.id !== interaction.user.id) {
						return btnInteraction.reply({
							content: 'You can t interact with this!',
							ephemeral: true,
						});
					}
					if (btnInteraction.customId === 'prev') {
						currentPage -= 1;
					}
					else if (btnInteraction.customId === 'next') {
						currentPage += 1;
					}
					const updatedEmbed = generateEmbed(currentPage);
					const updatedButtons = createPaginationButtons(currentPage);
					await btnInteraction.update({
						embeds: [updatedEmbed],
						components: [updatedButtons],
					});
				});
				collector.on('end', async () => {
					if (message.components.length != 0) {
						const disabledButtons = createPaginationButtons(currentPage).components.map((button) =>
							button.setDisabled(true),
						);
						await message.edit({
							components: [new ActionRowBuilder().addComponents(disabledButtons)],
						});
					}
				});
			});
		}
		catch (error) {
			console.error(error);
			interaction.editReply('An error occurred while executing the command.');
		}
	},
};
const createplaylist = {
	data: new SlashCommandBuilder()
		.setName('createplaylist')
		.setDescription('Create a new playlist with a title and initial song URL.'),
	async execute(interaction) {
		if (await utils.validateRole('dj', interaction)) {
			try {
				const modal = new ModalBuilder()
					.setCustomId('createPlaylistModal')
					.setTitle('Create a Playlist');
				const titleInput = new TextInputBuilder()
					.setCustomId('playlistTitle')
					.setLabel('Enter the playlist title:')
					.setStyle(TextInputStyle.Short)
					.setRequired(true);
				const songInput = new TextInputBuilder()
					.setCustomId('playlistSong')
					.setLabel('Enter the first song Name:')
					.setStyle(TextInputStyle.Short)
					.setRequired(true);
				const urlInput = new TextInputBuilder()
					.setCustomId('playlistUrl')
					.setLabel('Enter the first song URL:')
					.setStyle(TextInputStyle.Short)
					.setRequired(true);
				const firstRow = new ActionRowBuilder().addComponents(titleInput);
				const secondRow = new ActionRowBuilder().addComponents(songInput);
				const thirdRow = new ActionRowBuilder().addComponents(urlInput);
				modal.addComponents(firstRow, secondRow, thirdRow);
				await interaction.showModal(modal);
				const filter = (i) => i.customId === 'createPlaylistModal' && i.user.id === interaction.user.id;
				const submitted = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(() => null);
				if (!submitted) {
					return interaction.followUp({ content: 'You did not submit the form in time.', ephemeral: true });
				}
				const playlistTitle = submitted.fields.getTextInputValue('playlistTitle');
				const songName = submitted.fields.getTextInputValue('playlistSong');
				const songUrl = submitted.fields.getTextInputValue('playlistUrl');
				const userId = interaction.user.id;
				const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
				if (!urlPattern.test(songUrl)) {
					return submitted.reply({
						content: 'The song URL provided is not valid. Please try again.',
						ephemeral: true,
					});
				}
				db.run(
					'INSERT INTO PLAYLIST (name, user_id) VALUES (?, ?)',
					[playlistTitle, userId],
					function(err) {
						if (err) {
							console.error(err);
							return submitted.reply({
								content: 'An error occurred while creating the playlist.',
								ephemeral: true,
							});
						}
						const playlistId = this.lastID;
						db.run(
							'INSERT INTO PLAYLIST_SONGS (id_playlist, title, url) VALUES (?, ?, ?)',
							[playlistId, songName, songUrl],
							(err) => {
								if (err) {
									console.error(err);
									return submitted.reply({
										content: 'An error occurred while adding the song to the playlist.',
										ephemeral: true,
									});
								}
								return submitted.reply({
									content: `✅ Playlist **"${playlistTitle}"** created successfully with the first song added!`,
									ephemeral: false,
								});
							},
						);
					},
				);
			}
			catch (error) {
				console.error(error);
				interaction.followUp({
					content: 'An error occurred while processing your request.',
					ephemeral: true,
				});
			}
		}
	},
};
const addsong = {
	data: new SlashCommandBuilder()
		.setName('addsong')
		.setDescription('Add a song to an existing playlist.'),
	async execute(interaction) {
		if (await utils.validateRole('dj', interaction)) {
			try {
				await utils.validateRole('dj', interaction);
				db.all(
					'SELECT id_playlist, name FROM PLAYLIST WHERE user_id = ?',
					[interaction.user.id],
					async (err, playlists) => {
						const modal = new ModalBuilder()
							.setCustomId('addSongModal')
							.setTitle('Add a Song to Playlist');
						const titleInput = new TextInputBuilder()
							.setCustomId('songTitle')
							.setLabel('Enter the song title:')
							.setStyle(TextInputStyle.Short)
							.setRequired(true);
						const urlInput = new TextInputBuilder()
							.setCustomId('songUrl')
							.setLabel('Enter the song URL:')
							.setStyle(TextInputStyle.Short)
							.setRequired(true);
						const titleRow = new ActionRowBuilder().addComponents(titleInput);
						const urlRow = new ActionRowBuilder().addComponents(urlInput);
						modal.addComponents(titleRow, urlRow);
						await interaction.showModal(modal);
						const modalFilter = (i) =>
							i.customId === 'addSongModal' && i.user.id === interaction.user.id;
						const submitted = await interaction.awaitModalSubmit({
							filter: modalFilter,
							time: 120000,
						}).catch(() => null);
						if (!submitted) {
							return interaction.followUp({
								content: 'You did not submit the form in time.',
								ephemeral: true,
							});
						}
						const songTitle = submitted.fields.getTextInputValue('songTitle');
						const songUrl = submitted.fields.getTextInputValue('songUrl');
						const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
						if (!urlPattern.test(songUrl)) {
							return submitted.reply({
								content: 'The song URL provided is not valid. Please try again.',
								ephemeral: true,
							});
						}
						if (err) {
							console.error(err);
							return interaction.reply({
								content: 'An error occurred while fetching your playlists.',
								ephemeral: true,
							});
						}
						const playlistOptions = playlists.map((playlist) => ({
							label: playlist.name,
							value: playlist.id_playlist.toString(),
						}));
						const selectMenu = new StringSelectMenuBuilder()
							.setCustomId('selectPlaylist')
							.setPlaceholder('Select a playlist to add a song')
							.addOptions(playlistOptions);
						const selectRow = new ActionRowBuilder().addComponents(selectMenu);
						await submitted.reply({
							content: 'Please select a playlist:',
							components: [selectRow],
							ephemeral: true,
						});
						const filter = (i) =>
							i.customId === 'selectPlaylist' && i.user.id === interaction.user.id;
						const playlistSelection = await interaction.channel
							.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 60000 })
							.catch(() => null);

						if (!playlistSelection) {
							return submitted.reply({
								content: 'You did not select a playlist in time.',
								components: [],
							});
						}
						if (playlists.length === 0) {
							return submitted.reply({
								content: 'You do not have any playlists to add songs to. Use `/createplaylist` to create one.',
								ephemeral: true,
							});
						}
						const selectedPlaylistId = playlistSelection.values[0];
						const selectedPlaylistName = playlistOptions.find(
							(option) => option.value === selectedPlaylistId,
						).label;
						await playlistSelection.deferUpdate();
						db.run(
							'INSERT INTO PLAYLIST_SONGS (id_playlist, title, url) VALUES (?, ?, ?)',
							[selectedPlaylistId, songTitle, songUrl],
							(err) => {
								if (err) {
									console.error(err);
									return interaction.followUp({
										content: 'An error occurred while adding the song to the playlist.',
									});
								}
								return interaction.followUp({
									content: `✅ Song **"${songTitle}"** has been added to playlist **"${selectedPlaylistName}"**.`,
								});
							},
						);
					},
				);
			}
			catch (error) {
				console.error(error);
				interaction.reply({
					content: 'An error occurred while processing your request.',
					ephemeral: true,
				});
			}
		}
	},
};
module.exports = [listPlaylist, createplaylist, addsong];