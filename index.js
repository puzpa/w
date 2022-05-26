const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()

const config = require('./config.sample.json')


const updateChannel = async () => {


    const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
    if (!res) {
        const statusChannelName = `【🛡️】狀態: 關閉中`
        client.channels.cache.get(config.statusChannel).setName(statusChannelName)
        return false
    }
    const body = await res.json()

    const players = body.players.now

    const status = (body.online ? "運行中" : "關閉中")

    const playersChannelName = `〔👥〕線上人數: ${players}`
    const statusChannelName = `〔🛡️〕狀態 - ${status}`

    client.channels.cache.get(config.playersChannel).setName(playersChannelName)
    client.channels.cache.get(config.statusChannel).setName(statusChannelName)

    return true
}

client.on('ready', () => {
    console.log(`準備好. 紀錄 ${client.user.tag}.由PuzPa製作`)
    setInterval(() => {
        updateChannel()
    }, ms(config.updateInterval))
})

client.on('message', async (message) => {

    if(message.content === `${config.prefix}更新`){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.channel.send('只有管理員可以使用此指令!')
        }
        const sentMessage = await message.channel.send("正在更新頻道中...")
        await updateChannel()
        sentMessage.edit("頻道已成功更新! 由PuzPa製作")
    }

    if(message.content === `${config.prefix}資訊`){
        const sentMessage = await message.channel.send("正在取得資訊 請等待...")

        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`看起來伺服器沒辦法連接 檢查看是否在線並看有無阻擋!`)
        const body = await res.json()

        const attachment = new Discord.MessageAttachment(Buffer.from(body.favicon.substr('data:image/png;base64,'.length), 'base64'), "icon.png")

        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
            .attachFiles(attachment)
            .setThumbnail("attachment://icon.png")
            .addField("伺服器版本", body.server.name)
            .addField("在線人數", `${body.players.now} 個玩家`)
            .addField("最大人數", `${body.players.max} 個玩家`)
            .addField("狀態", (body.online ? "運行中" : "關閉中"))
            .setColor("#FF0000")
            .setFooter("由PuzPa製作")
        
        sentMessage.edit("📈 以下是伺服器資訊 **${config.ipAddress}**":, { embed })
    }

})

client.login(config.token)
