const winston = require('winston')
const { colorize, combine, timestamp, printf } = winston.format

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
// var secretsFile = Fs.readFileSync('./secrets.json', 'utf-8')
// const secretsFileObj = JSON.parse(secretsFile)
// const BOT_TOKEN = secretsFileObj.BOT_TOKEN
const TeleBot = require('telebot')
// const bot = new TeleBot(BOT_TOKEN)

class Message extends TeleBot {
    constructor(cfg) {
        super(cfg)
    }

    on(types, fn, opt) {
        super.on(types, fn, opt)
        // logger.debug('Yeah')
    }

    event(types, data, self) {
        if (types == 'update') {
            // logger.debug('new message')
            // data[0].message.test = 'test'
            // logger.debug(data)
            // console.debug(data)
            // logger.debug('updated-----------')
        }
        if (types == 'start') {
            // console.debug(data)
            // data.text = '/notify'
            // logger.debug('STAAART')
            // logger.debug(data)
        }
        // logger.debug(types);
        // Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
        return super.event(types, data, self)
    }
}

module.exports = Message
