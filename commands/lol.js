const { riot } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const utils = require('../utils/utils.js');
const axios = require('axios');
const regiones = [['LAS', 'la2'], ['LAN', 'la1'], ['NA', 'na']];
module.exports = {
	data: new SlashCommandBuilder()
		.setName('plol')
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
			const response = await axios.get(url);
			const champion = Object.values(response.data.data).find(champ => champ.key === String(favChamp.championId));
			const champInf = [favChamp.championId, champion.name, champion.title, champion.blurb, champion.image.sprite, favChamp.championLevel, favChamp.championPoints];
			url = 'https://' + region + '.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/' + id + '?api_key=' + riot;
			const accountInfo = await utils.parseJson(url);
			const lvl = accountInfo.summonerLevel;
			const accId = accountInfo.id;
			url = 'https://' + region + '.api.riotgames.com/lol/league/v4/entries/by-summoner/' + accId + '?api_key=' + riot;
			const leagueInfo = await utils.parseJson(url);
			let soloData = 'UNRANKED';
			let flexData = 'UNRANKED';
			leagueInfo.forEach(q => {
				if (q.queueType === 'RANKED_SOLO_5x5') {
					soloData = q.tier + ' ' + q.rank + '\nW: ' + q.wins + ' - L: ' + q.losses + ' (' + Math.round(q.wins / (q.wins + q.losses) * 100) + '%)';
				}
				if (q.queueType === 'RANKED_FLEX_SR') {
					flexData = q.tier + ' ' + q.rank + '\nW: ' + q.wins + ' - L: ' + q.losses + ' (' + Math.round(q.wins / (q.wins + q.losses) * 100) + '%)';
				}
			});
			regiones.forEach(r => {
				if (r[1] === region) {
					region = r[0];
				}
			});
			const embed = new EmbedBuilder()
				.setColor('#804000')
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
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al mostrar info de invocador.');
		}
	},
};