const fetch = require('node-fetch');
var parseString = require('xml2js').parseString;


async function test () {
    return await fetch('https://about.gitlab.com/atom.xml')
      .then(res => res.text())
      .then(body => {
          // console.log(body)
          return parseString(body, function (err, result) {
              if (!err) {
                  return result;
              } else {
                  console.err(err);
              }
          });

      })
}

async function run () {
    let result = await test()
    console.log(result)
}

run()
