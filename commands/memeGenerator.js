const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { imgflip_1, imgflip_2 } = require('../config.json');

const memeTemplates1 = [
	{ name: 'Drake Hotline Bling', id: '181913649' },
	{ name: 'Two Buttons', id: '87743020' },
	{ name: 'Distracted Boyfriend', id: '112126428' },
	{ name: 'Bernie I Am Once Again Asking For Your Support', id: '222403160' },
	{ name: 'Left Exit 12 Off Ramp', id: '124822590' },
	{ name: 'UNO Draw 25 Cards', id: '217743513' },
	{ name: 'Running Away Balloon', id: '131087935' },
	{ name: 'Disaster Girl', id: '97984' },
	{ name: 'Epic Handshake', id: '135256802' },
	{ name: 'Change My Mind', id: '129242436' },
	{ name: 'Marked Safe From', id: '161865971' },
	{ name: 'Always Has Been', id: '252600902' },
	{ name: 'Sad Pablo Escobar', id: '80707627' },
	{ name: 'Batman Slapping Robin', id: '438680' },
	{ name: 'Waiting Skeleton', id: '4087833' },
	{ name: 'Anakin Padme 4 Panel', id: '322841258' },
	{ name: 'Woman Yelling At Cat', id: '188390779' },
	{ name: 'Buff Doge vs. Cheems', id: '247375501' },
	{ name: 'X, X Everywhere', id: '91538330' },
	{ name: 'I Bet He\'s Thinking About Other Women', id: '110163934' },
	{ name: 'Trade Offer', id: '309868304' },
	{ name: 'Mocking Spongebob', id: '102156234' },
	{ name: 'Expanding Brain', id: '93895088' },
	{ name: 'Tuxedo Winnie The Pooh', id: '178591752' },
	{ name: 'Bike Fall', id: '79132341' },
];
const memeTemplates2 = [
	{ name: 'One Does Not Simply', id: '61579' },
	{ name: 'Bernie Sanders Once Again Asking', id: '224015000' },
	{ name: 'Monkey Puppet', id: '148909805' },
	{ name: 'They\'re The Same Picture', id: '180190441' },
	{ name: 'Boardroom Meeting Suggestion', id: '1035805' },
	{ name: 'Success Kid', id: '61544' },
	{ name: 'Y\'all Got Any More Of That', id: '124055727' },
	{ name: 'Mother Ignoring Kid Drowning In A Pool', id: '252758727' },
	{ name: 'Ancient Aliens', id: '101470' },
	{ name: 'Hide the Pain Harold', id: '27813981' },
	{ name: 'This Is Where I\'d Put My Trophy If I Had One', id: '3218037' },
	{ name: 'Is This A Pigeon', id: '100777631' },
	{ name: 'Clown Applying Makeup', id: '195515965' },
	{ name: 'Oprah You Get A', id: '28251713' },
	{ name: 'This Is Fine', id: '55311130' },
	{ name: 'Flex Tape', id: '166969924' },
	{ name: 'Trump Bill Signing', id: '91545132' },
	{ name: 'Megamind peeking', id: '370867422' },
	{ name: 'You Guys are Getting Paid', id: '177682295' },
	{ name: 'Blank Nut Button', id: '119139145' },
	{ name: 'They don\'t know', id: '284929871' },
	{ name: 'A train hitting a school bus', id: '247113703' },
	{ name: 'Surprised Pikachu', id: '155067746' },
	{ name: 'Roll Safe Think About It', id: '89370399' },
	{ name: 'Squidward window', id: '67452763' },
];
const memeTemplates3 = [
	{ name: 'where monkey', id: '316466202' },
	{ name: '0 days without (Lenny, Simpsons)', id: '427308417' },
	{ name: 'Laughing Leo', id: '259237855' },
	{ name: 'Whisper and Goosebumps', id: '101956210' },
	{ name: 'Sleeping Shaq', id: '99683372' },
	{ name: 'Evil Kermit', id: '84341851' },
	{ name: 'Inhaling Seagull', id: '114585149' },
	{ name: 'Panik Kalm Panik', id: '226297822' },
	{ name: 'Bell Curve', id: '533936279' },
	{ name: 'Soldier protecting sleeping child', id: '171305372' },
	{ name: 'AJ Styles & Undertaker', id: '234202281' },
	{ name: 'Who Killed Hannibal', id: '135678846' },
	{ name: 'The Rock Driving', id: '21735' },
	{ name: 'Types of Headaches meme', id: '119215120' },
	{ name: 'Grandma Finds The Internet', id: '61556' },
	{ name: 'Grant Gustin over grave', id: '221578498' },
	{ name: 'Domino Effect', id: '162372564' },
	{ name: 'All My Homies Hate', id: '216523697' },
	{ name: 'American Chopper Argument', id: '134797956' },
	{ name: 'Leonardo Dicaprio Cheers', id: '5496396' },
	{ name: 'Pawn Stars Best I Can Do', id: '77045868' },
	{ name: 'Two guys on a bus', id: '354700819' },
	{ name: 'Disappointed Black Guy', id: '50421420' },
	{ name: 'Anime Girl Hiding from Terminator', id: '224514655' },
	{ name: 'Futurama Fry', id: '61520' },
];
const memeTemplates4 = [
	{ name: 'Three-headed Dragon', id: '187102311' },
	{ name: 'The Scroll Of Truth', id: '123999232' },
	{ name: 'Third World Skeptical Kid', id: '101288' },
	{ name: 'whe i\'m in a competition and my opponent is', id: '360597639' },
	{ name: 'Star Wars Yoda', id: '14371066' },
	{ name: 'Look At Me', id: '29617627' },
	{ name: 'spiderman pointing at spiderman', id: '110133729' },
	{ name: 'Drake Blank', id: '91998305' },
	{ name: 'Friendship ended', id: '137501417' },
	{ name: 'Finding Neverland', id: '6235864' },
	{ name: 'Megamind no bitches', id: '371619279' },
	{ name: 'is this butterfly', id: '142009471' },
	{ name: 'Spongebob Ight Imma Head Out', id: '196652226' },
	{ name: 'Spider Man Triple', id: '206151308' },
	{ name: 'George Bush 9/11', id: '208915813' },
	{ name: 'Gus Fring we are not the same', id: '342785297' },
	{ name: 'Spirit Halloween', id: '419642439' },
	{ name: 'say the line bart! simpsons', id: '72525473' },
	{ name: 'c\'mon do something', id: '20007896' },
	{ name: 'Scooby doo mask reveal', id: '145139900' },
	{ name: 'Charlie Conspiracy (Always Sunny in Philidelphia)', id: '92084495' },
	{ name: 'Goose Chase', id: '398221598' },
	{ name: 'The Most Interesting Man In The World', id: '61532' },
	{ name: 'patrick to do list actually blank', id: '247756783' },
];

