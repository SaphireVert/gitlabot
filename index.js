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
                msg.reply.text(result.feed.entry[i].title[0] + "\nAuthor: " + result.feed.entry[i].author[0].name[0] + "\n" + result.feed.entry[i].link[0].$.href);
                // msg.reply.text(result.feed.entry[i].author[0].name[0]);
                // msg.reply.text(result.feed.entry[i].link[0].$.href);
                // msg.reply.text(result.feed.entry[i].author.name);
                // msg.reply.text(result.feed.entry[i].link[0].href);
                // console.log(result.feed.entry[i].link[0].$.href);
                // console.dir(result.feed.entry[i].author[0].name[0]);
            }
        });
    });
});

bot.on('/notify' , (msg) => msg.reply.text("Commands list:\n/start: Start the bot \n/help: Display the command list"));


bot.on([/^\/release$/, /^\/release (.+)$/] , async (msg) => {
    // var sentence = "Bonjour, le soleil est beau aujourd'hui";
    // var word = "beauigf";
    // if(sentence.includes(word)){
    //     console.log("oui !!!");
    // }
    var result = await couteauSuisse.getInfos();
    console.dir(result);
    // console.log(result.feed);
    // title = result.feed.entry[0].title[0];
    // if (title.includes("release")) {
    //     msg.reply.text("yeah ! L'article contient release dans le titre !!!!!!!!!!")
    // }
});


// couteauSuisse.test();




bot.start();


// cron.schedule('* * * * * *', () => {
    //   console.log('running a task every second');
    // });
