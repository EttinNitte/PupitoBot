const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const utils = require('../utils/utils.js');
const he = require('he');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('Get a trivia question with multiple choice answers!'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			// Fetch the trivia question
			const response = await fetch('https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple');
			const data = await response.json();
			if (data.response_code !== 0 || data.results.length === 0) {
				await interaction.editReply('Could not fetch a trivia question. Please try again later.');
				return;
			}
			const questionData = data.results[0];
			const {
				question: rawQuestion,
				correct_answer: rawCorrectAnswer,
				incorrect_answers: rawIncorrectAnswers,
				category: rawCategory,
				difficulty,
			} = questionData;
			let question = he.decode(rawQuestion);
			let correct_answer = he.decode(rawCorrectAnswer);
			let incorrect_answers = rawIncorrectAnswers.map(answer => he.decode(answer));
			let category = he.decode(rawCategory);
			const translated = await utils.translate([question, correct_answer, category, ...incorrect_answers], 'es');
			question = translated[0];
			correct_answer = translated[1];
			category = translated[2];
			incorrect_answers = translated.slice(3);
			const answers = [...incorrect_answers, correct_answer].sort(() => Math.random() - 0.5);
			const buttons = new ActionRowBuilder().addComponents(
				answers.map((answer, index) =>
					new ButtonBuilder()
						.setCustomId(`trivia_${index}`)
						.setLabel(answer)
						.setStyle(ButtonStyle.Primary),
				),
			);
			const embed = new EmbedBuilder()
				.setColor(0x1e90ff)
				.setTitle('🎉 Trivia Time!')
				.addFields(
					{ name: 'Category', value: category, inline: true },
					{ name: 'Difficulty', value: difficulty, inline: true },
					{ name: '\u200B', value: question, inline: false },
				);
			await interaction.editReply({ embeds: [embed], components: [buttons] });
			const filter = i => i.customId.startsWith('trivia_') && i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
			collector.on('collect', async i => {
				const answerIndex = parseInt(i.customId.split('_')[1], 10);
				const selectedAnswer = answers[answerIndex];
				if (selectedAnswer === correct_answer) {
					await i.reply({ content: '🎉 Correcto!', ephemeral: true });
				}
				else {
					await i.reply({ content: `❌ Incorrecto la respuesta correcta era:  **${correct_answer}**.`, ephemeral: true });
				}
				collector.stop();
			});
			collector.on('end', async collected => {
				if (collected.size === 0) {
					await interaction.editReply({
						content: '⏰ Time ran out! No one answered the question.',
						components: [],
					});
				}
				else {
					await interaction.editReply({ components: [] });
				}
			});
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('An error occurred while fetching the trivia question.');
		}
	},
};