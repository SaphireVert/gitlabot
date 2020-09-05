const http = require('http');
const https = require('https');
const fetch = require('node-fetch');
var parseString = require('xml2js').parseString;

class Utils {
    constructor() {
        // this.haha = "test";
    }

    test() {
        // console.log(this.haha);
        // console.log("----------------------------");
        var sentence = "Bonjour, le soleil est beau aujourd'hui";
        var word = "beau";
        if(sentence.includes(word)){
            console.log("oui !!!");
        }
    }
    async xmlStringTojs(body){
        return await parseString(body, function (err, result) {
            if (!err) {
                console.log("jdvxkfgidkjmfdkifsokl------------");
                console.log(result);
                return result;
            } else {
                // console.err(err);
            }
        });
    }

    async request () {
        return await fetch('https://about.gitlab.com/atom.xml')
          .then(res => res.text())
          .then(async body => {
              var final = await this.xmlStringTojs(body);
              console.log(final);
              return final;
          })
    }

    async getInfos () {
        let result = await this.request()
        // console.log(result)
        return result;
    }
    async getInfosvdgd() {
        var result;
        var nbPage = 1;
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
                for(var i=0;i<nbPage;i++) {
                    console.log(i);
                    // msg.reply.text(result.feed.entry[i].title[0] + "\nAuthor: " + result.feed.entry[i].author[0].name[0] + "\n" + result.feed.entry[i].link[0].$.href);
                    // console.log(result.feed.entry[i].title[0] + "\nAuthor: " + result.feed.entry[i].author[0].name[0] + "\n" + result.feed.entry[i].link[0].$.href);
                    // msg.reply.text(result.feed.entry[i].author[0].name[0]);
                    // msg.reply.text(result.feed.entry[i].link[0].$.href);
                    // msg.reply.text(result.feed.entry[i].author.name);
                    // msg.reply.text(result.feed.entry[i].link[0].href);
                    // console.log(result.feed.entry[i].link[0].$.href);
                    // console.dir(result.feed.entry[i].author[0].name[0]);
                    // console.dir(result);
                }
            });
        });
    }
}

module.exports = Utils;
