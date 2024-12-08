const { riot } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const utils = require('../utils/utils.js');
const axios = require('axios');
const COLORS = require('../utils/colors.js');
const regiones = [['LAS', 'la2'], ['LAN', 'la1'], ['NA', 'na']];
module.exports = {
	data: new SlashCommandBuilder()
		.setName('lol')
		.setDescription('Info cuenta')
		.addStringOption(option => {
			option.setName('region')
				.setDescription('Región cuenta')
				.setRequired(true);
			regiones.forEach(region => {
				option.addChoices({ name: region[0], value: region[1] });
			});
			return option;
		})
		.addStringOption(option =>
			option.setName('nombre')
				.setDescription('Nombre de invocador')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('tag')
				.setDescription('Tag')
				.setRequired(true),
		),
	async execute(interaction) {
		let region = interaction.options.getString('region');
		let name = interaction.options.getString('nombre');
		name = name.toLowerCase();
		name = name.replace(' ', '%20');
		let tag = interaction.options.getString('tag');
		tag = tag.toLowerCase();
		await interaction.deferReply();
		try {
			let url = 'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/' + name + '/' + tag + '?api_key=' + riot;
			const user = await utils.parseJson(url);
			const id = user.puuid;
			const gameName = user.gameName + '#' + user.tagLine;
			url = 'https://' + region + '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/' + id + '?api_key=' + riot;
			const champMastery = await utils.parseJson(url);
			const favChamp = champMastery[0];
			url = 'https://ddragon.leagueoflegends.com/api/versions.json';
			const versions = await utils.parseJson(url);
			const version = versions[0];
			const locale = 'es_MX';
			url = 'https://ddragon.leagueoflegends.com/cdn/' + version + '/data/' + locale + '/champion.json';
			const responseChampions = await axios.get(url);
			let champion = Object.values(responseChampions.data.data).find(champ => champ.key === String(favChamp.championId));
			const champInf = [favChamp.championId, champion.name, champion.title, champion.blurb, champion.image.sprite, favChamp.championLevel, favChamp.championPoints];
			url = 'https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/' + id + '?api_key=' + riot;
			const accountInfo = await utils.parseJson(url);
			const lvl = accountInfo.summonerLevel;
			const accId = accountInfo.id;
			url = 'https://' + region + '.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/' + id + '?api_key=' + riot;
			const gameInfo = await utils.parseJson(url);
			let soloData = 'UNRANKED';
			let flexData = 'UNRANKED';
			const players = [];
			let status = '';
			try {
				status = gameInfo.status.status_code;
			}
			catch (error) {
				status = 200;
			}
			if (!(status === 404)) {
				await utils.sleep(1000);
				gameInfo.participants.forEach(async g => {
					url = 'https://' + region + '.api.riotgames.com/lol/league/v4/entries/by-summoner/' + g.summonerId + '?api_key=' + riot;
					const leagueInfo = await utils.parseJson(url);
					let sq = 'UNRANKED';
					let fq = 'UNRANKED';
					leagueInfo.forEach(q => {
						if (q.queueType === 'RANKED_SOLO_5x5') {
							sq = q.tier + ' ' + q.rank + '\nW: ' + q.wins + ' - L: ' + q.losses + ' (' + Math.round(q.wins / (q.wins + q.losses) * 100) + '%)';
						}
						if (q.queueType === 'RANKED_FLEX_SR') {
							fq = q.tier + ' ' + q.rank + '\nW: ' + q.wins + ' - L: ' + q.losses + ' (' + Math.round(q.wins / (q.wins + q.losses) * 100) + '%)';
						}
					});
					if (g.riotId === gameName) {
						soloData = sq;
						flexData = fq;
					}
					champion = await Object.values(responseChampions.data.data).find(champ => champ.key === String(g.championId));
					const imgURL = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + champion.name + '.png';
					players.push([g.riotId, champion.name, imgURL, sq, fq, g.teamId]);
				});
			}
			else {
				url = 'https://' + region + '.api.riotgames.com/lol/league/v4/entries/by-summoner/' + accId + '?api_key=' + riot;
				const leagueInfo = await utils.parseJson(url);
				leagueInfo.forEach(q => {
					if (q.queueType === 'RANKED_SOLO_5x5') {
						soloData = q.tier + ' ' + q.rank + '\nW: ' + q.wins + ' - L: ' + q.losses + ' (' + Math.round(q.wins / (q.wins + q.losses) * 100) + '%)';
					}
					if (q.queueType === 'RANKED_FLEX_SR') {
						flexData = q.tier + ' ' + q.rank + '\nW: ' + q.wins + ' - L: ' + q.losses + ' (' + Math.round(q.wins / (q.wins + q.losses) * 100) + '%)';
					}
				});
			}
			await utils.sleep(1000);
			regiones.forEach(r => {
				if (r[1] === region) {
					region = r[0];
				}
			});
			const embeds = [];
			let currentPage = 0;
			let embed = new EmbedBuilder()
				.setColor(COLORS.LIGHT_BLUE)
				.setTitle(region + ' : ' + gameName)
				.addFields(
					{ name: 'Nivel', value: lvl.toString(), inline: true },
					{ name: 'Solo', value: soloData, inline: true },
					{ name: 'Flex', value: flexData, inline: true },
				)
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + champInf[1] + '.png')
				.setDescription('Campeón Favorito\n\n' + champInf[1] + '\n' + champInf[2] + '\n' + ' lvl: ' + champInf[5] + ' puntos: ' + champInf[6] + '\n\n' + champInf[3])
				.setImage()
				.setFooter({ text: ' v' + version, iconURL: 'https://i.imgur.com/AfFp7pu.png' });
			embeds.push(embed);
			await utils.sleep(1000);
			if (players.length > 0) {
				let infoR = [];
				let infoB = [];
				const fieldNamesR = [];
				const fieldValuesR = [];
				const fieldNamesB = [];
				const fieldValuesB = [];
				players.forEach(p => {
					if (p[5] === 100) {
						fieldNamesB.push(p[0]);
						fieldValuesB.push(p[1] + '\n\nSolo: ' + p[3] + '\nFlex: ' + p[4] + '\n\u200B');
					}
					if (p[5] === 200) {
						fieldNamesR.push(p[0]);
						fieldValuesR.push(p[1] + '\n\nSolo: ' + p[3] + '\nFlex: ' + p[4] + '\n\u200B');
					}
					infoB = (fieldNamesB.map((n, i) => ({
						name: n,
						value: fieldValuesB[i],
						inline: true,
					})));
					infoR = (fieldNamesR.map((n, i) => ({
						name: n,
						value: fieldValuesR[i],
						inline: true,
					})));
				});
				const combinedInfo = [];
				const maxLength = Math.max(infoB.length, infoR.length);
				combinedInfo.push({ name: 'Lado Azul\u200B\u200B', value: '\u200B', inline: true });
				combinedInfo.push({ name: '\u200B', value: '\u200B', inline: true });
				combinedInfo.push({ name: 'Lado Rojo', value: '\u200B', inline: true });
				for (let i = 0; i < maxLength; i++) {
					if (infoB[i]) combinedInfo.push(infoB[i]);
					combinedInfo.push({ name: '\u200B', value: '\u200B', inline: true });
					if (infoR[i]) combinedInfo.push(infoR[i]);
				}
				embed = new EmbedBuilder()
					.setColor(COLORS.LIGHT_BLUE)
					.setTitle(region + ' : ' + gameName)
					.setDescription('Partida\n\n')
					.addFields(combinedInfo)
					.setThumbnail()
					.setFooter({ text: ' v' + version, iconURL: 'https://i.imgur.com/AfFp7pu.png' });
				embeds.push(embed);
				const buttons = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('Resumen')
						.setLabel('Resumen')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('Partida')
						.setLabel('Partida')
						.setStyle(ButtonStyle.Primary),
				);
				const reply = await interaction.editReply({ embeds: [embeds[currentPage]], components: [buttons] });
				const collector = reply.createMessageComponentCollector({ time: 60000 });
				collector.on('collect', async (int) => {
					if (!int.isButton()) return;
					if (int.customId === 'Resumen') {
						currentPage = 0;
					}
					else if (int.customId === 'Partida') {
						currentPage = 1;
					}
					await int.update({
						embeds: [embeds[currentPage]],
						components: [buttons],
					});
				});
			}
			else {
				await interaction.editReply({ embeds: [embeds[currentPage]] });
			}
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al mostrar info de invocador.');
		}
	},
};