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
        // console.log('Yeah')
    }

    event(types, data, self) {
        if (types == 'update') {
            // console.log('new message')
            // data[0].message.test = 'test'
            // console.log(data)
            // console.log('updated-----------')
        }
        if (types == 'start') {
            // console.log('STAAART')
            // console.log(data)
        }
        // console.log(types);
        // Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
        return super.event(types, data, self)
    }
}

module.exports = Message
