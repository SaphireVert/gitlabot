# Gitlab bot commands

| command      | description                                              |
| ------------ | -------------------------------------------------------- |
| `/start`     | Display welcome message                                  |
| `/help`      | Display a list of available commands                     |
| `/last`      | Display the latest blog info, regardless of the type     |
| `/last 5`    | Display the latest 5 blog info, regardless of the type   |
| `/release`   | Display the latest release info                          |
| `/release 5` | Display the latest 5 release info                        |

## ToDo

  * `/last 5 type` where type in [release (default), engineering, open source,
    culture, insights, company, security, unfiltered
    * 💡 Add buttons to choose the type ?
    * 💡 /release, /culture, etc.
  * User should be able to choose when to receive notification :
     * `/notify auto` get the notification as soon as the server gets it
     * `/notify daily 08:00` user get all the *new* notifications that have
        appeared since the last one
     * `/notify weekly 08:00` user get all the *new* notifications that have
        appeared since the last one, on monday 08:00
     * `/notify monthly 08:00` user get all the *new* notifications that have
       appeared since the last one, on the first of the month 08:00
   * `/settings` user can see the current notification preference
   * Admin can ask the server for a dump of the storage file that contains every
     users preference
   * Other use case: what if a user want to have the new release notification as
     soon as possible but want a weekly digest of security and engineering posts ?
     
# gitlabot
A simple bot for gitlab updates

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

## About The Project

Gitlabot is a bot which notify users when a new update for gitlab is available.

## Getting started

### Prerequisites

You will need the following :

* npm
* nodejs
* telebot

```sh
sudo apt install nodejs npm
```


### Installation

1. Create new bot with BotFather on telegram and copy the bot token

2. Clone the repository

```sh
git clone git@github.com:SaphireVert/gitlabot.git
```

3. Install npm packages

```sh
npm install telebot
```

4. Copy secrets_sample.json and replace the bot token value by your own bot token. You can also define it in your ENV by naming your ENV: BOT_TOKEN

5. Start the bot

```sh
npm start
```
