const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const utils = require('../utils/utils.js');
const he = require('he');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_database.db');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('Get a trivia question with multiple choice answers!'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const userId = interaction.user.id;
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
				db.get(
					'SELECT * FROM TRIVIA WHERE user_id = ?',
					[userId],
					async (err, row) => {
						if (err) return console.error(err);
						if (selectedAnswer === correct_answer) {
							const bonus = row ? row.streak * 5 : 0;
							const newScore = (row ? row.score : 0) + 10 + bonus;
							const newStreak = (row ? row.streak : 0) + 1;
							if (row) {
								db.run(
									'UPDATE TRIVIA SET score = ?, streak = ? WHERE user_id = ?',
									[newScore, newStreak, userId],
								);
							}
							else {
								db.run(
									'INSERT INTO TRIVIA (user_id, score, streak) VALUES (?, ?, ?)',
									[userId, 10, 1],
								);
							}
							await i.reply({ content: '🎉 Correcto!', ephemeral: true });
						}
						else {
							const penalty = row ? row.score - 5 : 0;
							const newScore = Math.max(penalty, 0);
							if (row) {
								db.run(
									'UPDATE TRIVIA SET score = ?, streak = 0 WHERE user_id = ?',
									[newScore, userId],
								);
							}
							else {
								db.run(
									'INSERT INTO TRIVIA (user_id, score, streak) VALUES (?, ?, ?)',
									[userId, 0, 0],
								);
							}
							await i.reply({ content: `❌ Incorrecto la respuesta correcta era:  **${correct_answer}**.`, ephemeral: true });
						}
					},
				);
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