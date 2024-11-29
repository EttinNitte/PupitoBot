const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

const queue = new Map();

function play(guild, song, interaction) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		if (serverQueue?.connection) {
			serverQueue.connection.destroy();
		}
		queue.delete(guild.id);
		return;
	}
	const audioPlayer = createAudioPlayer();
	const audioResource = createAudioResource(
		ytdl(song.url, {
			filter: 'audioonly',
			highWaterMark: 1 << 25,
		}),
		{ inlineVolume: true },
	);
	audioResource.volume.setVolume(0.25);
	serverQueue.connection.subscribe(audioPlayer);
	audioPlayer.play(audioResource);
	audioPlayer.on(AudioPlayerStatus.Idle, () => {
		serverQueue.songs.shift();
		play(guild, serverQueue.songs[0], interaction);
	});

	audioPlayer.on('error', error => {
		console.error(error.message);
		interaction.editReply(`Error playing **${song.title}** Error: ${error.message}`);
	});
	interaction.editReply(`Start playing: **${song.title}**`);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oplay')
		.setDescription('Play a song in your channel!')
		.addStringOption(option => option.setName('query').setDescription('The song you want to play').setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const query = interaction.options.getString('query');
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) return await interaction.editReply('Connect to a Voice Channel!');
		const serverQueue = queue.get(interaction.guild.id);
		try {
			const songInfo = await ytdl.getInfo(query);
			const song = {
				title: songInfo.videoDetails.title,
				url: songInfo.videoDetails.video_url,
			};
			if (!serverQueue) {
				const queueContruct = {
					textChannel: interaction.channel,
					voiceChannel: voiceChannel,
					connection: null,
					songs: [],
					volume: 5,
					playing: true,
				};
				queue.set(interaction.guild.id, queueContruct);
				queueContruct.songs.push(song);
				try {
					const connection = joinVoiceChannel({
						channelId: voiceChannel.id,
						guildId: interaction.guild.id,
						adapterCreator: interaction.guild.voiceAdapterCreator,
					});
					queueContruct.connection = connection;
					play(interaction.guild, queueContruct.songs[0], interaction);
				}
				catch (err) {
					console.log(err);
					queue.delete(interaction.guild.id);
					await interaction.editReply('I could not join the voice channel!');
				}
			}
			else {
				serverQueue.songs.push(song);
				await interaction.editReply(`${song.title} has been added to the queue!`);
			}
		}
		catch (error) {
			console.error('Error playing audio:', error.message);
			await interaction.editReply('There was an error trying to execute that command: ' + error.message);
		}
	},
};