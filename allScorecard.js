const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
// let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";

function processAllScorecardLinks(url) {
    request(url, cb);
    function cb(err, response, html) {
        if (err) {
            console.log("Error ❗❗", err);
        } else {
            getAllInnings(html);
        }
    }
}

function getAllInnings(html) {
    let $ = cheerio.load(html);
    // Details We Want To Get
    //=>> Venue date opponent result runs balls fours sixes sr

    // get venue and date from description
    let descriptionElement = $(".match-header-info.match-info-MATCH .description");
    let descriptionStrArr = descriptionElement.text().split(",");
    let venue = descriptionStrArr[1].trim();
    let date = descriptionStrArr[2].trim();

    // get result from status 
    let statusElement = $(".match-info.match-info-MATCH.match-info-MATCH-half-width .status-text");
    let result = statusElement.text();

    // get innings from innings element
    let inningsElement = $(".card.content-block.match-scorecard-table>.Collapsible");

    // Seperate single match innings html
    // let htmlStr = "";
    // for (let i = 0; i < inningsElement.length; i++) {
    //     let currHtml = $(inningsElement[i]).html();
    //     htmlStr += currHtml;
    // }

    // console.log(htmlStr);

    for (let i = 0; i < inningsElement.length; i++) {

        // Seperate Both the teams
        let teamName = $(inningsElement[i]).find("h5").text();
        teamName = teamName.split("INNINGS")[0].trim();
        let opponentIndx = i == 0 ? 1 : 0;  // Opposite team
        let opponentTeam = $(inningsElement[opponentIndx]).find("h5").text();
        opponentTeam = opponentTeam.split("INNINGS")[0].trim();

        // Get batsman table of Both Teams
        let allRowsArr = $(inningsElement[i]).find(".table.batsman tbody tr");

        for (let j = 0; j < allRowsArr.length; j++) {
            // Check for valid row
            let allColumnArr = $(allRowsArr[j]).find("td");
            let validRow = $(allColumnArr[0]).hasClass("batsman-cell");

            if (validRow == true) {
                // Get Player Details
                let playerName = $(allColumnArr[0]).text().trim();
                let runs = $(allColumnArr[2]).text().trim();
                let balls = $(allColumnArr[3]).text().trim();
                let fours = $(allColumnArr[5]).text().trim();
                let sixes = $(allColumnArr[6]).text().trim();
                let sr = $(allColumnArr[7]).text().trim();

                // console.table([`${playerName}`, `${runs}`, `${balls}`, `${fours}`, `${sixes}`, `${sr}`]);
                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, date, venue, result);
            }
        }

    }

}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, date, venue, result) {
    let teamPath = path.join(__dirname, "ipl", teamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath, playerName + ".xlsx");

    // Read Content of Excel File
    let content = excelReader(filePath, playerName);

    // Make new Data Entry Object and Push it in content of the file
    let playerObj = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opponentTeam,
        date,
        venue,
        result
    }
    content.push(playerObj);

    // Write content in Excel File
    excelWriter(content, playerName, filePath);
}

function excelWriter(json, sheetName, FilePath) {

    let newWB = xlsx.utils.book_new();
    // let newWS = xlsx.utils.json_to_sheet(json);
    
    //******************************😀Formating Excel Sheet😁***************************************** */
    let newWS = exportAsExcelFile(json);
    //***************************************😀Done😁************************************* */

    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, FilePath);
}

function excelReader(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) {
        return [];
    }

    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);

    return ans;
}

function dirCreator(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}

function exportAsExcelFile(json) {

    const header = Object.keys(json[0]); // columns name

    var wscols = [];
    for (var i = 0; i < header.length; i++) {  // columns length added
        wscols.push({ wch: header[i].length * 2 })
    }
    const worksheet = xlsx.utils.json_to_sheet(json);
    worksheet["!cols"] = wscols;

    return worksheet;
}

module.exports = {
    processScorecardLink: processAllScorecardLinks
}