var cron = require('node-cron');
const fs = require('fs');
const http = require('http');
const https = require('https');
const Utils = require('./utils.js');
const couteauSuisse = new Utils();
var secretsFile = fs.readFileSync('./secrets.json', 'utf-8');
const secretsFileObj = JSON.parse(secretsFile);
const BOT_TOKEN = secretsFileObj.BOT_TOKEN;
const TeleBot = require('telebot');
const bot = new TeleBot(BOT_TOKEN);
const fetch = require('node-fetch');
var parseString = require('xml2js').parseString;
msg_sample = "totomsg";


function getLast(){
};

function toto(msg){
    console.log("fidvhfidfgsiofo----------------------------------------");
}
bot.on('/start', (msg) => msg.reply.text("Welcome to gitlabot ! Type /help to get some help."));
bot.on('/help' , (msg) => msg.reply.text("Commands list:\n/start: Start the bot \n/help: Display the command list"));
// bot.on('/last' , (msg) => {
bot.on([/^\/last$/, /^\/last (.+)$/] , (msg, props) => {
    var nbPage;
    if (typeof props.match[1] === "undefined") {
        nbPage = 1;
    } else {
        nbPage = Number(props.match[1]);
    }
    fetch('https://about.gitlab.com/atom.xml')
    .then(res => res.text())
    .then(body => {
        // console.log(body)
        parseString(body, function (err, result) {
            // console.dir(result);
            // console.log(result.feed.entry[0]);
            // console.log(result.feed.entry[0].content[0]._);
            // console.log(props.match[1]);
            // msg.reply.text(result.feed.entry[0].title[0]);
            // msg.reply.text(result.feed.entry[0].content[0]._);
            for(i=0;i<nbPage;i++) {
                console.log(i);
                msg.reply.text(result.feed.entry[i].title[0]);
                // msg.reply.text(result.feed.entry[i].author.name);
                // msg.reply.text(result.feed.entry[i].link[0].href);
                console.log(result.feed.entry[i].link[0].$.href);
            }
        });
    });
});

bot.on('/notify' , (msg) => msg.reply.text("Commands list:\n/start: Start the bot \n/help: Display the command list"));


// cron.schedule('* * * * * *', () => {
//   console.log('running a task every second');
// });

couteauSuisse.test();
// bot.on('/toto', toto(msg));
// test()

// toto(msg_sample);

bot.start();
