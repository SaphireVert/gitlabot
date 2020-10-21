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
const TeleBot = require('telebot')

class Message extends TeleBot {
    constructor(cfg) {
        super(cfg)
    }

    on(types, fn, opt) {
        super.on(types, fn, opt)
    }

    event(types, data, self) {
        return super.event(types, data, self)
    }
}

module.exports = Message
