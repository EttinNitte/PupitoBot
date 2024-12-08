const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
// const utils = require('../utils/utils.js');
const COLORS = require('../utils/colors.js');

const padoru = {
	data: new SlashCommandBuilder()
		.setName('padoru')
		.setDescription('padoru!'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const voiceChannel = interaction.member.voice.channel;
			const voiceState = interaction.guild.members.me.voice;
			let img = null;
			let desc = 'padoru';
			if (voiceChannel && !voiceState.channel) {
				img = 'https://i.pinimg.com/originals/97/1e/56/971e5662264562e5bf7cb8b39ada5df4.gif';
				play(interaction, 'https://www.youtube.com/watch?v=efdN69QscAg');
			}
			else {
				desc = 'https://www.youtube.com/watch?v=efdN69QscAg';
			}
			const embed = new EmbedBuilder()
				.setColor(COLORS.DARK_RED)
				.setTitle('Padoru')
				.setDescription(desc)
				.setImage(img);
			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.editReply('Ocurrió un error al ejecutar el comando');
		}
	},
};
async function play(interaction, query) {
	try {
		new URL(query);
		const songInfo = await ytdl.getInfo(query);
		const song = {
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
		};
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		const queueContruct = {
			textChannel: interaction.channel,
			voiceChannel: interaction.member.voice.channel,
			connection: connection,
			songs: [ song ],
			volume: 5,
			playing: true,
		};
		const audioPlayer = createAudioPlayer();
		const audioResource = createAudioResource(
			ytdl(song.url, {
				filter: 'audioonly',
				highWaterMark: 1 << 25,
			}),
			{ inlineVolume: true },
		);
		audioResource.volume.setVolume(0.25);
		queueContruct.connection.subscribe(audioPlayer);
		audioPlayer.play(audioResource);
		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			queueContruct.connection.destroy();
		});
		audioPlayer.on('error', async error => {
			console.error(error.message);
		});
	}
	catch (error) {
		console.log(error);
	}
}
module.exports = [ padoru ];