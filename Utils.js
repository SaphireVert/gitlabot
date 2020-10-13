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

}

module.exports = Utils
