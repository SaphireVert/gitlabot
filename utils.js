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

class Utils {
    constructor() {}

    xml2jsobject(data) {
        return parser
            .parseStringPromise(data)
            .then(function (result) {
                return result
            })
            .catch(function (err) {
                console.log(err)
            })
    }

    async request() {
        return await fetch('https://about.gitlab.com/atom.xml')
            .then((res) => res.text())
            .then((body) => {
                return this.xml2jsobject(body)
            })
    }
    async toJSO(file) {
        return this.xml2jsobject(file)
    }
}

class Message extends TeleBot {
    constructor(cfg) {
        super(cfg)
    }

    on(types, fn, opt) {
        super.on(types, fn, opt)
        console.log('Yeah')
    }

    event(types, data, self) {
        if (types == 'update') {
            console.log('new message')
            console.log(data)
        }
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
        return super.event(types, data, self)
    }
}

class Users_Settings {
    constructor(filePath) {
        this.importData(filePath)
        this.save()
    }

    async setNotifyMode(value, msg) {
        this.init(msg)
        this[msg.from.id].settings.notify.notifyMode = value
        this.save()
    }
    async setDayMonth(value, msg) {
        this.init(msg)
        this[msg.from.id].settings.notify.dayMonth = value
        this.save()
    }
    async setDayWeek(value, msg) {
        this.init(msg)
        this[msg.from.id].settings.notify.dayWeek = value
        this.save()
    }
    async setDayHour(value, msg) {
        this.init(msg)
        this[msg.from.id].settings.notify.dayHour = value
        this.save()
    }
    async setIdLastSend(value, msg) {
        this.init(msg)
        this[msg.from.id].settings.notify.idLastSend = value
        this.save()
    }
    async add(msg) {
        this[msg.from.id] = msg.from
        this[msg.from.id].settings = {
            notify: {
                notifyMode: 'off',
                dayMonth: '',
                dayWeek: '',
                dayHour: '',
                idLastSend: '',
            },
        }
        this.save(msg.from.id)
    }

    init(msg) {
        if (!this[msg.from.id]) {
            console.log('New user detected: ' + msg.from.username)
            console.log('Adding ' + msg.from.username)
            this.add(msg)
        }
    }

    save() {
        fs.writeFile('./users_settings.json', JSON.stringify(this, null, 2), function writeJSON(
            err
        ) {})
    }

    importData(filePath) {
        if (!fs.existsSync(filePath)) {
            console.log("File settings doesn't exists, creating it")
            fs.writeFileSync(filePath, '{}')
        } else {
            let file
            try {
                file = require(filePath)
            } catch {
                console.log('Invalid JSON file... backuping and recreating file')
                // fs.copyFile(filePath, 'backup.json')
                fs.writeFileSync(filePath, '{}')
                file = require(filePath)
            }
            console.log('Charging users data')
            for (const [key, value] of Object.entries(file)) {
                this[key] = value
            }
        }
    }
}

module.exports = {
    Utils: Utils,
    Message: Message,
    Users_Settings: Users_Settings,
}
