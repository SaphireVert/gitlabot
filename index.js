const fs = require('fs');
var secretsFile = fs.readFileSync('./secrets.json', 'utf-8');
const secretsFileObj = JSON.parse(secretsFile);
const BOT_TOKEN = secretsFileObj.BOT_TOKEN;
const TeleBot = require('telebot');
const bot = new TeleBot(BOT_TOKEN);

bot.on('/start', (msg) => msg.reply.text("Bienvenue sur gitlabot ! Faites /help pour obtenir de l'aide."));
bot.on('/help', (msg) => msg.reply.text("Voici la liste des commandes : /start /help"));

bot.start();
