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

const http = require('http')
const https = require('https')
const fetch = require('node-fetch')
var xml2js = require('xml2js')
var parser = new xml2js.Parser(/* options */)
const fs = require('fs')
// var secretsFile = Fs.readFileSync('./secrets.json', 'utf-8')
// const secretsFileObj = JSON.parse(secretsFile)
// const BOT_TOKEN = secretsFileObj.BOT_TOKEN
const TeleBot = require('telebot')
// const bot = new TeleBot(BOT_TOKEN)

class Utils {
    constructor(debugMode) {
        this.debugMode = debugMode
        this.currentxml = []
        this.lastxml = []
    }

    xml2jsobject(data) {
        return parser
            .parseStringPromise(data)
            .then(function (result) {
                return result
            })
            .catch(function (err) {
                logger.error(err)
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
            logger.debug(text)
        }
    }

    async getNewXMLentries(currentxml, lastxml) {
        let needle = lastxml
        let haystack = currentxml.feed.entry

        // find the index of the last item
        let needleIndex
        if (needle != '') {
            logger.debug('getNewXMLentries: lastxml = ' + lastxml)
            needleIndex = haystack.findIndex((entry) => entry.id[0] == needle)
            logger.debug('needleIndex is: ' + needleIndex)
        } else {
            logger.debug('getNewXMLentries: lastxml is empty')
            needleIndex = 5
        }
        // create a new array with the new entries
        let newHaystack = haystack.slice(0, needleIndex)
        return newHaystack
    }
    getTime(){
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
        logger.debug('nbr = ' + nbr)
        if (typeof entries === 'undefined') {
            logger.warn('sendNews: The array is empty')
            return
        }
        if (typeof nbr === 'undefined') {
            iterations = entries.length
            logger.debug('entries.length = ' + entries.length)
        } else if (nbr > entries.length) {
                iterations = entries.length
        } else {
            iterations = nbr
        }


        let text = ''
        if (iterations >= 1 && iterations <= 5) {
            for (var i = 0; i < iterations; i++) {
                text +=
                '*' +
                entries[i].title[0] +
                '*' +
                '\n\n' +
                '*' +
                'Date:            ' +
                '*' +
                '_' +
                entries[i].published +
                '_' +
                '\n' +
                '*' +
                'Author:        ' +
                '*' +
                '_' +
                entries[i].author[0].name[0] +
                '_' +
                '\n\n' +
                // '*' +
                // 'Link:          \n' +
                // '*' +
                entries[i].link[0].$.href
                if (i != iterations - 1) {
                    text += '\n\n-------------------------------------------------------------------\n\n'
                }
            }
        } else if (iterations > 5) {
            for (var i = 0; i < iterations; i++) {
                text +=
                '*' +
                entries[i].title[0] +
                '*' +
                '  [read more](' + entries[i].link[0].$.href + ')' +
                '\n\n'
            }

        } else {
            logger.debug('sendNews: The nbr argument is negative')
        }
        await bot.sendMessage(chatID, text, { parseMode: 'Markdown', webPreview: (iterations == 1 ? true : false) })

        if (entries.length == 0) {
            text = 'No recent results found\n'
            bot.sendMessage(chatID, text)
        } else if (entries.length < nbr) {
            text = entries.length + ' results found\n'
            bot.sendMessage(chatID, text)
        } else {
            logger.debug('Not good type')
        }

    }

    async getFiltered (keyword, array) {
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
            logger.debug('updatestart')
        } else {
            logger.debug(this.lastxml.feed.entry[0].id[0])
            logger.debug(this.currentxml.feed.entry[0].id[0])
            if (this.lastxml.feed.entry[0].id[0] != this.currentxml.feed.entry[0].id[0]) {
                updated = true
                logger.debug('updated')
            }
            if (this.debugMode == true) {
                this.lastxml = require('./atom.json')
            } else {
                this.lastxml = this.currentxml
            }
            this.currentxml = await utils.request()
        }
        if (updated == true) {
            logger.info('[' + this.getTime() + ']' + '[bot.info] XML file has been updated ')
        }
        return this.currentxml, this.lastxml
    }

    // async initXML() {
    //     await updateXML()
    //     cron.schedule('* * * * *', async () => {
    //         if (new Date().getMinutes() % 5 == 0) {
    //             await updateXML()
    //             await checkDifference()
    //         } else {
    //             await checkDifference()
    //         }
    //     })
    // }
}

module.exports = Utils
