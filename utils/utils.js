const { request } = require('undici');
async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}
	return JSON.parse(fullBody);
}
module.exports = {
	translate: async function(txt, language) {
		language;
		if (Array.isArray(txt)) {
			try {
				const translatedArray = await translateTextArray(txt, language);
				return translatedArray;
			}
			catch (err) {
				console.error('Error translating array:', err);
				return txt;
			}
		}
		else {
			return [ await translateText(txt, language) ];
		}
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
async function translateText(t, language) {
	const res = await fetch('http://127.0.0.1:5000/translate', {
		method: 'POST',
		body: JSON.stringify({
			q: t,
			source: 'auto',
			target: language,
			format: 'text',
			alternatives: 3,
			api_key: '',
		}),
		headers: { 'Content-Type': 'application/json' },
	});
	const rawText = await res.text();
	try {
		const data = JSON.parse(rawText);
		if (t === data.translatedText) {
			return t;
		}
		return data.translatedText + '\n(' + (t + ')' || 'Translation failed' + ')');
	}
	catch (err) {
		console.error('Failed to parse JSON:', err.message);
		return t;
	}
}
async function translateTextArray(txt, language) {
	const translatedArray = await Promise.all(
		txt.map(async (t) => {
			const res = await fetch('http://127.0.0.1:5000/translate', {
				method: 'POST',
				body: JSON.stringify({
					q: t,
					source: 'auto',
					target: language,
					format: 'text',
					alternatives: 3,
					api_key: '',
				}),
				headers: { 'Content-Type': 'application/json' },
			});
			const rawText = await res.text();
			try {
				const data = JSON.parse(rawText);
				if (t === data.translatedText) {
					return t;
				}
				return data.translatedText + '\n(' + (t + ')' || 'Translation failed' + ')');
			}
			catch (err) {
				console.error('Failed to parse JSON:', err.message);
				return t;
			}
		}),
	);
	return translatedArray;
}