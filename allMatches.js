const request = require("request");
const cheerio = require("cheerio");
const scorecardObj = require("./allScorecard");

function processAllMatchesLinks(url) {
    request(url, cb);
    function cb(err, response, html) {
        if (err) {
            console.log("Error ❗❗", err);
        } else {
            getAllScorecard(html);
        }
    }
}

function getAllScorecard(html) {
    let $ = cheerio.load(html);
    let scorecardElement = $("a[data-hover='Scorecard']");

    for (let i = 0; i < scorecardElement.length; i++) {
        let link = $(scorecardElement[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + link;
        scorecardObj.processScorecardLink(fullLink);
    }
}

module.exports = {
    processMatchLink: processAllMatchesLinks
}