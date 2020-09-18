const http = require('http');
const https = require('https');
const fetch = require('node-fetch');
var xml2js = require("xml2js");
var parser = new xml2js.Parser(/* options */);
const fs = require('fs')
// var secretsFile = fs.readFileSync('./secrets.json', 'utf-8')
// const secretsFileObj = JSON.parse(secretsFile)
// const BOT_TOKEN = secretsFileObj.BOT_TOKEN
const TeleBot = require('telebot')
// const bot = new TeleBot(BOT_TOKEN)

class Utils {
    constructor() {
    }

    xml2jsobject(data) {
      return parser
        .parseStringPromise(data)
        .then(function (result) {
          return result;
        })
        .catch(function (err) {
          console.log(err);
        });
    }

    async request() {
      return await fetch("https://about.gitlab.com/atom.xml")
        .then((res) => res.text())
        .then((body) => {
          return this.xml2jsobject(body)
        });
    }
    async replyText(text, msg) {
        let isoDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        msg.reply.text(text + '\n' + isoDate)
    }
}

class Message extends TeleBot {
    constructor(cfg) {
        super(cfg)
    }
}


module.exports = {
    Utils: Utils,
    Message: Message
};
