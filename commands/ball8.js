const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bola8')
		.setDescription('Haz una pregunta y la bola 8 te responderá.')
		.addStringOption(option =>
			option.setName('pregunta')
				.setDescription('Tu pregunta para la bola 8')
				.setRequired(true),
		),
	async execute(interaction) {
		const respuestas = [
			'Sí.', 'No.', 'Tal vez.', 'Definitivamente.', 'No cuentes con ello.',
			'Pregunta más tarde.', 'Es probable.', 'No estoy seguro.',
		];
		const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
		interaction.reply(`🎱 **Respuesta:** ${respuesta}`);
	},
};
