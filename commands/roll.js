const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const utils = require('../utils/utils.js');
const COLORS = require('../utils/colors.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('proll')
		.setDescription('Rolls a dice')
		.addStringOption(option => option
			.setName('dice')
			.setDescription('Type of dice')
			.setRequired(true)
			.addChoices(
				{ name: 'd2', value: 'd2' },
				{ name: 'd4', value: 'd4' },
				{ name: 'd6', value: 'd6' },
				{ name: 'd8', value: 'd8' },
				{ name: 'd10', value: 'd10' },
				{ name: 'd12', value: 'd12' },
				{ name: 'd20', value: 'd20' },
				{ name: 'd100', value: 'd100' },
			))
		.addStringOption(option => option.setName('number').setDescription('number of dice').setRequired(true))
		.addStringOption(option => option.setName('modifier').setDescription('modifier').setRequired(false))
		.addStringOption(option => option.setName('subtract').setDescription('subtract a number of dices').setRequired(false)),
	async execute(interaction) {
		const dice = interaction.options.get('dice').value;
		const number = interaction.options.getString('number');
		const modifier = interaction.options.getString('modifier');
		const subtract = interaction.options.getString('subtract');
		function isPositiveInteger(value) {
			const regex = /^[1-9]\d*$/;
			return regex.test(value);
		}
		function isSignedInteger(value) {
			const regex = /^[+-]?\d+$/;
			return regex.test(value);
		}
		if (!isPositiveInteger(number)) {
			await interaction.reply('Opción "Number" no es un número');
		}
		else if (modifier && !isSignedInteger(modifier)) {
			await interaction.reply('Opción "Modifier" no es un modificador valido');
		}
		else if (subtract && !isPositiveInteger(subtract)) {
			await interaction.reply('Opción "Substract" no es un número');
		}
		else {
			try {
				let str = '';
				let total = 0;
				let embed = new EmbedBuilder()
					.setColor(COLORS.SILVER)
					.setTitle(`Rolling - ${number}${dice}`)
					.setDescription(`*You rolled: ${str} \n Total: ${total}*`);
				await interaction.reply({ embeds: [embed] });
				let numbers = [];
				for (let i = 0; i < parseInt(number); i++) {
					const n = await utils.randomInt(1, parseInt(dice.replace('d', '')));
					numbers.push(n);
				}
				if (subtract) {
					numbers.sort((a, b) => a - b);
					numbers = numbers.slice(parseInt(subtract));
				}
				numbers.forEach((n, i) => {
					let j = `${i + 1}`;
					let no = `${n}`;
					while (!(no.length === parseInt(dice.replace('d', '').length))) {
						no = '0' + no;
					}
					while (!(j.length === number.length)) {
						j = '0' + j;
					}
					str += `${dice}[${j}]: **${no}** `;
					if (j % 5 === 0) {
						str += '\n';
					}
					total += n;
				});
				if (modifier) {
					total += parseInt(modifier);
				}
				embed = new EmbedBuilder()
					.setColor(COLORS.GOLD)
					.setTitle(`Rolling - ${number}${dice}`)
					.setDescription(`You rolled:\n ${str} \n **Total: ${total}**`)
					.setImage();
				await interaction.editReply({ embeds: [embed] });
			}
			catch (error) {
				console.error(error);
				await interaction.editReply('Error al Ejecutar Comando');
			}
		}
	},
};