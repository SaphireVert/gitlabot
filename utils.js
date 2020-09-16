const http = require('http');
const https = require('https');
const fetch = require('node-fetch');
var xml2js = require("xml2js");
var parser = new xml2js.Parser(/* options */);

class Utils {
    constructor() {
        // this.haha = "test";
    }

    xml2jsobject(data) {
      return parser
        .parseStringPromise(data)
        .then(function (result) {
          return result;
        })
        .catch(function (err) {
          console.log(err);
        });
    }

    async request() {
      return await fetch("https://about.gitlab.com/atom.xml")
        .then((res) => res.text())
        .then((body) => {
          return this.xml2jsobject(body)
        });
    }

}

module.exports = Utils;
