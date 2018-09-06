const reports = require("express").Router();
const logger = require("../libs/logger");
const { sprintf } = require("sprintf-js");
const registerManager = require("./register");
const { Base64 } = require("js-base64");
const { encrypt } =  require('../libs/genkey');
const fs = require('fs');


reports.post('/', (req, res, next) => {
    if (!req.body.user || !req.body.key || !req.body.coords || !req.body.date) {
        res.status(400);
        res.json({ title: 'Error', error: "Bad request" });
        return;
    }
    const n = new String(req.body.user).toString().replace('<', '', '>', '');
    const k = new String(req.body.key).toString().replace('<', '', '>', '');
    const c = new String(req.body.coords).toString().replace('<', '', '>', '');
    const d = new Number(req.body.date);
    const n_re = new RegExp('^[A-Za-z0-9]+$', 'g');
    /** Format: [[+|-]0-9,[+|-]0-9] */
    const c_re = new RegExp('^\\[(\\-)?([0-9]+)(\\.)?([0-9]+)?(\\,)((\\-)?([0-9]+)(\\.)?([0-9]+)?)?\\]$', 'g');

    if (!c.match(c_re)) {
        res.status(400);
        res.json({ title: 'Error', error: "Bad request" });
        return;
    }
    if (!n.match(n_re)) {
        res.status(400);
        res.json({ title: 'Error', error: "Bad request" });
        return;
    }
    if (isNaN(d)) {
        res.status(400);
        res.json({ title: 'Error', error: "Bad request" });
        return;
    }

    if (!registerManager.resolveUser(registerManager.safeURL(Base64.encode(n)))
        || !registerManager.authUser(registerManager.safeURL(Base64.encode(n)), k)) {
        res.status(401)
        res.json({ error: 'Unauthorized' });
        return
    }

    var report = {
        user: encrypt(n).value,
        coords: encrypt(c).value,
        date:  d
    };

    const t = new Date().getTime();
    const path_report = sprintf('%d', t)

    createReport(res, path_report, report);

})

function createReport(res, path, report)
{
    try 
    {
        const p = sprintf('%s/.reports/%s.json', process.cwd(), path);
        const data = JSON.stringify(report)
        fs.writeFileSync(p, data, { encoding: 'utf8', mode: fs.constants.S_IRWXU, flag: 'w'});
        res.status(200)
        res.json({succes: 'OK', message: 'report received, thanks'})
    } catch(e)
    {
        res.status(500)
        res.json({error: 'Try again'})
        //log cause error here
    }
}

module.exports = reports;