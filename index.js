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


async function digestFilterMessage(lastxml, chatID, nbPage, entries) {
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
        await bot.sendMessage(chatID, text, { parseMode: 'Markdown' })
    } else {
        for (i = 0; i < entries.length; i++) {
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
        await bot.sendMessage(chatID, text, { parseMode: 'Markdown', webPreview: false })
    }
}
async function notifyUsers() {
    await utils.getNewXMLentries(currentxml, idLastSend)
}

// afficher son pseudo, sinon prénom et nom, sinon nom
bot.on('*', async (msg) => {
    logger.info('Event detected: ' + msg.from)
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
        '*Commands list*:\n\n\n/start                                           _Start the bot_\n\n/help                                           _Shows the commands list_\n\n' +
        '/notify  `<param> [args]`       _Set notification mode_\n\n' +
        '/last `[number]`                         _Lists the latest gitlabot article(s)_\n\n/release `[number]`                  _Lists the latest release(s) from Gitlab_ \n\n' +
        '/settings                                    _Shows the current settings_' +
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
        .addRow('Notification mode', user[msg.chat.id].notify.notifyMode)
        .addRow('Notification type', user[msg.chat.id].notify.notifyType)
        .addRow('Day time', user[msg.chat.id].notify.dayHour == '' ? '-' : user[msg.chat.id].notify.dayHour)
        .addRow('Week day', user[msg.chat.id].notify.dayWeek == '' ? '-' : user[msg.chat.id].notify.dayWeek)
        .addRow('Month day', user[msg.chat.id].notify.dayMonth == '' ? '-' : user[msg.chat.id].notify.dayMonth)
        if (DEBUG_MODE) {
            table.addRow('idLastSend', user[msg.chat.id].notify.idLastSend == '' ? 'empty' : 'existing')
        }

    let tableString = table.toString()
    tableString = '`' + tableString + '`'

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

        utils.sendNews(msg.chat.id, bot, currentxml.feed.entry, nbPage)

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
    } else if (props.match[1] == 'all'){
        nbPage = currentxml.feed.entry.length
        logger.debug(nbPage)
    } else {
        nbPage = Number(props.match[1])
    }

    getFiltered(msg.chat.id, 'release', currentxml, nbPage)

    // sendFiltered(msg.chat.id, 'release', nbPage)
    // getFiltered(msg.chat.id, )
    // let entries = []
    // let compteur = 0
    // for (let i = 0; compteur < nbPage && i < currentxml.feed.entry.length; i++) {
    //     var sentence = currentxml.feed.entry[i].title[0].toLowerCase()
    //     var word = 'Release'
    //     if (sentence.includes(word.toLowerCase())) {
    //         compteur++
    //         entries.push(i)
    //     }
    // }
    // digestFilterMessage(currentxml, msg, nbPage, entries)
    //
    // if (compteur == 0) {
    //     let text = 'No recent results found\n'
    //     msg.reply.text(text)
    // } else if (compteur < nbPage) {
    //     let text = compteur + ' results found\n'
    //     msg.reply.text(text)
    // }
})

const sendFiltered = (chatID, keyword, array, nbPage) => {

}

const getFiltered = (chatID, keyword, array) => {
    logger.debug('Into')
        logger.debug('Array')
        let arrayToCheck = array
        let nbPage = array.length
        let entries = []
        for (let i = 0; i < nbPage; i++) {
            var sentence = arrayToCheck[i].title[0].toLowerCase()
            if (sentence.includes(keyword.toLowerCase())) {
                entries.push(arrayToCheck[i])
            }
        }
        return entries
}

const sendFiltereds = (chatID, keyword, nbPage) => {
    logger.debug('Into')
    if (typeof array_OR_nbPage === 'number') {
        logger.debug('Integer')
        let entries = []
        let compteur = 0
        logger.debug(keyword)
        for (let i = 0; compteur < nbPage && i < currentxml.feed.entry.length; i++) {
            var sentence = currentxml.feed.entry[i].title[0].toLowerCase()
            if (sentence.includes(keyword.toLowerCase())) {
                compteur++
                entries.push(currentxml.feed.entry[i])
            }
            logger.debug(entries)
            logger.debug("-------------------------")
        }
        utils.sendNews(chatID, bot, entries)

        if (compteur == 0) {
            let text = 'No recent results found\n'
            bot.sendMessage(chatID, text)
        } else if (compteur < nbPage) {
            let text = compteur + ' results found\n'
            bot.sendMessage(chatID, text)
        }
    } else {
        logger.debug('Not good type')
    }
}



const containsKeyWord = (keyword, stringToCheck) => {
        if (stringToCheck.includes(keyword.toLowerCase())) {
            return true
        } else {
            return false
        }
}

const entriesContainingKeyWord = (keyword, entries) => {
    let tmpArray = []
    for (var i = 0; i < entries.length; i++) {
        if (entries[0].title[0].includes(keyword.toLowerCase())) {
            return true
        } else {
            return false
        }
    }
}


