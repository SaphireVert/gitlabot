const http = require('http')
const https = require('https')
const fetch = require('node-fetch')
var xml2js = require('xml2js')
var parser = new xml2js.Parser(/* options */)
const fs = require('fs')
const TeleBot = require('telebot')

class Users_Settings {
    constructor(filePath) {
        this.importData(filePath)
        this.save()
    }

    async setNotifyMode(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[userInfos.id][chatInfos.id].notify.notifyMode = value
        this.save()
    }
    async setDayMonth(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[userInfos.id][chatInfos.id].notify.dayMonth = value
        this.save()
    }
    async setDayWeek(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[userInfos.id][chatInfos.id].notify.dayWeek = value
        this.save()
    }
    async setDayHour(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[userInfos.id][chatInfos.id].notify.dayHour = value
        this.save()
    }
    async setIdLastSend(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[userInfos.id][chatInfos.id].notify.idLastSend = value
        this.save()
    }
    async addChat(userInfos, chatInfos) {
        this[userInfos.id][chatInfos.id.toString()] = {
            notify: {
                notifyMode: 'off',
                dayMonth: '',
                dayWeek: '',
                dayHour: '',
                idLastSend: '',
            },
        }
        this.save()
    }
    async addUser(userInfos, chatInfos) {
        this[userInfos.id] = {
            [chatInfos.id.toString()]: {
                notify: {
                    notifyMode: 'off',
                    dayMonth: '',
                    dayWeek: '',
                    dayHour: '',
                    idLastSend: '',
                },
            },
        }
        this.save()
    }

    async init(userInfos, chatInfos) {
        if (!this[userInfos.id]) {
            console.log('New user detected: ' + userInfos.username)
            console.log('Adding ' + userInfos.username)
            await this.addUser(userInfos, chatInfos)
        }
        if (!this[userInfos.id][chatInfos.id]) {
            await this.addChat(userInfos, chatInfos)
        }
    }

    save() {
        console.log(this)
        fs.writeFile('./users_settings.json', JSON.stringify(this, null, 2), function writeJSON(err) {})
    }

    reset(userInfos, chatInfos) {
        this[userInfos.id] = ''
        this.save()
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

module.exports = Users_Settings