const meme1 = {
	data: new SlashCommandBuilder()
		.setName('meme1')
		.setDescription('Genera un meme usando una plantilla popular')
		.addStringOption(option => {
			// Define a string option for meme templates
			option.setName('plantilla')
				.setDescription('Seleccione una plantilla para el meme')
				.setRequired(true);
			memeTemplates1.forEach(template => {
				option.addChoices({ name: template.name, value: template.id });
			});
			return option;
		})
		.addStringOption(option =>
			option.setName('texto_superior')
				.setDescription('El texto superior del meme')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('texto_inferior')
				.setDescription('El texto inferior del meme')
				.setRequired(true),
		),
	async execute(interaction) {
		const plantilla = interaction.options.getString('plantilla');
		const txtUp = interaction.options.getString('texto_superior');
		const txtDwn = interaction.options.getString('texto_inferior');
		await interaction.deferReply();
		try {
			const response = await axios.post('https://api.imgflip.com/caption_image', {}, {
				params: {
					template_id: parseInt(plantilla),
					username: imgflip_1,
					password: imgflip_2,
					text0: txtUp,
					text1: txtDwn,
				},
			});
			if (response.data.success) {
				const memeUrl = response.data.data.url;
				await interaction.editReply(`Aquí tienes tu meme: ${memeUrl}`);
			}
			else {
				await interaction.editReply('Hubo un error al generar el meme. Verifica el nombre de la plantilla.');
			}
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al intentar generar el meme.');
		}
	},

};
const meme2 = {
	data: new SlashCommandBuilder()
		.setName('meme2')
		.setDescription('Genera un meme usando una plantilla popular')
		.addStringOption(option => {
			// Define a string option for meme templates
			option.setName('plantilla')
				.setDescription('Seleccione una plantilla para el meme')
				.setRequired(true);
			memeTemplates2.forEach(template => {
				option.addChoices({ name: template.name, value: template.id });
			});
			return option;
		})
		.addStringOption(option =>
			option.setName('texto_superior')
				.setDescription('El texto superior del meme')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('texto_inferior')
				.setDescription('El texto inferior del meme')
				.setRequired(true),
		),
	async execute(interaction) {
		const plantilla = interaction.options.getString('plantilla');
		const txtUp = interaction.options.getString('texto_superior');
		const txtDwn = interaction.options.getString('texto_inferior');
		await interaction.deferReply();
		try {
			const response = await axios.post('https://api.imgflip.com/caption_image', {}, {
				params: {
					template_id: parseInt(plantilla),
					username: imgflip_1,
					password: imgflip_2,
					text0: txtUp,
					text1: txtDwn,
				},
			});
			if (response.data.success) {
				const memeUrl = response.data.data.url;
				await interaction.editReply(`Aquí tienes tu meme: ${memeUrl}`);
			}
			else {
				await interaction.editReply('Hubo un error al generar el meme. Verifica el nombre de la plantilla.');
			}
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al intentar generar el meme.');
		}
	},
};
const meme3 = {
	data: new SlashCommandBuilder()
		.setName('meme3')
		.setDescription('Genera un meme usando una plantilla popular')
		.addStringOption(option => {
			// Define a string option for meme templates
			option.setName('plantilla')
				.setDescription('Seleccione una plantilla para el meme')
				.setRequired(true);
			memeTemplates3.forEach(template => {
				option.addChoices({ name: template.name, value: template.id });
			});
			return option;
		})
		.addStringOption(option =>
			option.setName('texto_superior')
				.setDescription('El texto superior del meme')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('texto_inferior')
				.setDescription('El texto inferior del meme')
				.setRequired(true),
		),
	async execute(interaction) {
		const plantilla = interaction.options.getString('plantilla');
		const txtUp = interaction.options.getString('texto_superior');
		const txtDwn = interaction.options.getString('texto_inferior');
		await interaction.deferReply();
		try {
			const response = await axios.post('https://api.imgflip.com/caption_image', {}, {
				params: {
					template_id: parseInt(plantilla),
					username: imgflip_1,
					password: imgflip_2,
					text0: txtUp,
					text1: txtDwn,
				},
			});
			if (response.data.success) {
				const memeUrl = response.data.data.url;
				await interaction.editReply(`Aquí tienes tu meme: ${memeUrl}`);
			}
			else {
				await interaction.editReply('Hubo un error al generar el meme. Verifica el nombre de la plantilla.');
			}
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al intentar generar el meme.');
		}
	},
};
const meme4 = {
	data: new SlashCommandBuilder()
		.setName('meme4')
		.setDescription('Genera un meme usando una plantilla popular')
		.addStringOption(option => {
			// Define a string option for meme templates
			option.setName('plantilla')
				.setDescription('Seleccione una plantilla para el meme')
				.setRequired(true);
			memeTemplates4.forEach(template => {
				option.addChoices({ name: template.name, value: template.id });
			});
			return option;
		})
		.addStringOption(option =>
			option.setName('texto_superior')
				.setDescription('El texto superior del meme')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('texto_inferior')
				.setDescription('El texto inferior del meme')
				.setRequired(true),
		),
	async execute(interaction) {
		const plantilla = interaction.options.getString('plantilla');
		const txtUp = interaction.options.getString('texto_superior');
		const txtDwn = interaction.options.getString('texto_inferior');
		await interaction.deferReply();
		try {
			const response = await axios.post('https://api.imgflip.com/caption_image', {}, {
				params: {
					template_id: parseInt(plantilla),
					username: imgflip_1,
					password: imgflip_2,
					text0: txtUp,
					text1: txtDwn,
				},
			});
			if (response.data.success) {
				const memeUrl = response.data.data.url;
				await interaction.editReply(`Aquí tienes tu meme: ${memeUrl}`);
			}
			else {
				await interaction.editReply('Hubo un error al generar el meme. Verifica el nombre de la plantilla.');
			}
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al intentar generar el meme.');
		}
	},
};
module.exports = [ meme1, meme2, meme3, meme4 ];
