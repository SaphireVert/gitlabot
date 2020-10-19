[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

# Gitlabot

- A simple bot for gitlab updates

## About The Project

- Gitlabot is a bot which notify users when a new update for gitlab is available.

# Gitlab bot commands

| command                           | description                                                                   |
|-----------------------------------|-------------------------------------------------------------------------------|
| `/start`                          | Display welcome message                                                       |
| `/help`                           | Display a list of available commands                                          |
| `/notify <type\|mode> <param> [args]` <br> **Parameters**: <br> - auto  <br> - off <br> - daily <br> - weekly <br> - monthly <br> <br> **Arguments**: <br> - weekdays <br> - monthday <br> - daytime | Set the notification rules                                                    |
| `/last [nbr]`                     | Display the latest [nbr] blog info (default is 1), regardless of the type     |
| `/release [nbr]`                  | Display the latest [nbr] release info (default is 1)                          |
| `/settings`                       | Display the current settings values                                           |

## Getting started

### Installation

1. Create new bot with BotFather on telegram and copy the bot token

2. Clone the repository

```sh
git clone git@github.com:SaphireVert/gitlabot.git && cd gitlabot
```

3. Install npm packages

```sh
npm install
```

4. Rename sample_secrets.json in secrets.json and replace the bot token value by your own bot token.

5. Start the bot

```sh
make up
```

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[repos]:saphirevert/gitlabot

[contributors-shield]: https://img.shields.io/github/contributors/saphirevert/gitlabot.svg?style=flat-square
[contributors-url]: https://github.com/saphirevert/gitlabot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/saphirevert/gitlabot.svg?style=flat-square
[forks-url]: https://github.com/saphirevert/gitlabot/network/members
[stars-shield]: https://img.shields.io/github/stars/saphirevert/gitlabot.svg?style=flat-square
[stars-url]: https://github.com/saphirevert/gitlabot/stargazers
[issues-shield]: https://img.shields.io/github/issues/saphirevert/gitlabot.svg?style=flat-square
[issues-url]: https://github.com/saphirevert/gitlabot/issues
[license-shield]: https://img.shields.io/github/license/saphirevert/gitlabot.svg?style=flat-square
[license-url]: https://github.com/saphirevert/gitlabot/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
