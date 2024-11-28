const points = require('../utils/points.js');
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isButton()) return;
		const p = await points.addPoint(1, interaction);
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction. and have: ${p} points`);
	},
};
