const winston = require('winston')
const { colorize, combine, timestamp, printf, test } = winston.format

const logFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`
})

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), colorize(), logFormat),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            json: false,
            colorize: true,
        }),
    ],
})

const http = require('http')
const https = require('https')
const fetch = require('node-fetch')
var xml2js = require('xml2js')
var parser = new xml2js.Parser(/* options */)
const fs = require('fs')

class Utils {
    constructor(debugMode) {
        this.debugMode = debugMode
        this.currentxml = []
        this.lastxml = []
        this.forceCheck = false
        this.dayWeekEnum = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 }
    }

    xml2jsobject(data) {
        return parser
            .parseStringPromise(data)
            .then(function (result) {
                return result
            })
            .catch(function (err) {
                // logger.error(err)
            })
    }
    async request() {
        return await fetch('https://about.gitlab.com/atom.xml')
            .then((res) => res.text())
            .then((body) => {
                return this.xml2jsobject(body)
            })
    }
    async toJSO(file) {
        return this.xml2jsobject(file)
    }

    debug(text) {
        if (this.debugMode == true) {
            // console.debug(text)
        }
    }

    async getNewXMLentries(currentxml, lastxml) {
        let needle = lastxml
        let haystack = currentxml.feed.entry

        // find the index of the last item
        let needleIndex
        if (needle != '') {
            needleIndex = haystack.findIndex((entry) => entry.id[0] == needle)
        } else {
            needleIndex = 5
        }
        // create a new array with the new entries
        let newHaystack = haystack.slice(0, needleIndex)
        return newHaystack
    }
    getTime() {
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

    async sendNews(chatID, bot, entries, nbr) {
        let iterations

        if (entries.length == 0) {
        }
        if (typeof entries === 'undefined' || entries.length == 0) {
            return
        }
        if (typeof nbr === 'undefined') {
            iterations = entries.length
        } else if (nbr > entries.length) {
            iterations = entries.length
        } else {
            iterations = nbr
        }

        let text = ''
        if (iterations >= 1 && iterations <= 5) {
            for (var i = 0; i < iterations; i++) {
                text += '*' + entries[i].title[0] + '*' + '  [read more](' + entries[i].link[0].$.href + ')' + '\n\n' + '*' + 'Date:            ' + '*' + '_' + entries[i].published + '_'
                if (entries[i].author[0].name[0] != '') {
                    text += '\n' + '*' + 'Author:        ' + '*' + `[${entries[i].author[0].name[0]}](https://about.gitlab.com/company/team/)`
                }
                if (i != iterations - 1) {
                    text += '\n\n-------------------------------------------------------------------\n\n'
                }
            }
        } else if (iterations > 5) {
            for (var i = 0; i < iterations; i++) {
                text += '*' + entries[i].title[0] + '*' + '  [read more](' + entries[i].link[0].$.href + ')' + '\n\n'
            }
        } else {
        }
        await bot.sendMessage(chatID, text, { parseMode: 'Markdown', webPreview: iterations == 1 ? true : false })

        if (entries.length == 0) {
            text = 'No recent results found\n'
            await bot.sendMessage(chatID, text)
        } else if (entries.length < nbr) {
            text = entries.length + ' results found\n'
            await bot.sendMessage(chatID, text)
        } else {
            // logger.debug('Not good type')
        }
    }

    async getFiltered(keyword, array) {
        let nbPage = array.length
        let entries = []
        for (let i = 0; i < nbPage; i++) {
            var sentence = array[i].title[0].toLowerCase()
            if (sentence.includes(keyword.toLowerCase())) {
                entries.push(array[i])
            }
        }
        return entries
    }

    async updateXML() {
        let updated = false
        if (this.currentxml.length == 0 || this.lastxml.length == 0) {
            this.currentxml = await this.request()
            if (this.debugMode) {
                this.lastxml = require('./atom.json')
            } else {
                this.lastxml = this.currentxml
            }
            updated = true
        } else {
            if (this.lastxml.feed.entry[0].id[0] != this.currentxml.feed.entry[0].id[0]) {
                updated = true
            }
            if (this.debugMode == true) {
                this.lastxml = require('./atom.json')
            } else {
                this.lastxml = this.currentxml
            }
            this.currentxml = await this.request()
        }
        if (updated == true) {
            // logger.info('XML file has been updated ')
        }
        return this.currentxml, this.lastxml
    }

    async checkDifference(user, bot) {
        for (const [key, value] of Object.entries(user)) {
            if (value.notify.idLastSend == '') {
                this.forceCheck = true
            }
        }
        if (this.forceCheck == true || this.lastxml.feed.entry[0].id[0] != this.currentxml.feed.entry[0].id[0]) {
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
                let chatInfos = await bot.getChat(chatID)
                entries = await this.getNewXMLentries(this.currentxml, idLastSend)
                if (notifyType != 'all') {
                    let filteredArray = await this.getFiltered(notifyType, entries)
                    if (filteredArray.length == 0) {
                        tmpNotifymode = 'off'
                    } else {
                        entries = filteredArray
                    }
                }
                switch (tmpNotifymode) {
                    case 'auto':
                        await this.sendNews(chatID, bot, entries)
                        user.setIdLastSend(this.currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                        break
                    case 'daily':
                        if (dayHour == this.getTime()) {
                            await this.sendNews(chatID, bot, entries)
                            user.setIdLastSend(this.currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                        }
                        break
                    case 'weekly':
                        if (this.dayWeekEnum[dayWeek] == new Date().getDay() && dayHour == this.getTime()) {
                            await this.sendNews(chatID, bot, entries)
                            user.setIdLastSend(this.currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                        }
                        break
                    case 'monthly':
                        if (dayMonth == new Date().getDate() && dayHour == this.getTime()) {
                            await this.sendNews(chatID, bot, entries)
                            user.setIdLastSend(this.currentxml.feed.entry[0].id[0], chatInfos, chatInfos)
                        }
                        break
                    case 'off':
                        break
                    default:
                        console.log('Error: No match')
                        break
                }
            }
        }
    }

    getUser(userInfos) {
        if (typeof userInfos.username !== 'undefined') {
            return userInfos.username
        } else if (typeof userInfos.first_name !== 'undefined' && typeof userInfos.last_name !== 'undefined') {
            return userInfos.first_name + ' ' + userInfos.last_name
        } else {
            return userInfos.first_name
        }
    }
}

module.exports = Utils
