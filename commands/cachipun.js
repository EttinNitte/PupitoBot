const { SlashCommandBuilder } = require('discord.js');
const opciones = ['piedra', 'papel', 'tijera'];
module.exports = {
	data: new SlashCommandBuilder()
		.setName('piedrapapelotijera')
		.setDescription('Juega piedra, papel o tijera contra el bot.')
		.addStringOption(option => {
			option.setName('elección')
				.setDescription('Seleccione piedra papel o tijera')
				.setRequired(true);
			opciones.forEach(op => {
				option.addChoices({ name: op, value: op });
			});
			return option;
		}),
	async execute(interaction) {
		const eleccionUsuario = interaction.options.getString('elección').toLowerCase();
		const eleccionBot = opciones[Math.floor(Math.random() * opciones.length)];

		if (!opciones.includes(eleccionUsuario)) {
			return interaction.reply('Esa no es una opción válida. Elige piedra, papel o tijera.');
		}

		let resultado = '';
		if (eleccionUsuario === eleccionBot) {
			resultado = '¡Es un empate!';
		}
		else if (
			(eleccionUsuario === 'piedra' && eleccionBot === 'tijera') ||
            (eleccionUsuario === 'papel' && eleccionBot === 'piedra') ||
            (eleccionUsuario === 'tijera' && eleccionBot === 'papel')
		) {
			resultado = '¡Ganaste!';
		}
		else {
			resultado = 'Perdiste.';
		}

		interaction.reply(`Elegiste: ${eleccionUsuario}\nEl bot eligió: ${eleccionBot}\n**${resultado}**`);
	},
};
