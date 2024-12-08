const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const utils = require('../utils/utils.js');
const COLORS = require('../utils/colors.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Sends a random cat'),
	async execute(interaction) {
		const cat = await utils.parseJson('https://api.thecatapi.com/v1/images/search');
		const fact = await utils.parseJson('https://catfact.ninja/fact');
		const desc = await utils.translate(fact.fact, 'es');
		await interaction.deferReply();
		try {
			const embed = new EmbedBuilder()
				.setColor(COLORS.YELLOW)
				.setTitle('Random cat')
				.setDescription(desc[0])
				.setImage(cat[0].url);
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al ejecutar el comando');
		}
	},
};