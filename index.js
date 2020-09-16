var cron = require('node-cron')
const fs = require('fs')
const http = require('http')
const https = require('https')
const Utils = require('./utils.js')
const couteauSuisse = new Utils()
var secretsFile = fs.readFileSync('./secrets.json', 'utf-8')
const secretsFileObj = JSON.parse(secretsFile)
const BOT_TOKEN = secretsFileObj.BOT_TOKEN
const TeleBot = require('telebot')
const bot = new TeleBot(BOT_TOKEN)
const fetch = require('node-fetch')
var parseString = require('xml2js').parseString
var lastxml = []

bot.on('/start', (msg) => msg.reply.text('Welcome to gitlabot ! Type /help to get some help.'))
bot.on('/help', (msg) =>
  msg.reply.text('Commands list:\n/start: Start the bot \n/help: Display the command list')
)

bot.on([/^\/last$/, /^\/last (.+)$/], async (msg, props) => {
  var nbPage
  if (typeof props.match[1] === 'undefined') {
    nbPage = 1
  } else {
    nbPage = Number(props.match[1])
  }
  if (lastxml.length == 0){
      await msg.reply.text('No recent results found')
  }
  let yesOrNo = false
  if (nbPage > lastxml.feed.entry.length) {
      nbPage = lastxml.feed.entry.length
      yesOrNo = true
  }
  console.log(nbPage);
  for (i = 0; i < nbPage; i++) {
      await msg.reply.text(
          lastxml.feed.entry[i].title[0] +
          '\nAuthor: ' +
          lastxml.feed.entry[i].author[0].name[0] +
          '\n' +
          lastxml.feed.entry[i].link[0].$.href
      )
  }
  if (yesOrNo == true) {
      msg.reply.text(lastxml.feed.entry.length + ' results founds')
  }
})

bot.on('/notify', (msg) =>
  msg.reply.text('Commands list:\n/start: Start the bot \n/help: Display the command list')
)

bot.on([/^\/release$/, /^\/release (.+)$/], async (msg, props) => {
  var nbPage
  if (typeof props.match[1] === 'undefined') {
    nbPage = 1
  } else {
    nbPage = Number(props.match[1])
  }
  var entries = []
  let compteur = 0
  for (let i = 0; compteur < nbPage && i < lastxml.feed.entry.length; i++) {
    var sentence = lastxml.feed.entry[i].title[0].toLowerCase()
    var word = 'Release'
    if (sentence.includes(word.toLowerCase())) {
      compteur++
      entries.push(i)
    }
  }
  console.log(entries)
  for (var i = 0; i < entries.length; i++) {
    await msg.reply.text(
      lastxml.feed.entry[entries[i]].title +
        '\nAuthor: ' +
        lastxml.feed.entry[i].author[0].name[0] +
        '\n' +
        lastxml.feed.entry[i].link[0].$.href
    )
  }
  if (compteur == 0) {
    msg.reply.text('No recent results found')
  } else if (compteur < nbPage) {
    msg.reply.text(compteur + ' results founds')
  }
})

cron.schedule('* * * * * *', async () => {
  lastxml = await couteauSuisse.request()
})

bot.start()
