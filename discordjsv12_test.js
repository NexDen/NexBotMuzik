const { token } = require('./nexbotmüzik.json');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES"] });
const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true, leaveOnFinish: true, leaveOnEmpty: true, leaveOnStop: false})

distube.volume = 0.2

const prefix = "!"
client.once('ready', () => { console.log(`${client.user.username}'a bağlanıldı!'`) });
var çalındı = false
var şarkısayısı = 0
client.on("message", async message => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift();

    distube
        .on("playSong", (message, queue, song) => {
            console.log("başlangıç")
            if (!çalındı || şarkısayısı !== 0) message.channel.send(`**${song.name}** çalınıyor...`)
            çalındı = true //! şarkı çalınıyor mesajı birden çok kere yazıldığı için ekledim
            distube.setVolume(message, 0.85)
            distube.setRepeatMode(message, 0)
            }
        )
                
        .on("addSong", (message, queue, song) => {
            console.log("ekleme")
            if (!çalındı) message.channel.send(`Sıraya **${song.name}** eklendi.`)
            çalındı = true //! şarkı çalınıyor mesajı birden çok kere yazıldığı için ekledim
            }
        )
        .on("finish", message => {
            console.log("bitiş")
            çalındı = false
            distube.stop(message)
        })
        .on("empty", (message) => message.channel.send("Kanal boş, çıkılıyor.")) //! çalışmıyor
        .on("error", (message, e) => {
            console.error(e)
            message.channel.send("An error encountered: " + e);
        });
    if (command == "çal"){
        if (!message.member.voice.channel) return message.channel.send("Şarkı çalmak için bir ses kanalına bağlı olmalısınız!")
        if (!args[0]) return message.channel.send("Çalınacak şarkıyı giriniz!")
        çalındı = false
        distube.play(message, args.join(" "))
        şarkısayısı ++
    }
    if (command == "durdur"){
        const bot = message.guild.members.cache.get(client.user.id)
        if (!message.member.voice.channel) return message.channel.send("Şarkı çalmak için bir ses kanalına bağlı olmalısınız!")
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send("Bot ile aynı kanalda olmalısın!")
        message.channel.send("Müzik durduruluyor...")
        distube.stop(message)
        şarkısayısı = 0
    }
    if (command == "geç"){
        const bot = message.guild.members.cache.get(client.user.id)
        if (!message.member.voice.channel) return message.channel.send("Şarkıyı geçmek için bir ses kanalında olmalısın!")
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send("Bot ile aynı kanalda olmalısın!")
        çalındı = false
        if (!(şarkısayısı === 0)){
            message.channel.send("Müzik atlanıyor...")
            distube.skip(message)
            şarkısayısı--
        }
        else {
            message.channel.send("Müzik kalmadı.")
        }
    }
})

client.login(token)