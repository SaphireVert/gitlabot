const winston = require('winston')
const { colorize, combine, timestamp, printf } = winston.format

const logFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`
})

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), colorize(), logFormat),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            json: false,
            colorize: true,
        }),
    ],
})

var tmpDebugMode = false
if (process.argv[2] == '--debug=true') {
    console.log('----- DEBUG MODE -----')
    tmpDebugMode = true
}
const DEBUG_MODE = tmpDebugMode

const http = require('http')
const https = require('https')
const fetch = require('node-fetch')
var xml2js = require('xml2js')
var parser = new xml2js.Parser(/* options */)
const fs = require('fs')
const TeleBot = require('telebot')
const Utils = require('./Utils.js')
const utils = new Utils(DEBUG_MODE)


class Users_Settings {
    constructor(filePath) {
        this.importData(filePath)
        this.save()
    }

    async setNotifyMode(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[chatInfos.id].notify.notifyMode = value
        this.save()
    }
    async setNotifyType(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[chatInfos.id].notify.notifyType = value
        this.save()
    }
    async setDayMonth(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[chatInfos.id].notify.dayMonth = value
        this.save()
    }
    async setDayWeek(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[chatInfos.id].notify.dayWeek = value
        this.save()
    }
    async setDayHour(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[chatInfos.id].notify.dayHour = value
        this.save()
    }
    async setIdLastSend(value, userInfos, chatInfos) {
        this.init(userInfos, chatInfos)
        this[chatInfos.id].notify.idLastSend = value
        this.save()
    }
    async addChat(userInfos, chatInfos) {
        this[chatInfos.id.toString()] = {
            notify: {
                notifyMode: 'off',
                notifyType: 'all',
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
            notify: {
                notifyMode: 'off',
                notifyType: 'all',
                dayMonth: '',
                dayWeek: '',
                dayHour: '',
                idLastSend: '',
            },
        }
        this.save()
    }

    async init(userInfos, chatInfos) {
        if (!this[userInfos.id]) {
            logger.info(utils.getUser(userInfos) + ' ' + ((chatInfos.type == 'group') ? chatInfos.title : (chatInfos.type)) + ': Adding user')
            await this.addUser(userInfos, chatInfos)
        }
        if (!this[chatInfos.id]) {
            logger.info(utils.getUser(userInfos) + ' ' + ((chatInfos.type == 'group') ? chatInfos.title : (chatInfos.type)) + ': Adding group')
            await this.addChat(userInfos, chatInfos)
        }
    }

    save() {
        fs.writeFile('./users_settings.json', JSON.stringify(this, null, 2), function writeJSON(err) {})
    }

    reset(userInfos, chatInfos) {
        this[userInfos.id] = ''
        this.save()
    }

    importData(filePath) {
        if (!fs.existsSync(filePath)) {
            logger.warn("File settings doesn't exists, creating it")
            fs.writeFileSync(filePath, '{}')
        } else {
            let file
            try {
                file = require(filePath)
            } catch {
                logger.warn('Invalid JSON file... backuping and recreating file')
                // fs.copyFile(filePath, 'backup.json')
                fs.writeFileSync(filePath, '{}')
                file = require(filePath)
            }
            logger.info('Charging users data')
            for (const [key, value] of Object.entries(file)) {
                this[key] = value
            }
        }
    }
}

module.exports = Users_Settings
