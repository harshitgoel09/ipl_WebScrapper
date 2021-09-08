const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const matchesObj = require("./allMatches");

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

// Create ipl Folder
const iplPath = path.join(__dirname,"ipl");
dirCreator(iplPath);

request(url, cb);
function cb(err, response, html) {
    if (err) {
        console.log("Error ❗❗", err);
    } else {
        getAllMatches(html);
    }
}

function getAllMatches(html) {
    let $ = cheerio.load(html);
    let anchorElement = $("a[data-hover='View All Results']");
    let link = $(anchorElement).attr("href");
    let fullLink = "https://www.espncricinfo.com" + link;
    matchesObj.processMatchLink(fullLink);
}

function dirCreator(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}