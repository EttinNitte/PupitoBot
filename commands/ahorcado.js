const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ahorcado')
		.setDescription('Juega al ahorcado interactuando solo con texto.'),
	async execute(interaction) {
		const palabras = ['javascript', 'discord', 'bot', 'programacion', 'computadora'];
		const palabra = palabras[Math.floor(Math.random() * palabras.length)].toLowerCase();
		let intentos = 6;
		const progreso = '_ '.repeat(palabra.length).trim().split(' ');
		const letrasUsadas = new Set();
		await interaction.deferReply();
		await interaction.editReply({
			embeds: [
				{
					color: 0x5865f2,
					title: '🎮 Ahorcado',
					description: `Palabra: \`${progreso.join(' ')}\`\nIntentos restantes: ${intentos}\nLetras usadas: Ninguna\n\nEscribe una letra en el chat para jugar.`,
				},
			],
		});
		const messageCollector = interaction.channel.createMessageCollector({
			filter: msg => msg.author.id === interaction.user.id,
			time: 60000,
		});
		messageCollector.on('collect', async message => {
			const letra = message.content.toLowerCase();
			if (letra.length !== 1 || !/[a-z]/.test(letra)) {
				interaction.channel.send('❌ Solo puedes ingresar **una letra válida** (a-z).');
				await message.delete().catch(console.error);
				return;
			}
			if (letrasUsadas.has(letra)) {
				interaction.channel.send('⚠️ Ya has usado esta letra. Prueba con otra.');
				await message.delete().catch(console.error);
				return;
			}
			await message.delete().catch(console.error);
			letrasUsadas.add(letra);
			if (palabra.includes(letra)) {
				for (let i = 0; i < palabra.length; i++) {
					if (palabra[i] === letra) {
						progreso[i] = letra;
					}
				}
			}
			else {
				intentos--;
			}
			if (progreso.join('') === palabra) {
				messageCollector.stop('win');
			}
			else if (intentos <= 0) {
				messageCollector.stop('lose');
			}
			else {
				interaction.editReply({
					embeds: [
						{
							color: 0x5865f2,
							title: '🎮 Ahorcado',
							description: `Palabra: \`${progreso.join(' ')}\`\nIntentos restantes: ${intentos}\nLetras usadas: ${Array.from(letrasUsadas).join(', ')}`,
						},
					],
				});
			}
		});
		messageCollector.on('end', (_, reason) => {
			let finalMessage;
			if (reason === 'win') {
				finalMessage = `🎉 ¡Felicidades! Adivinaste la palabra: **${palabra}**`;
			}
			else if (reason === 'lose') {
				finalMessage = `💀 ¡Perdiste! La palabra era: **${palabra}**`;
			}
			else {
				finalMessage = '⏳ Tiempo agotado. Inténtalo de nuevo más tarde.';
			}
			interaction.editReply({
				embeds: [
					{
						color: 0x5865f2,
						title: '🎮 Ahorcado',
						description: finalMessage,
					},
				],
			});
		});
	},
};
