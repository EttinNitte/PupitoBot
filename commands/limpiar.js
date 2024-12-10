const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('limpiar')
		.setDescription('Elimina los mensajes recientes del bot en este canal'),
	async execute(interaction) {
		if (!interaction.member.permissions.has('ManageMessages')) {
			return interaction.reply({
				content: 'No tienes permiso para usar este comando.',
				ephemeral: true,
			});
		}
		const cantidad = 50;
		const mensajes = await interaction.channel.messages.fetch({ limit: cantidad });
		const mensajesBot = mensajes.filter(msg => msg.author.bot);
		if (mensajesBot.size === 0) {
			return interaction.reply({
				content: 'No se encontraron mensajes del bot para eliminar.',
				ephemeral: true,
			});
		}
		await interaction.channel.bulkDelete(mensajes, true);
		return interaction.reply({
			content: `Se eliminaron ${mensajesBot.size} mensajes del bot.`,
			ephemeral: true,
		});
	},
};
