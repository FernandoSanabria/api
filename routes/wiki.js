const wiki = require("express").Router();
const logger = require("../libs/logger");
const { sprintf } = require("sprintf-js");
const registerManager = require("./register");
const { Base64 } = require("js-base64");



wiki.get('/', (req, res, next) => {
    getWikis(res)
})

function getWikis(res)
{
    const fs = require('fs')

    fs.readdir(sprintf('%s/.wiki', process.cwd()), { encoding: 'utf8'}, (e, files) => {

        if (e)
        {
            console.log(e)
            res.status(500)
            res.json({error: 'Internal Server Error'})
            return
        }
        if (!files.length)
        {
            res.status(503)
            res.json({ error: 'Service Unavailable'})
            return
        }
        res.status(200)
        res.json({ success: 'OK', value: parseFiles(fs, files) } )
    })
}


function parseFiles(fs, files)
{
    var response = []

    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        var wiki = {}

        const data = fs.readFileSync(
            sprintf("%s/.wiki/%s", process.cwd(), element),
            { encoding: "utf8", flag: "r" }
          );
        
        const o = JSON.parse(data)

        for (const iterator in o) {
            wiki[iterator] = o[iterator]
        }
        response.push(wiki)
    }

    return response
}

module.exports = wiki;