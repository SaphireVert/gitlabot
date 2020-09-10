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
var fichier_a_comparer = "";
var reference = [];
var diff = [];


function toto(msg){
    console.log("fidvhfidfgsiofo----------------------------------------");
}

async function getResults(){
    return await couteauSuisse.request();
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


bot.on([/^\/release$/, /^\/release (.+)$/] , async (msg, props) => {
    var nbPage;
    if (typeof props.match[1] === "undefined") {
        nbPage = 1;
    } else {
        nbPage = Number(props.match[1]);
    }
    var result = await couteauSuisse.request();
    // console.log(result);


    for(var i=0;i<nbPage;i++) {
        // console.log(i);
        var sentence = result.feed.entry[i].title[0];
        var word = "elease";
        if(sentence.includes(word)){
            console.log("oui !!!");
            msg.reply.text(result.feed.entry[i].title + "\nAuthor: " + result.feed.entry[i].author[0].name[0] + "\n" + result.feed.entry[i].link[0].$.href);
        }
        console.log(result.feed.entry[i].title);
    }
});

// bot.on('/notify', (msg) => {
//     return msg.reply.sticker('http://i.imgur.com/VRYdhuD.png', { asReply: true });
// });

async function cronWork(){
    console.log('Function start');
    let check = await couteauSuisse.request();
    // check = check.feed.id[0]
    let tmpArray = [];
    // Thanks to https://stackoverflow.com/a/19084915/13715020
    for (var i = 0; i < check.feed.entry.length; i++) {
        tmpArray.push(check.feed.entry[i].id[0])
    }
    console.log("Flux RSS mis à jour")

    // Thanks to https://stackoverflow.com/a/13523757/13715020
    if (!(reference.length == tmpArray.length
        && reference.every(function(u, i) {
            return u === tmpArray[i];
        })
    ))  {
       console.log("Le fichier a changé");
       diff = [];
       for (var i = 0; i < reference.length; i++) {
           // Thanks to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
           var found = tmpArray.find(element => element == reference[i]);
           if (!found) {
               diff.push(tmpArray[i])
           }
       }
       diff = diff.reverse();
       reference = tmpArray;
       console.log(diff);
   }
   // bot.sendMessage()
   console.log("End function");
}

cron.schedule('* * * * * *', () => {
    cronWork();
});



reference = [ 'https://about.gitlab.com/blog/2020/09/10/cloud-native-storage-beginners/',
              'https://about.gitlab.com/blog/2020/09/09/being-a-better-ally/',
              'https://about.gitlab.com/blog/2020/09/08/gnome-follow-up/',
              'https://about.gitlab.com/blog/2020/09/08/efficient-code-review-tips/',
              'https://about.gitlab.com/releases/2020/09/04/gitlab-13-3-5-released/',
              'https://about.gitlab.com/blog/2020/09/03/how-being-public-by-default-in-security-builds-trust/',
              'https://about.gitlab.com/blog/2020/09/03/is-devops-for-designers/',
              'https://about.gitlab.com/blog/2020/09/03/risk-mapping/',
              'https://about.gitlab.com/blog/2020/09/02/imposter-syndrome-and-remote-work/',
              'https://about.gitlab.com/releases/2020/09/02/security-release-gitlab-13-3-3-released/',
              'https://about.gitlab.com/blog/2020/09/01/a-tale-of-two-editors/',
              'https://about.gitlab.com/blog/2020/09/01/using-bazel-to-speed-up-gitlab-ci-builds/',
              'https://about.gitlab.com/releases/2020/09/01/ci-minutes-update-free-users/',
              'https://about.gitlab.com/blog/2020/08/31/how-to-configure-dast-full-scans-for-complex-web-applications/',
              'https://about.gitlab.com/releases/2020/08/28/gitlab-13-3-2-released/',
              'https://about.gitlab.com/blog/2020/08/27/applying-risk-management-to-remote-learning/',
              'https://about.gitlab.com/blog/2020/08/27/measuring-engineering-productivity-at-gitlab/',
              'https://about.gitlab.com/blog/2020/08/25/ten-devops-terms/',
              'https://about.gitlab.com/releases/2020/08/25/gitlab-13-3-1-released/',
              'https://about.gitlab.com/blog/2020/08/24/gitlab-achieves-kcsp-status/i',
              'https://about.gitlab.com/releases/2020/08/22/gitlab-13-3-released/iiiiiiii' ]



bot.start();
