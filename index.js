var cron = require('node-cron')
const fs = require('fs')
var secretsFile = require('./secrets.json')
const BOT_TOKEN = secretsFile.BOT_TOKEN
const Utils = require('./utils.js')
const toolbox = new Utils.Utils()
const bot = new Utils.Message(BOT_TOKEN)
var user = new Utils.Users_Settings('./users_settings.json')
var parseString = require('xml2js').parseString
const packagejson = require('./package.json')
var lastxml = []
var lastxml = []
var currentxml = []

function getDifferenceFrom(nouveauXML, ancienId) {
    // let needle = ancien.feed.entry[0].id[0]
    let needle = ancienId
    let haystack = nouveauXML.feed.entry
    // find the index of the last item
    let needleIndex = haystack.findIndex((entry) => entry.id[0] == needle)
    // create a new array with the new entries
    let newHaystack = haystack.slice(0, needleIndex)

    return newHaystack
}
async function digestMessage(lastxml, msg, nbPage) {
    let text = ''
    if (nbPage == 1) {
        text =
            lastxml.feed.entry[0].title[0] +
            '\nDate: ' +
            lastxml.feed.entry[0].published +
            '\nAuthor: ' +
            lastxml.feed.entry[0].author[0].name[0] +
            '\n' +
            lastxml.feed.entry[0].link[0].$.href +
            '\n'
        await msg.reply.text(text + getHour(), { webPreview: true })
    } else {
        for (i = 0; i < nbPage; i++) {
            text =
                text +
                lastxml.feed.entry[i].title[0] +
                '\n' +
                lastxml.feed.entry[i].author[0].name[0] +
                '\n' +
                lastxml.feed.entry[i].link[0].$.href +
                '\n\n'
        }
        await msg.reply.text(text + getHour(), { webPreview: false })
    }
}
async function digestFilterMessage(lastxml, msg, nbPage, entries) {
    let text = ''
    if (nbPage == 1) {
        text =
            lastxml.feed.entry[entries[0]].title[0] +
            '\nAuthor: ' +
            lastxml.feed.entry[entries[0]].author[0].name[0] +
            '\n' +
            lastxml.feed.entry[entries[0]].link[0].$.href +
            '\n'
        await msg.reply.text(text + getHour(), { webPreview: true })
    } else {
        for (i = 0; i < entries.length; i++) {
            text =
                text +
                lastxml.feed.entry[entries[i]].title[0] +
                '\n' +
                lastxml.feed.entry[entries[i]].author[0].name[0] +
                '\n' +
                lastxml.feed.entry[entries[i]].link[0].$.href +
                '\n\n'
        }
        await msg.reply.text(text + getHour(), { webPreview: false })
    }
}
function getHour() {
    //iso 8601
    process.env.TZ = 'Europe/Amsterdam'
    var time = {
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
    }
    return time.hours + ':' + time.minutes
}
async function notifyUsers() {
    getDifferenceFrom(currentxml, idLastSend)
}

bot.on('/start', (msg) => {
    user.init(msg)
    let text =
        'Welcome to gitlabot ! Type /help to get some help.\nGitlabot v' +
        packagejson.version +
        '\nSource code: https://github.com/saphirevert/gitlabot'
    msg.reply.text(text)
})
bot.on('/help', (msg) => {
    // msg.reply.text('Commands list:\n/start: Start the bot \n/help: Display the command list\n' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')) +
    let text =
        'Commands list:\n/start: Start the bot \n/help: Display the command list\nGitlabot v' +
        packagejson.version +
        '\nSource code: https://github.com/saphirevert/gitlabot'
    msg.reply.text(text)
})
bot.on('/settings', async (msg) => {
    let text =
        'Notifications:\n' +
        'Notification mode: ' +
        (user[msg.from.id].settings.notify.notifyMode != 'off' ? 'enabled' : 'disabled') +
        '\n' +
        'Frequency: ' +
        user[msg.from.id].settings.notify.notifyMode +
        '\nDaytime: ' +
        user[msg.from.id].settings.notify.dayHour +
        '\nMonth day: ' +
        user[msg.from.id].settings.notify.dayMonth +
        '\nGitlabot v' +
        packagejson.version +
        '\nSource code: https://github.com/saphirevert/gitlabot'
    await msg.reply.text(text)
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
        // console.error(error)
        console.log(msg.text + ': No entry found')
        lastxml.feed = { entry: [] }
    }
    let yesOrNo = false
    if (lastxml.feed.entry.length) {
        if (nbPage > lastxml.feed.entry.length) {
            nbPage = lastxml.feed.entry.length
            yesOrNo = true
        }

        digestMessage(lastxml, msg, nbPage)

        if (yesOrNo == true) {
            let text = lastxml.feed.entry.length + ' results founds\n'
            msg.reply.text(text + getHour())
        }
    } else {
        let text = 'No recent results found\n'
        await msg.reply.text(text + getHour())
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
    for (let i = 0; compteur < nbPage && i < lastxml.feed.entry.length; i++) {
        var sentence = lastxml.feed.entry[i].title[0].toLowerCase()
        var word = 'Release'
        if (sentence.includes(word.toLowerCase())) {
            compteur++
            entries.push(i)
        }
    }
    digestFilterMessage(lastxml, msg, nbPage, entries)

    if (compteur == 0) {
        let text = 'No recent results found\n'
        msg.reply.text(text + getHour())
    } else if (compteur < nbPage) {
        let text = compteur + ' results found\n'
        msg.reply.text(text + getHour())
    }
})

const validateNotifyMode = (mode) => {
    return /\b(auto)\b|\b(daily)\b|\b(weekly)\b|\b(monthly)\b|\b(off)\b/.test(mode.toLowerCase())
}

