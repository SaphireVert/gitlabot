const http = require("http")
const https = require("https")
const fetch = require("node-fetch")
var xml2js = require("xml2js")
var parser = new xml2js.Parser(/* options */)
const fs = require("fs")
// var secretsFile = Fs.readFileSync('./secrets.json', 'utf-8')
// const secretsFileObj = JSON.parse(secretsFile)
// const BOT_TOKEN = secretsFileObj.BOT_TOKEN
const TeleBot = require("telebot")
// const bot = new TeleBot(BOT_TOKEN)

class Users_Settings {
    constructor(filePath) {
        this.importData(filePath)
        this.save()
    }

    async setNotifyMode(value, msg) {
        this.init(msg)
        this[msg.id].chatID.user.settings.notify.notifyMode = value
        this.save()
    }
    async setDayMonth(value, msg) {
        this.init(msg)
        this[msg.id].settings.notify.dayMonth = value
        this.save()
    }
    async setDayWeek(value, msg) {
        this.init(msg)
        this[msg.id].settings.notify.dayWeek = value
        this.save()
    }
    async setDayHour(value, msg) {
        this.init(msg)
        this[msg.id].settings.notify.dayHour = value
        this.save()
    }
    async setIdLastSend(value, msg) {
        this.init(msg)
        this[msg.id].settings.notify.idLastSend = value
        this.save()
    }
    async addChat(msg){
        this[msg.from.id][msg.chat.id.toString()] = {
            notify: {
                notifyMode: "off",
                dayMonth: "",
                dayWeek: "",
                dayHour: "",
                idLastSend: ""
            }
        }
        console.log(this);
        // console.log(this[msg.from.id][msg.chat.id.toString()].valueOf());
        // this[msg.from.id][msg.chat.id.toString()].push('test', 'test2')
        // this[msg.from.id][msg.chat.id.toString()] = array
        // console.log(this[msg.from.id][msg.chat.id.toString()]);
        // this.save(msg.from.id)
    }
    async addUser(msg) {
        this[msg.from.id] = {
            [msg.chat.id.toString()]: {
                notify: {
                    notifyMode: "off",
                    dayMonth: "",
                    dayWeek: "",
                    dayHour: "",
                    idLastSend: ""
                }
            }
        }
    }

    async init(msg) {
        if (!this[msg.from.id]) {
            console.log("New user detected: " + msg.from.username)
            console.log("Adding " + msg.from.username)
            await this.addUser(msg)
        }
        if (!this[msg.from.id][msg.chat.id]){
            await this.addChat(msg)
        }
    }

    save(user) {
        //     getChat
        // }
        console.log(this);
        fs.writeFile("./users_settings.json", JSON.stringify(this, null, 2), function writeJSON(
            err
        ) {})
    }

    reset(msg){
        this[msg.id] = ''
        this.save(msg.id)
    }

    // getUserInfos(userID){
    //     getChat
    // }

    importData(filePath) {
        // if (!fs.existsSync('./data')) {
        //     fs.mkdirSync('./data')
        // }
        // if (!fs.existsSync('./data/users')) {
        //     fs.mkdirSync('./data/users')
        // }
        // if (!fs.existsSync('./data/groups')) {
        //     fs.mkdirSync('./data/groups')
        //     // console.log("n'existe pas")
        // }
        if (!fs.existsSync(filePath)) {
            console.log("File settings doesn't exists, creating it")
            fs.writeFileSync(filePath, "{}")
        } else {
            let file
            try {
                file = require(filePath)
            } catch {
                console.log("Invalid JSON file... backuping and recreating file")
                // fs.copyFile(filePath, 'backup.json')
                fs.writeFileSync(filePath, "{}")
                file = require(filePath)
            }
            console.log("Charging users data")
            for (const [key, value] of Object.entries(file)) {
                this[key] = value
            }
        }
    }
}

module.exports = Users_Settings
