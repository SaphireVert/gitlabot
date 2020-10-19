var secretsFile = require('./secrets.json')
const BOT_TOKEN = secretsFile.BOT_TOKEN
var tmpDebugMode = false
if (process.argv[2] == '--debug=true') {
    console.log('----- DEBUG MODE -----')
    tmpDebugMode = true
}
var logLevel = 'info'
const DEBUG_MODE = tmpDebugMode
if (DEBUG_MODE) {
    logLevel = 'debug'
}

const winston = require('winston')
const { colorize, combine, timestamp, printf } = winston.format

const logFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`
})
const logger = winston.createLogger({
    level: logLevel,
    format: combine(timestamp(), colorize(), logFormat),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            json: false,
            colorize: true,
        }),
    ],
})

const fs = require('fs')
const Utils = require('./Utils.js')
const Message = require('./Message.js')
const Users_Settings = require('./Users_Settings.js')
const bot = new Message({
    token: BOT_TOKEN,
    usePlugins: ['askUser', 'commandButton'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    },
})
var user = new Users_Settings('./users_settings.json', bot)
const utils = new Utils(DEBUG_MODE)
var parseString = require('xml2js').parseString
const packagejson = require('./package.json')
var listUsers = []
var AsciiTable = require('ascii-table')

const usersDataFolder = './data/users/'
var cron = require('node-cron')



// afficher son pseudo, sinon prénom et nom, sinon nom
bot.on('*', async (msg) => {
    logger.info(utils.getUser(msg.from) + ' ' + ((msg.chat.type == 'group') ? msg.chat.title : (msg.chat.type)) + ': Event detected: ' + msg.text)
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
        '/notify  `<type|mode> <param> [args]`    _Set notification settings_\n\n' +
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
    if (typeof props.match[1] === 'undefined' || typeof props.match[1] !== 'number' || Number(props.match[1] <= 1)) {
        nbPage = 1
    } else {
        nbPage = Number(props.match[1])
    }
    try {
        let test = utils.lastxml.feed.entry
    } catch (error) {
        utils.currentxml.feed = { entry: [] }
    }
    let yesOrNo = false
    if (utils.currentxml.feed.entry.length) {
        if (nbPage > utils.currentxml.feed.entry.length) {
            nbPage = utils.currentxml.feed.entry.length
            yesOrNo = true
        }

        utils.sendNews(msg.chat.id, bot, utils.currentxml.feed.entry, nbPage)

        if (yesOrNo == true) {
            let text = utils.currentxml.feed.entry.length + ' results founds\n'
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
    } else if (props.match[1] == 'all') {
        nbPage = utils.currentxml.feed.entry.length
    } else {
        nbPage = Number(props.match[1])
    }

    utils.sendNews(msg.chat.id, bot, await utils.getFiltered('release', utils.currentxml.feed.entry), nbPage)
})

const validateNotifyMode = (mode) => {
    return /\b(auto)\b|\b(daily)\b|\b(weekly)\b|\b(monthly)\b|\b(off)\b|\b(type)\b|\b(mode)\b/.test(mode.toLowerCase())
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
    user.init(msg.from, msg.chat)
    logger.debug(props.match[1])
    if (typeof props.match[1] !== 'undefined' && validateNotifyMode(props.match[1])) {
        if (props.match[1] == 'type') {
            logger.debug(isNotifyTypeValid(props.match[2]))
            let notifyTypeArg = typeof props.match[2] !== 'undefined' && isNotifyTypeValid(props.match[2]) ? props.match[2] : 'all'
            user.setNotifyType(notifyTypeArg, msg.from, msg.chat, bot)
            msg.reply.text('Successfuly set to ' + notifyTypeArg + ' !')
        }

        // get mode = off, auto, daily, weekly, monthly
        if (props.match[1] == 'mode') {
            // get mode = off, auto, daily, weekly, monthly
            if (props.match[2] == 'off' || props.match[2] == 'auto') {
                user.setNotifyMode(props.match[2], msg.from, msg.chat)
                user.setDayMonth('-', msg.from, msg.chat)
                user.setDayWeek('-', msg.from, msg.chat)
                msg.reply.text('Successfuly set to ' + props.match[2] + ' !')
            }

            // got  daily (or weekly, monthly)
            if (props.match[2] == 'daily') {
                // TODO: handle non-valid hours argument
                let dailyArg = typeof props.match[3] !== 'undefined' && isHourValid(props.match[3]) ? props.match[3] : '08:00'
                user.setNotifyMode(props.match[2], msg.from, msg.chat)
                user.setDayHour(dailyArg, msg.from, msg.chat)
                user.setDayMonth('-', msg.from, msg.chat)
                user.setDayWeek('-', msg.from, msg.chat)
                msg.reply.text(`Successfuly set to ${props.match[2]}, ${dailyArg} !`)
            }

            // got weekly
            if (props.match[2] == 'weekly') {
                let weeklyArgDay = typeof props.match[3] !== 'undefined' && isDayValid(props.match[3]) ? props.match[3].toLowerCase() : 'monday'
                let weeklyArgHour = typeof props.match[4] !== 'undefined' && isHourValid(props.match[4]) ? props.match[4] : '08:00'
                user.setNotifyMode(props.match[2], msg.from, msg.chat)
                user.setDayHour(weeklyArgHour, msg.from, msg.chat)
                user.setDayWeek(weeklyArgDay, msg.from, msg.chat)
                user.setDayMonth('-', msg.from, msg.chat)
                msg.reply.text(`Successfuly set to ${props.match[2]}, ${weeklyArgDay}, ${weeklyArgHour} !`)
            }
            // got monthly
            if (props.match[2] == 'monthly') {
                let monthlyArgDay = typeof props.match[3] !== 'undefined' && isDayMonthValid(props.match[3]) ? props.match[3].toLowerCase() : '23'
                let monthlyArgHour = typeof props.match[4] !== 'undefined' && isHourValid(props.match[4]) ? props.match[4] : '08:00'
                user.setNotifyMode(props.match[2], msg.from, msg.chat)
                user.setDayHour(monthlyArgHour, msg.from, msg.chat)
                user.setDayMonth(monthlyArgDay, msg.from, msg.chat)
                user.setDayWeek('-', msg.from, msg.chat)
                msg.reply.text(`Successfuly set to ${props.match[2]}, ${monthlyArgDay}, ${monthlyArgHour} !`)
            }
        }
    } else {
        // → error no notify arg
        msg.reply.text(
            '`/notify <mode|type> <param> [args]\n\n`' +
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
                'example: `/notify mode weekly monday 08:00`',
            { parseMode: 'Markdown' }
        )
    }
})

async function initXML() {
    await utils.updateXML()
    cron.schedule('* * * * *', async () => {
        if (new Date().getMinutes() % 5 == 0) {
            await utils.updateXML()
            await utils.checkDifference(user, bot)
        } else {
            await utils.checkDifference(user, bot)
        }
    })
}

initXML()
bot.start()

if (DEBUG_MODE) {
    bot.on('/test', async (msg) => {

        let replyMarkup = bot.keyboard([
            [bot.button('contact', 'Your contact'), bot.button('location', 'Your location')],
            ['/back', '/hide']
        ], {resize: true});

        return bot.sendMessage(msg.from.id, 'Button example.', {replyMarkup});

        bot.on('*', async (msg) => {

        })
    })
}

if (DEBUG_MODE) {
    bot.on([/^\/reset$/], async (msg, props) => {
        user.reset(msg.from, msg.chat)
        user.setNotifyMode('auto', msg.from, msg.chat)
        user.setNotifyType('review', msg.from, msg.chat)
        msg.reply.text('Configuration reset successfuly! Type /settings to see the values')
    })
}