const isDayValid = (day) => {
    return /\b(monday)\b|\b(tuesday)\b|\b(wednesday)\b|\b(thursday)\b|\b(friday)\b|\b(saturday)\b|\b(sunday)\b/.test(
        day.toLowerCase()
    )
}
const isHourValid = (hour) => {
    return /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(hour)
}
const isDayMonthValid = (nbDay) => {
    return /^([0-31])$/.test(nbDay)
}

//         /notify  [auto|daily] monday 08:00
bot.on(/^\/notify\s?(\S*)?\s?(\S*)?\s?(\S*)?/, async (msg, props) => {
    console.debug(msg)
    console.debug(props)

    if (typeof props.match[1] !== 'undefined' && validateNotifyMode(props.match[1])) {
        // get mode = off, auto, daily, weekly, monthly
        if (props.match[1] == 'off' || props.match[1] == 'auto') {
            user.setNotifyMode(props.match[1], msg)
            user.setDayMonth('-', msg)
            user.setDayWeek('-', msg)
            msg.reply.text('Successfuly set to ' + props.match[1] + ' !')
            return
        }

        // got  daily (or weekly, monthly)
        if (props.match[1] == 'daily') {
            // TODO: handle non-valid hours argument
            let dailyArg =
                typeof props.match[2] !== 'undefined' && isHourValid(props.match[2])
                    ? props.match[2]
                    : '08:00'
            user.setNotifyMode(props.match[1], msg)
            user.setDayHour(dailyArg, msg)
            user.setDayMonth('-', msg)
            user.setDayWeek('-', msg)
            msg.reply.text(`Successfuly set to ${props.match[1]}, ${dailyArg} !`)
            return
        }

        // got weekly
        if (props.match[1] == 'weekly') {
            let weeklyArgDay =
                typeof props.match[2] !== 'undefined' && isDayValid(props.match[2])
                    ? props.match[2].toLowerCase()
                    : 'monday'
            let weeklyArgHour =
                typeof props.match[3] !== 'undefined' && isHourValid(props.match[3])
                    ? props.match[3]
                    : '08:00'
            user.setNotifyMode(props.match[1], msg)
            user.setDayHour(weeklyArgHour, msg)
            user.setDayWeek(weeklyArgDay, msg)
            user.setDayMonth('-', msg)
            msg.reply.text(
                `Successfuly set to ${props.match[1]}, ${weeklyArgDay}, ${weeklyArgHour} !`
            )
            return
        }
        // got monthly
        if (props.match[1] == 'monthly') {
            let monthlyArgDay =
                typeof props.match[2] !== 'undefined' && isDayMonthValid(props.match[2])
                    ? props.match[2].toLowerCase()
                    : '23'
            let monthlyArgHour =
                typeof props.match[3] !== 'undefined' && isHourValid(props.match[3])
                    ? props.match[3]
                    : '08:00'
            user.setNotifyMode(props.match[1], msg)
            user.setDayHour(monthlyArgHour, msg)
            user.setDayMonth(monthlyArgDay, msg)
            user.setDayWeek('-', msg)
            msg.reply.text(
                `Successfuly set to ${props.match[1]}, ${monthlyArgDay}, ${monthlyArgHour} !`
            )
            return
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
async function updateXML() {
    if (currentxml.length == 0 || lastxml.length == 0) {
        currentxml = await toolbox.request()
        lastxml = currentxml
    } else {
        lastxml = currentxml
        currentxml = await toolbox.request()
    }
    console.log('[' + getHour() + ']' + '[bot.info] XML file has been updated ')
}
async function checkDifference() {
    if (lastxml.feed.entry[0].id[0] == currentxml.feed.entry[0].id[0]) {
    } else {
        let entries = []
        let compteur = 0
        // 21:25
        // send to users the changes
        // console.log(entries);
        // sendNews()
        // Envoyer aux /notify auto
        // console.debug(user)
        entries = getDifferenceFrom(currentxml, lastxml.feed.entry[0].id[0])
        entries.reverse()
        for (const [key, value] of Object.entries(user)) {
            let notifymode = value.settings.notify.notifyMode
            let dayMonth = value.settings.notify.dayMonth
            let dayWeek = value.settings.notify.dayWeek
            let dayHour = value.settings.notify.dayHour
            let idLastSend = value.settings.notify.idLastSendtext
            idLastSend = 'https://about.gitlab.com/blog/2020/09/01/a-tale-of-two-editors/'
            switch (notifymode) {
                case 'auto':
                    console.log(entries.length)
                    for (var i = 0; i <= entries.length; i++) {
                        let text =
                            entries[i].title +
                            '\nAuthor: ' +
                            entries[i].author[0].name[0] +
                            '\n' +
                            entries[i].link[0].$.href +
                            '\n'
                        // console.log(text);
                        bot.sendMessage(value.id, text + getHour())
                    }
                    break
                case 'daily':
                    entries = getDifferenceFrom(currentxml, idLastSend)
                    entries.reverse()
                    if (dayHour == getHour()) {
                        console.log('helloday')
                    }
                    break
                case 'weekly':
                    if (dayWeek == new Date().getDay() && dayHour == getHour()) {
                        console.log('helloweek')
                    }
                    break
                case 'monthly':
                    if (dayMonth == new Date().getDate() && dayHour == getHour()) {
                        console.log('hellomonth')
                    }
                    break
                case 'off':
                    break
            }
        }
    }
}
cron.schedule('* * * * *', async () => {
    if (new Date().getMinutes() % 5 == 0) {
        await updateXML()
        await checkDifference()
    } else {
        checkDifference()
    }
})
updateXML()
bot.start()
