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
