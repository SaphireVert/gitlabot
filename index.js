const winston = require('winston')
const { colorize, combine, timestamp, printf } = winston.format

const logFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`
})

const logger = winston.createLogger({
    level: 'debug',
    format: combine(timestamp(), colorize(), logFormat),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            json: false,
            colorize: true,
        }),
    ],
})

var tmpDebugMode
var secretsFile = require('./secrets.json')
if (process.argv[2] == '--debug=true') {
    logger.warn('----- DEBUG MODE -----')
    tmpDebugMode = true
} else {
    tmpDebugMode = false
}
const BOT_TOKEN = secretsFile.BOT_TOKEN
const DEBUG_MODE = tmpDebugMode
var cron = require('node-cron')
const fs = require('fs')
const Utils = require('./Utils.js')
const Message = require('./Message.js')
const Users_Settings = require('./Users_Settings.js')
var user = new Users_Settings('./users_settings.json')
const utils = new Utils(DEBUG_MODE)
const bot = new Message(BOT_TOKEN)
var parseString = require('xml2js').parseString
const packagejson = require('./package.json')
var lastxml = []
var currentxml = []
var listUsers = []
var forceCheck = false
var AsciiTable = require('ascii-table')

const usersDataFolder = './data/users/'

function getDifferenceFrom(nouveauXML, ancienId) {
    let needle = ancienId
    let haystack = nouveauXML.feed.entry

    // find the index of the last item
    let needleIndex
    if (needle != '') {
        utils.debug('getDifferenceFrom: ancienId = ' + ancienId)
        needleIndex = haystack.findIndex((entry) => entry.id[0] == needle)
        utils.debug('needleIndex is: ' + needleIndex)
    } else {
        utils.debug('getDifferenceFrom: ancienId is empty')
        needleIndex = 5
    }
    // create a new array with the new entries
    let newHaystack = haystack.slice(0, needleIndex)
    return newHaystack
}
function getHour() {
    //iso 8601
    process.env.TZ = 'Europe/Amsterdam'
    var time = {
        hours: new Date().getHours().toString(),
        minutes: new Date().getMinutes().toString(),
    }
    if (time.hours.length == 1) {
        time.hours = '0' + time.hours
    }
    if (time.minutes.length == 1) {
        time.minutes = '0' + time.minutes
    }
    return time.hours + ':' + time.minutes
}
async function digestMessage(lastxml, msg, nbPage) {
    let text = ''
    if (nbPage == 1) {
        text =
            '*' +
            lastxml.feed.entry[0].title[0] +
            '*' +
            '\n\nDate: ' +
            '_' +
            lastxml.feed.entry[0].published +
            '_' +
            '\n\nAuthor: ' +
            '_' +
            lastxml.feed.entry[0].author[0].name[0] +
            '_' +
            '\n\nLink: ' +
            lastxml.feed.entry[0].link[0].$.href +
            '\n'
        await msg.reply.text(text, { parseMode: 'Markdown' })
    } else {
        for (i = 0; i < nbPage; i++) {
            text =
                text +
                '*' +
                lastxml.feed.entry[i].title[0] +
                '*' +
                '\n\nDate: ' +
                '_' +
                lastxml.feed.entry[i].published +
                '_' +
                '\n\nAuthor: ' +
                '_' +
                lastxml.feed.entry[i].author[0].name[0] +
                '_' +
                '\n\nLink: ' +
                lastxml.feed.entry[i].link[0].$.href +
                '\n\n-------------------------------------------------------------------\n\n'
        }
        await msg.reply.text(text, { parseMode: 'Markdown', webPreview: false })
    }
}
async function digestFilterMessage(lastxml, msg, nbPage, entries) {
    let text = ''
    if (nbPage == 1) {
        text =
            '*' +
            lastxml.feed.entry[entries[0]].title[0] +
            '*' +
            '\n\nDate: ' +
            '_' +
            lastxml.feed.entry[entries[0]].published +
            '_' +
            '\n\nAuthor: ' +
            '_' +
            lastxml.feed.entry[entries[0]].author[0].name[0] +
            '_' +
            '\n\nLink: ' +
            lastxml.feed.entry[entries[0]].link[0].$.href +
            '\n'
        await msg.reply.text(text, { parseMode: 'Markdown' })
    } else {
        for (i = 0; i < entries.length; i++) {
            console.log(entries[i])
            text +=
                '*' +
                lastxml.feed.entry[entries[i]].title[0] +
                '*' +
                '\n\nDate: ' +
                '_' +
                lastxml.feed.entry[entries[i]].published +
                '_' +
                '\n\nAuthor: ' +
                '_' +
                lastxml.feed.entry[entries[i]].author[0].name[0] +
                '_' +
                '\n\nLink: ' +
                lastxml.feed.entry[entries[i]].link[0].$.href +
                '\n\n-------------------------------------------------------------------\n\n'
        }
        await msg.reply.text(text, { parseMode: 'Markdown', webPreview: false })
    }
}
async function notifyUsers() {
    getDifferenceFrom(currentxml, idLastSend)
}
async function sendNews(entries, chatID) {
    let text = ''
    if (entries.length == 1) {
        text =
            '*' +
            entries[0].title[0] +
            '*' +
            '\n\nDate: ' +
            '_' +
            entries[0].published +
            '_' +
            '\n\nAuthor: ' +
            '_' +
            entries[0].author[0].name[0] +
            '_' +
            '\n\nLink: ' +
            entries[0].link[0].$.href +
            '\n'
        await bot.sendMessage(chatID, text, { parseMode: 'Markdown' })
    } else if (entries.length > 1) {
        for (var i = 0; i < entries.length; i++) {
            text =
                text +
                '*' +
                entries[i].title[0] +
                '*' +
                '\n\nDate: ' +
                '_' +
                entries[i].published +
                '_' +
                '\n\nAuthor: ' +
                '_' +
                entries[i].author[0].name[0] +
                '_' +
                '\n\nLink: ' +
                entries[i].link[0].$.href +
                '\n\n-------------------------------------------------------------------\n\n'
        }
        await bot.sendMessage(chatID, text, { parseMode: 'Markdown', webPreview: false })
    } else {
    }
}

bot.on('*', async (msg) => {
    logger.debug('Message-----------------------')
})

bot.on('/test', async (msg) => {
    user.init(msg.from, msg.chat)
    checkDifference()
})
bot.on('/start', (msg) => {
    user.init(msg.from, msg.chat)
    let text = '*Welcome to gitlabot* \\! \n\nType /help to get some help\\.'
    msg.reply.text(text, { parseMode: 'MarkdownV2' })
})
bot.on('/help', async (msg) => {
    user.init(msg.from, msg.chat)
    let text = ''
    var str =
        '*Commands list*:\n\n\n/start                                        _Start the bot_\n\n/help                                        _Shows the commands list_\n\n' +
        '/notify `[notifMode]`           _Set notification mode_\n\n' +
        '/last `[number]`                      _Lists the latest gitlabot article(s)_\n\n/release `[number]`               _Lists the latest release(s) from Gitlab_ \n\n' +
        '/settings                                 _Shows the current settings_' +
        '\n\n-------------------------------------------------------\n\n_Gitlabot current version:_ ' +
        packagejson.version
    // prettier-ignore
    str.split("").forEach((char, i) => {
        if (char == "." || char == "-" || char == "(" || char == ")" || char == "|") {
            text += "\\"
        }
        text += char
    })
    text += '\nSource code: [Github](https://github.com/saphirevert/gitlabot)\n' + 'You have an issue ? \\-\\-\\> [Gitlabot issues](https://github.com/SaphireVert/gitlabot/issues)'
    await msg.reply.text(text, { parseMode: 'MarkdownV2' })
})
bot.on('/settings', async (msg) => {
    user.init(msg.from, msg.chat)
    var table = new AsciiTable('Settings')
    table
        .addRow('Notification mode', user[msg.from.id][msg.chat.id].notify.notifyMode)
        .addRow('Day time', user[msg.from.id][msg.chat.id].notify.dayHour == '' ? '-' : user[msg.from.id][msg.chat.id].notify.dayHour)
        .addRow('Week day', user[msg.from.id][msg.chat.id].notify.dayWeek == '' ? '-' : user[msg.from.id][msg.chat.id].notify.dayWeek)
        .addRow('Month day', user[msg.from.id][msg.chat.id].notify.dayMonth == '' ? '-' : user[msg.from.id][msg.chat.id].notify.dayMonth)

    let tableString = table.toString()
    tableString = '`' + tableString + '`'
    console.log(tableString)

    msg.reply.text(tableString, { parseMode: 'Markdown' })
})
bot.on([/^\/last$/, /^\/last (.+)$/], async (msg, props) => {
    var nbPage
    if (typeof props.match[1] === 'undefined' || Number(props.match[1] <= 1)) {
        nbPage = 1
    } else {
        nbPage = Number(props.match[1])
    }
    try {
        let test = lastxml.feed.entry
    } catch (error) {
        currentxml.feed = { entry: [] }
    }
    let yesOrNo = false
    if (currentxml.feed.entry.length) {
        if (nbPage > currentxml.feed.entry.length) {
            nbPage = currentxml.feed.entry.length
            yesOrNo = true
        }

        digestMessage(currentxml, msg, nbPage)

        if (yesOrNo == true) {
            let text = currentxml.feed.entry.length + ' results founds\n'
            msg.reply.text(text)
        }
    } else {
        let text = 'No recent results found\n'
        await msg.reply.text(text)
    }
})
bot.on([/^\/release$/, /^\/release (.+)$/], async (msg, props) => {
    var nbPage
    if (typeof props.match[1] === 'undefined') {
        nbPage = 1
    } else {
        nbPage = Number(props.match[1])
    }
    let entries = []
    let compteur = 0
    for (let i = 0; compteur < nbPage && i < currentxml.feed.entry.length; i++) {
        var sentence = currentxml.feed.entry[i].title[0].toLowerCase()
        var word = 'Release'
        if (sentence.includes(word.toLowerCase())) {
            compteur++
            entries.push(i)
        }
    }
    digestFilterMessage(currentxml, msg, nbPage, entries)

    if (compteur == 0) {
        let text = 'No recent results found\n'
        msg.reply.text(text)
    } else if (compteur < nbPage) {
        let text = compteur + ' results found\n'
        msg.reply.text(text)
    }
})

const validateNotifyMode = (mode) => {
    return /\b(auto)\b|\b(daily)\b|\b(weekly)\b|\b(monthly)\b|\b(off)\b/.test(mode.toLowerCase())
}

const isDayValid = (day) => {
    return /\b(monday)\b|\b(tuesday)\b|\b(wednesday)\b|\b(thursday)\b|\b(friday)\b|\b(saturday)\b|\b(sunday)\b/.test(day.toLowerCase())
}
const isHourValid = (hour) => {
    return /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(hour)
}
const isDayMonthValid = (nbDay) => {
    return /^([0-31])$/.test(nbDay)
}

bot.on(/^\/notify\s?(\S*)?\s?(\S*)?\s?(\S*)?/, async (msg, props) => {
    if (typeof props.match[1] !== 'undefined' && validateNotifyMode(props.match[1])) {
        // get mode = off, auto, daily, weekly, monthly
        if (props.match[1] == 'off' || props.match[1] == 'auto') {
            user.setNotifyMode(props.match[1], msg.from, msg.chat)
            user.setDayMonth('-', msg.from, msg.chat)
            user.setDayWeek('-', msg.from, msg.chat)
            msg.reply.text('Successfuly set to ' + props.match[1] + ' !')
        }

        // got  daily (or weekly, monthly)
        if (props.match[1] == 'daily') {
            // TODO: handle non-valid hours argument
            let dailyArg = typeof props.match[2] !== 'undefined' && isHourValid(props.match[2]) ? props.match[2] : '08:00'
            user.setNotifyMode(props.match[1], msg.from, msg.chat)
            user.setDayHour(dailyArg, msg.from, msg.chat)
            user.setDayMonth('-', msg.from, msg.chat)
            user.setDayWeek('-', msg.from, msg.chat)
            msg.reply.text(`Successfuly set to ${props.match[1]}, ${dailyArg} !`)
        }

        // got weekly
        if (props.match[1] == 'weekly') {
            let weeklyArgDay = typeof props.match[2] !== 'undefined' && isDayValid(props.match[2]) ? props.match[2].toLowerCase() : 'monday'
            let weeklyArgHour = typeof props.match[3] !== 'undefined' && isHourValid(props.match[3]) ? props.match[3] : '08:00'
            user.setNotifyMode(props.match[1], msg.from, msg.chat)
            user.setDayHour(weeklyArgHour, msg.from, msg.chat)
            user.setDayWeek(weeklyArgDay, msg.from, msg.chat)
            user.setDayMonth('-', msg.from, msg.chat)
            msg.reply.text(`Successfuly set to ${props.match[1]}, ${weeklyArgDay}, ${weeklyArgHour} !`)
        }
        // got monthly
        if (props.match[1] == 'monthly') {
            let monthlyArgDay = typeof props.match[2] !== 'undefined' && isDayMonthValid(props.match[2]) ? props.match[2].toLowerCase() : '23'
            let monthlyArgHour = typeof props.match[3] !== 'undefined' && isHourValid(props.match[3]) ? props.match[3] : '08:00'
            user.setNotifyMode(props.match[1], msg.from, msg.chat)
            user.setDayHour(monthlyArgHour, msg.from, msg.chat)
            user.setDayMonth(monthlyArgDay, msg.from, msg.chat)
            user.setDayWeek('-', msg.from, msg.chat)
            msg.reply.text(`Successfuly set to ${props.match[1]}, ${monthlyArgDay}, ${monthlyArgHour} !`)
        }
    } else {
        // → error no notify arg
        msg.reply.text(`/notify command takes arguments, please check /help`)
    }
})

bot.on([/^\/log$/], async (msg, props) => {
    console.log(currentxml)
    console.log(lastxml)
})

bot.on([/^\/reset$/], async (msg, props) => {
    user.reset(msg.from, msg.chat)
    msg.reply.text('Configuration reset successfuly!')
})
async function updateXML() {
    if (currentxml.length == 0 || lastxml.length == 0) {
        currentxml = await utils.request()
        lastxml = require('./atom.json')
    } else {
        lastxml = require('./atom.json')
        currentxml = await utils.request()
    }
    console.log('[' + getHour() + ']' + '[bot.info] XML file has been updated ')
}
async function checkDifference() {
    for (const [key_, value_] of Object.entries(user)) {
        for (const [key, value] of Object.entries(value_)) {
            if (value.notify.idLastSend == '') {
                forceCheck = true
            }
        }
    }
    if (forceCheck == true || lastxml.feed.entry[0].id[0] != currentxml.feed.entry[0].id[0]) {
        let entries = []
        let compteur = 0

        for (const [userKey, userValue] of Object.entries(user)) {
            for (const [chatKey, chatValue] of Object.entries(userValue)) {
                let notifymode = chatValue.notify.notifyMode
                let dayMonth = chatValue.notify.dayMonth
                let dayWeek = chatValue.notify.dayWeek
                let dayHour = chatValue.notify.dayHour
                let idLastSend = chatValue.notify.idLastSend
                let chatID = chatKey
                let userID = userKey
                userInfos = await bot.getChat(userID)
                chatInfos = await bot.getChat(chatID)
                entries = getDifferenceFrom(currentxml, idLastSend)
                switch (notifymode) {
                    case 'auto':
                        sendNews(entries, chatID)
                        user.setIdLastSend(currentxml.feed.entry[0].id[0], userInfos, chatInfos)
                        break
                    case 'daily':
                        if (dayHour == getHour()) {
                            sendNews(entries, chatID)
                            user.setIdLastSend(currentxml.feed.entry[0].id[0], userInfos, chatInfos)
                        }
                        break
                    case 'weekly':
                        if (dayWeek == new Date().getDay() && dayHour == getHour()) {
                            sendNews(entries, chatID)
                            user.setIdLastSend(currentxml.feed.entry[0].id[0], userInfos, chatInfos)
                        }
                        break
                    case 'monthly':
                        if (dayMonth == new Date().getDate() && dayHour == getHour()) {
                            sendNews(entries, chatID)
                            user.setIdLastSend(currentxml.feed.entry[0].id[0], userInfos, chatInfos)
                        }
                        break
                    case 'off':
                        break
                }
            }
        }
    }
}
async function beginning() {
    await updateXML()
    // await checkDifference()
    cron.schedule('* * * * *', async () => {
        if (new Date().getMinutes() % 5 == 0) {
            await updateXML()
            await checkDifference()
        } else {
            await checkDifference()
        }
    })
}

beginning()

bot.start()