const validateNotifyMode = (mode) => {
    return /\b(auto)\b|\b(daily)\b|\b(weekly)\b|\b(monthly)\b|\b(off)\b|\b(type)\b/.test(mode.toLowerCase())
}

const isNotifyTypeValid = (mode) => {
    return /\b(all)\b|\b(release)\b/.test(mode.toLowerCase())
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
    logger.debug(props.match[1])
    if (typeof props.match[1] !== 'undefined' && validateNotifyMode(props.match[1])) {
        if (props.match[1] == 'type') {
            let notifyTypeArg = typeof props.match[2] !== 'undefined' && isNotifyTypeValid(props.match[2]) ? props.match[2] : 'all'
            user.setNotifyType(props.match[2], msg.from, msg.chat)
            msg.reply.text('Successfuly set to ' + notifyTypeArg + ' !')
        }

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
        msg.reply.text('`/notify <param> [args]\n\n`' +
                        '*Parameters*:\n' +
                        '`- auto`\n' +
                        '`- off`\n' +
                        '`- daily`\n' +
                        '`- weekly`\n' +
                        '`- monthly`\n\n' +

                        '*Arguments:*\n' +
                        '`- weekdays`\n' +
                        '`- monthday`\n' +
                        '`- daytime`\n\n' +
                        'exemple: `/notify weekly monday 8:00`', { parseMode: 'Markdown' })
    }
})


async function updateXML() {
    let updated = false
    if (currentxml.length == 0 || lastxml.length == 0) {
        currentxml = await utils.request()
        if (DEBUG_MODE) {
            lastxml = require('./atom.json')
        } else {
            lastxml = currentxml
        }
        updated = true
        logger.debug('updatestart')
    } else {
        logger.debug(lastxml.feed.entry[0].id[0])
        logger.debug(currentxml.feed.entry[0].id[0])
        if (lastxml.feed.entry[0].id[0] != currentxml.feed.entry[0].id[0]) {
            updated = true
            logger.debug('updated')
        }
        if (DEBUG_MODE == true) {
            lastxml = require('./atom.json')
        } else {
            lastxml = currentxml
        }
        currentxml = await utils.request()
    }
    if (updated == true) {
        logger.info('[' + utils.getTime() + ']' + '[bot.info] XML file has been updated ')
    }
}
async function checkDifference() {
    for (const [key, value] of Object.entries(user)) {
        if (value.notify.idLastSend == '') {
            forceCheck = true
        }
    }
    if (forceCheck == true || lastxml.feed.entry[0].id[0] != currentxml.feed.entry[0].id[0]) {
        let entries = []
        let compteur = 0

        for (const [chatKey, chatValue] of Object.entries(user)) {

            let tmpNotifymode = chatValue.notify.notifyMode
            let dayMonth = chatValue.notify.dayMonth
            let notifyType = chatValue.notify.notifyType
            let dayWeek = chatValue.notify.dayWeek
            let dayHour = chatValue.notify.dayHour
            let idLastSend = chatValue.notify.idLastSend
            let chatID = chatKey
            chatInfos = await bot.getChat(chatID)
            entries = await utils.getNewXMLentries(currentxml, idLastSend)
            logger.debug(entries)
            logger.debug('+1')
            notifyType = 'request'
            if (notifyType != 'all') {
                let filteredArray = getFiltered(chatID, notifyType, entries)
                if (filteredArray.length == 0) {
                    logger.debug('No release found')
                    tmpNotifymode = 'off'
                } else {
                    entries = filteredArray
                }
            }
            switch (tmpNotifymode) {
                case 'auto':
                    utils.sendNews(chatID, bot, entries)
                    user.setIdLastSend(currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                    break
                case 'daily':
                    if (dayHour == utils.getTime()) {
                        utils.sendNews(chatID, bot, entries)
                        user.setIdLastSend(currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                    }
                    break
                case 'weekly':
                    if (dayWeek == new Date().getDay() && dayHour == utils.getTime()) {
                        utils.sendNews(chatID, bot, entries)
                        user.setIdLastSend(currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                    }
                    break
                case 'monthly':
                    if (dayMonth == new Date().getDate() && dayHour == utils.getTime()) {
                        utils.sendNews(chatID, bot, entries)
                        user.setIdLastSend(currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                    }
                    break
                case 'off':
                    break
            }
        }
    }
}
async function beginning() {
    await updateXML()
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









if(DEBUG_MODE){
    bot.on('/test', async (msg) => {
    user.init(msg.from, msg.chat)
    checkDifference()
    // utils.sendNews(msg.chat.id)
    })
}

if(DEBUG_MODE){
    bot.on([/^\/reset$/], async (msg, props) => {
        user.reset(msg.from, msg.chat)
        user.setNotifyMode('auto', msg.from, msg.chat)
        user.setNotifyType('review', msg.from, msg.chat)
        msg.reply.text('Configuration reset successfuly! Type /settings to see the values')
    })
}
