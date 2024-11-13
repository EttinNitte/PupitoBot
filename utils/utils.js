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
	translate: async function(text) {
		text = text.replaceAll(' ', '%20');
		text = await parseJson(`https://api.mymemory.translated.net/get?q=${text}&langpair=en|es`);
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
};