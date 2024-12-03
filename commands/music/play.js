const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ytsr = require('ytsr');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot_database.db');

const queue = new Map();
let serverQueue = new Map();

const playQuery = {
	data: new SlashCommandBuilder()
		.setName('pplay')
		.setDescription('Play a song in your channel!')
		.addStringOption(option => option.setName('query').setDescription('The query to search for a video').setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const query = interaction.options.getString('query');
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) return await interaction.editReply('Connect to a Voice Channel!');
		serverQueue = queue.get(interaction.guild.id);
		await playMusic(query, '', interaction);
	},
};
const playPlaylist = {
	data: new SlashCommandBuilder()
		.setName('pplaylist')
		.setDescription('Play a song in your channel!')
		.addStringOption(option => option.setName('playlist').setDescription('The Playlist you want to play').setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const playlist = interaction.options.getString('playlist');
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) return await interaction.editReply('Connect to a Voice Channel!');
		serverQueue = queue.get(interaction.guild.id);
		const queryData = await getPlaylist(playlist, true);
		await playMusic('', queryData, interaction);
	},
};
const shuffleSongs = {
	data: new SlashCommandBuilder()
		.setName('pshuffle')
		.setDescription('shuffle the playlist'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
			const voiceChannel = interaction.member.voice.channel;
			if (!voiceChannel) return await interaction.editReply('Connect to a Voice Channel!');
			serverQueue = queue.get(interaction.guild.id);
			if (!serverQueue) return await interaction.editReply('There is no playlist in this channel');
			const shuffledSongs = shuffleArrayWithoutFirst(serverQueue.songs);
			serverQueue.songs = shuffledSongs;
			await interaction.editReply('New Queue: ');
			let q = '';
			shuffledSongs.forEach((s, i, j) => {
				if (i == 0) {
					q += `\n Playing: **${s.title}**`;
				}
				else {
					q += `\n ${i}.- **${s.title}**`;
				}
				if (j + 1 == 20) {
					serverQueue.textChannel.send(q);
					q = '';
					j = 0;
				}
			});
			if (!(q === '')) {
				serverQueue.textChannel.send(q);
			}
		}
		catch (error) {
			return await interaction.editReply('There was un error shuffling the playlist');
		}
	},
};
const skip = {
	data: new SlashCommandBuilder()
		.setName('pskip')
		.setDescription('Skip to the next song in the queue'),
	async execute(interaction) {
		const guildId = interaction.guild.id;
		const sq = queue.get(guildId);
		await interaction.deferReply();
		if (!serverQueue) {
			return interaction.editReplyply('There is no song playing currently!');
		}
		const dispatcher = serverQueue.connection.state.subscription.player;
		if (dispatcher) {
			dispatcher.stop();
		}
		if (!(sq.songs.length > 0)) {
			sq.voiceChannel.leave();
			queue.delete(guildId);
			interaction.editReply('No more songs in the queue. Leaving the voice channel.');
		}
		await interaction.editReply('Skipped!');
	},
};
const leave = {
	data: new SlashCommandBuilder()
		.setName('pleave')
		.setDescription('Skip to the next song in the queue'),
	async execute(interaction) {
		await interaction.deferReply();
		if (!serverQueue) {
			return interaction.editReplyply('Not connected to any channel');
		}
		const guildId = interaction.guild.id;
		serverQueue.connection.destroy();
		if (serverQueue?.connection) {
			queue.delete(guildId);
		}
		await interaction.editReply('Disconnected!');
	},
};
const pause = {
	data: new SlashCommandBuilder()
		.setName('ppause')
		.setDescription('Pauses the song in the queue'),
	async execute(interaction) {
		await interaction.deferReply();
		if (!serverQueue) {
			return interaction.editReply('Not connected to any channel');
		}
		const audioPlayer = serverQueue.connection.state.subscription.player;
		if (audioPlayer.state.status === AudioPlayerStatus.Playing) {
			audioPlayer.pause();
			interaction.editReply('Playback has been paused.');
		}
		else {
			interaction.editReply('Nothing is playing or already paused.');
		}
	},
};
const unpause = {
	data: new SlashCommandBuilder()
		.setName('punpause')
		.setDescription('Unpauses the song in the queue'),
	async execute(interaction) {
		await interaction.deferReply();
		if (!serverQueue) {
			return interaction.editReply('Not connected to any channel');
		}
		const audioPlayer = serverQueue.connection.state.subscription.player;
		if (audioPlayer.state.status === AudioPlayerStatus.Paused) {
			audioPlayer.unpause();
			interaction.editReply('Playback has been resumed.');
		}
		else {
			interaction.editReply('Audio is not paused or nothing is playing.');
		}
	},
};
const listQueue = {
	data: new SlashCommandBuilder()
		.setName('pqueue')
		.setDescription('Shows the queue'),
	async execute(interaction) {
		await interaction.deferReply();
		if (!serverQueue) {
			return interaction.editReply('Not connected to any channel');
		}
		try {
			await interaction.editReply('Queue: ');
			let q = '';
			const songs = serverQueue.songs;
			songs.forEach((s, i, j) => {
				if (i == 0) {
					q += `\n Playing: **${s.title}**`;
				}
				else {
					q += `\n ${i}.- **${s.title}**`;
				}
				if (j + 1 == 20) {
					serverQueue.textChannel.send(q);
					q = '';
					j = 0;
				}
			});
			if (!(q === '')) {
				serverQueue.textChannel.send(q);
			}
		}
		catch (error) {
			console.log(error.message);
		}
	},
};
/* const jump = {
	data: new SlashCommandBuilder()
		.setName('pjump')
		.setDescription('Jump to song(name or queue place)')
		.addStringOption(option => option.setName('jump').setDescription('The song you want to play').setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const jump = interaction.options.getString('jump');
		const guildId = interaction.guild.id;
		serverQueue = queue.get(guildId);
		if (!serverQueue) {
			return interaction.editReplyply('Not connected to any channel');
		}
		const songs = serverQueue.songs;
		console.log(songs);
		let b = false;
		let i = 0;
		while (!b) {
			console.log(songs[i].title);
			if (songs[i].title === jump) {
				b = true;
			}
			else {
				serverQueue.songs.shift();
				i++;
			}
		}
		console.log(serverQueue.songs);
		await interaction.editReply('Disconnected!');
	},
};*/
async function getPlaylist(playlist, shuffle = true) {
	return new Promise((resolve, reject) => {
		const query = `
            SELECT 
                P.name AS playlist_name, 
                PS.id_song, 
                PS.title, 
                PS.url 
            FROM 
                PLAYLIST_SONGS PS 
            JOIN 
                PLAYLIST P 
            ON 
                PS.id_playlist = P.id_playlist 
            WHERE 
                P.name = ?;
        `;

		db.all(query, [playlist], (err, rows) => {
			if (err) {
				reject(err);
			}
			else {
				let songs = rows.map(row => ({
					title: row.title,
					url: row.url,
				}));
				if (shuffle) {
					songs = shuffleArray(songs);
				}
				resolve(songs);
			}
		});
	});
}
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
function shuffleArrayWithoutFirst(array) {
	if (array.length <= 1) return array;
	const firstElement = array[0];
	let restOfArray = array.slice(1);
	restOfArray = shuffleArray(restOfArray);
	return [firstElement, ...restOfArray];
}
async function playMusic(query, playlist, interaction) {
	try {
		let songInfo;
		let songs = [];
		if (query) {
			try {
				new URL(query);
				songInfo = await ytdl.getInfo(query);
				const song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
				};
				songs.push(song);
			}
			catch {
				const filters = await ytsr.getFilters(query);
				const filter = filters.get('Type').get('Video');
				const searchResults = await ytsr(filter.url, { limit: 1 });
				songInfo = searchResults.items[0];
				const song = {
					title: songInfo.title,
					url: songInfo.url,
				};
				songs.push(song);
			}
		}
		if (playlist) {
			songs = playlist;
		}
		const nsq = [];
		songs.forEach(async s => {
			if (!serverQueue) {
				const queueContruct = {
					textChannel: interaction.channel,
					voiceChannel: interaction.member.voice.channel,
					connection: null,
					songs: [],
					volume: 5,
					playing: true,
				};
				queue.set(interaction.guild.id, queueContruct);
				serverQueue = queue.get(interaction.guild.id);
				queueContruct.songs.push(s);
				try {
					const connection = joinVoiceChannel({
						channelId: interaction.member.voice.channel.id,
						guildId: interaction.guild.id,
						adapterCreator: interaction.guild.voiceAdapterCreator,
					});
					queueContruct.connection = connection;
					await play(interaction.guild, queueContruct.songs[0], serverQueue, interaction);
				}
				catch (err) {
					console.log(err);
					queue.delete(interaction.guild.id);
					await interaction.editReply('I could not join the voice channel!');
				}
			}
			else {
				serverQueue.songs.push(s);
				nsq.push(s.title);
			}
		});
		const q = [];
		nsq.forEach(s => {
			q.push (`\n **${s}** added to the queue!`);
		});
		if (q) {
			let data = '';
			q.forEach(async (s, i) => {
				data += s;
				if (i + 1 == 20) {
					serverQueue.textChannel.send(data);
					data = '';
					i = 0;
				}
			});
			serverQueue.textChannel.send(data);
		}
	}
	catch (error) {
		let string = error.message;
		console.error('Error playing audio:', string);
		if (string === 'Cannot read properties of undefined (reading \'length\')') {
			string = 'No songs were found for your search.';
		}
		await interaction.editReply('There was an error trying to execute that command: ' + string);
	}
}

async function play(guild, song) {
	const sq = queue.get(guild.id);
	try {
		if (!song) {
			if (sq?.connection) {
				sq.connection.destroy();
				sq.textChannel.send('Queue Ended');
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
		sq.connection.subscribe(audioPlayer);
		audioPlayer.play(audioResource);
		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			sq.songs.shift();
			play(guild, sq.songs[0]);
		});
		audioPlayer.on('error', async error => {
			console.error(error.message);
			serverQueue.textChannel.send(`Error playing **${song.title}** Error: ${error.message}`);
		});
		serverQueue.textChannel.send(`Now playing: **${song.title}** (${serverQueue.songs.length} left)`);
	}
	catch (error) {
		console.log(error);
	}
}
module.exports = [ playPlaylist, playQuery, shuffleSongs, skip, leave, pause, unpause, listQueue];