const { request } = require('undici');

async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}
	return JSON.parse(fullBody);
}
async function parseJson(url) {
	const result = await request(url);
	const json = await getJSONResponse(result.body);
	return json;
}
module.exports = {
	translate: async function(text, language) {
		text = text.replaceAll(' ', '%20');
		text = await parseJson(`https://api.mymemory.translated.net/get?q=${text}&langpair=en|${language}`);
		text = text.responseData.translatedText;
		return text;
	},
	randomInt: async function(min, max) {
		return Math.floor(Math.random() * ((max + 1) - min)) + min;
	},
	sleep: async function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	parseJson: async function(url) {
		const result = await request(url);
		const json = await getJSONResponse(result.body);
		return json;
	},
	validateRole: async function(requiredRole, interaction) {
		const hasRole = interaction.member.roles.cache.some(role => role.name === requiredRole);
		if (!hasRole) {
			await interaction.reply({
				content: 'You do not have the required role to execute this command.',
				ephemeral: true,
			});
			return false;
		}
		else {
			return true;
		}
	},
};