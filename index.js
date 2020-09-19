var cron = require('node-cron')
const fs = require('fs')
var secretsFile = fs.readFileSync('./secrets.json', 'utf-8')
const secretsFileObj = JSON.parse(secretsFile)
const BOT_TOKEN = secretsFileObj.BOT_TOKEN
const http = require('http')
const https = require('https')
const Utils = require('./utils.js')
const couteauSuisse = new Utils.Utils()
const Message = require('./utils.js')
const bot = new Utils.Message(BOT_TOKEN)
const fetch = require('node-fetch')
var parseString = require('xml2js').parseString
var lastxml = []
var sample_id = JSON.parse(fs.readFileSync('./users_settings.json', 'utf-8')).sample_id
function user_settings(user_id) {
    let tmp_users_settings = JSON.parse(fs.readFileSync('./users_settings.json', 'utf-8'))
    return tmp_users_settings.user_settings[user_id]
}
function getDate() {

    return new Date().toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
}

// console.debug(users_settings.user_settings[976140946].username)
// console.debug(user_settings(sample_id).preferences.notify.is_notif_ena)

bot.on('/start', (msg) => {
    let text = 'Welcome to gitlabot ! Type /help to get some help.'
    msg.reply.text(text)
})
bot.on('/help', (msg) => {
    // msg.reply.text('Commands list:\n/start: Start the bot \n/help: Display the command list\n' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')) +
    let text = 'Commands list:\n/start: Start the bot \n/help: Display the command list\n'
    msg.reply.text(text + getDate())
})
bot.on('/settings', async (msg) => {
    let text =
        'Notifications:\n' +
        'Push notifications: ' +
        (user_settings(sample_id).preferences.notify.is_notif_ena == 'true'
            ? 'enabled'
            : 'disabled') +
        '\n' +
        'Frequency: ' +
        user_settings(sample_id).preferences.notify.value_notify
    await msg.reply.text(text + getDate())
})

bot.on([/^\/last$/, /^\/last (.+)$/], async (msg, props) => {
    var nbPage
    if (typeof props.match[1] === 'undefined') {
        nbPage = 1
    } else {
        nbPage = Number(props.match[1])
    }
    try {
        let test = lastxml.feed.entry
    } catch (error) {
        // console.error(error)
        console.log(msg.text + ": No entry found");
        lastxml.feed = {entry:[]}
    }
        let yesOrNo = false
        if (lastxml.feed.entry.length) {
            if (nbPage > lastxml.feed.entry.length) {
                nbPage = lastxml.feed.entry.length
                yesOrNo = true
            }

        for (i = 0; i < nbPage; i++) {
            let text = lastxml.feed.entry[i].title[0] +
                        '\nAuthor: ' +
                        lastxml.feed.entry[i].author[0].name[0] +
                        '\n' +
                        lastxml.feed.entry[i].link[0].$.href +
                        '\n'
            await msg.reply.text(text + getDate())
        }
        if (yesOrNo == true) {
            let text =
                lastxml.feed.entry.length +
                    ' results founds\n'
            msg.reply.text(text + getDate())
        }
    } else {
        let text = 'No recent results found'
        await msg.reply.text(text + getDate())
    }
})

// bot.on('/notify', (msg) =>
//   msg.reply.text('Commands list:\n/start: Start the bot \n/help: Display the command list')
// )

bot.on([/^\/release$/, /^\/release (.+)$/], async (msg, props) => {
    var nbPage
    if (typeof props.match[1] === 'undefined') {
        nbPage = 1
    } else {
        nbPage = Number(props.match[1])
    }
    var entries = []
    let compteur = 0
    for (let i = 0; compteur < nbPage && i < lastxml.feed.entry.length; i++) {
        var sentence = lastxml.feed.entry[i].title[0].toLowerCase()
        var word = 'Release'
        if (sentence.includes(word.toLowerCase())) {
            compteur++
            entries.push(i)
        }
    }
    for (var i = 0; i < entries.length; i++) {
        let text =
            lastxml.feed.entry[entries[i]].title +
            '\nAuthor: ' +
            lastxml.feed.entry[i].author[0].name[0] +
            '\n' +
            lastxml.feed.entry[i].link[0].$.href +
            '\n'
        await msg.reply.text(text + getDate())
    }
    if (compteur == 0) {
        let text = 'No recent results found\n'
        msg.reply.text(text + getDate())
    } else if (compteur < nbPage) {
            let text = compteur +
                ' results found\n'
        msg.reply.text(text + getDate())
    }
})

bot.on([/^\/notify$/, /^\/notify (.+)$/], async (msg, props) => {
    var valueNotify
    if (typeof props.match[1] === 'undefined') {
        valueNotify = 'auto'
    } else {
        valueNotify = props.match[1]
    }
    let file = require('./users_settings.json')
    // file.user_settings[976140946].preferences.notify.is_notif_ena = (user_settings(sample_id).preferences.notify.is_notif_ena == "true" ? "false" : "true")
    file.user_settings[976140946].preferences.notify.value_notify = valueNotify
    // console.debug(file.user_settings[976140946].preferences)
    fs.writeFile('./users_settings.json', JSON.stringify(file, null, 2), function writeJSON(err) {})
})

async function updateXML(){
    lastxml = await couteauSuisse.request()
    console.log('[' + getDate() + ']' + '[bot.info] XML file has been updated ');
}

cron.schedule('*/12 * * * *', async () => {
    updateXML()
    // console.log('[bot.info] XML file updated' + getDate());
})

updateXML()

bot.start()
