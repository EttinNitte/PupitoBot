const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ahorcado')
		.setDescription('Juega al ahorcado con temas de anime interactuando solo con texto.'),
	async execute(interaction) {
		const anime = await getRandomAnime();
		if (!anime) {
			return interaction.reply('❌ No pude obtener un anime para el juego. Inténtalo de nuevo más tarde.');
		}
		const palabra = anime.title.toLowerCase().replace(/[^a-z\s]/g, '');
		const genero = anime.genres.map(g => g.name).join(', ') || 'Desconocido';
		const año = anime.aired.string || 'Desconocido';
		let intentos = 6;
		const progreso = palabra.split('').map(char => (char === ' ' ? ' ' : '_'));
		const letrasUsadas = new Set();
		await interaction.deferReply();
		await interaction.editReply({
			embeds: [
				{
					color: 0x5865f2,
					title: '🎮 Ahorcado (Anime)',
					description: `Palabra: \`${progreso.join(' ')}\`\nIntentos restantes: ${intentos}\nLetras usadas: Ninguna\n\n**Pistas**:  
                    Género: \`${genero}\`  
                    Año: \`${año}\`  
                    Escribe una letra en el chat para jugar.`,
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
			let acierto = false;
			for (let i = 0; i < palabra.length; i++) {
				if (palabra[i] === letra) {
					progreso[i] = letra;
					acierto = true;
				}
			}
			if (!acierto) {
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
							title: '🎮 Ahorcado (Anime)',
							description: `Palabra: \`${progreso.join(' ')}\`\nIntentos restantes: ${intentos}\nLetras usadas: ${Array.from(letrasUsadas).join(', ')}\n\n**Pistas**:  
                            Género: \`${genero}\`  
                            Año: \`${año}\``,
						},
					],
				});
			}
		});

		messageCollector.on('end', (_, reason) => {
			let finalMessage;
			if (reason === 'win') {
				finalMessage = `🎉 ¡Felicidades! Adivinaste el anime: **${anime.title}**`;
			}
			else if (reason === 'lose') {
				finalMessage = `💀 ¡Perdiste! El anime era: **${anime.title}**`;
			}
			else {
				finalMessage = `⏳ Tiempo agotado. El anime era: **${anime.title}**`;
			}
			interaction.editReply({
				embeds: [
					{
						color: 0x5865f2,
						title: '🎮 Ahorcado (Anime)',
						description: finalMessage,
					},
				],
			});
		});
	},
};
async function getRandomAnime() {
	try {
		const response = await axios.get('https://api.jikan.moe/v4/random/anime');
		return response.data.data;
	}
	catch (error) {
		console.error('Error al obtener el anime:', error);
		return null;
	}
}