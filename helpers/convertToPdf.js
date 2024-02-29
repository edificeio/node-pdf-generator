const exec = require('child_process').exec;
const fs = require('fs');
const os = require('os');
const path = require("path");
const util = require("util");
const tempPath = os.tmpdir();
const readFile = util.promisify(fs.readFile);
const unlinkFile = util.promisify(fs.unlink);
const config = require('../conf/config.json');

const timeout = (config.processTimeoutAsMin? config.processTimeoutAsMin : 10) * 60000

const waitChild = (childProc) => {
    return new Promise((resolve, reject) => {
        childProc.on("exit", resolve)
        childProc.on("error", reject);
    })
}
const convertToPdf = async (filePath, kind) => {
    const toClean = [];
    switch (kind) {
        case 'document':
            childProc = exec(`soffice --headless --convert-to pdf:writer_pdf_Export --outdir ${tempPath} ${filePath}`, {timeout});
            break;
        case 'spreadsheet':
            childProc = exec(`soffice --headless --convert-to pdf:calc_pdf_Export --outdir ${tempPath} ${filePath}`, {timeout});
            break;
        case 'csv_multisheet': {
                //convertx to xlsx
                childProc = exec(`soffice --headless --convert-to xlsx:"Calc MS Excel 2007 XML" --outdir ${tempPath} ${filePath}`, {timeout});
                childProc.stdout.pipe(process.stdout);
                childProc.stderr.pipe(process.stderr);
                await waitChild(childProc);
                //convert to csv
                const fullname = path.parse(filePath).name;
                const outputPath = path.join(tempPath, fullname+".xlsx");
                toClean.push(outputPath);
                childProc = exec(`xlsx2csv -p="\\f" -a ${outputPath} > ${filePath}.csv`, {timeout});
                break;
        }
        case 'csv': {
                //https://wiki.openoffice.org/wiki/Documentation/DevGuide/Spreadsheets/Filter_Options#Filter_Options_for_the_CSV_Filter
                //44 is comma separator
                //second argument for double quote
                //76 for utf8
                childProc = exec(`soffice --headless --convert-to csv:\"Text - txt - csv (StarCalc)\":44,,76 --outdir ${tempPath} ${filePath}`, {timeout});
                break;
        }
        case 'presentation':
            childProc = exec(`soffice --headless --convert-to pdf:impress_pdf_Export --outdir  ${tempPath} ${filePath}`, {timeout});
            break;
        default:
            throw "Unknown kind: " + kind;
    }
    childProc.stdout.pipe(process.stdout);
    childProc.stderr.pipe(process.stderr);
    await waitChild(childProc);
    const fullname = path.parse(filePath).name;
    const output = (kind == "csv" || kind == "csv_multisheet") ? fullname + ".csv" : fullname + ".pdf";
    const outputPath = path.join(tempPath, output);
    toClean.push(outputPath);
    toClean.push(filePath)
    const result = await readFile(outputPath);
    //dont wait clean
    const cleaner = async () => {
        for(let file of toClean){
            try{
                await unlinkFile(file);
            }catch(e){
                console.error('[convertToPdf] Could not unlink file : ', file)
            }
        }
    }
    cleaner();
    return result;
}

module.exports = convertToPdf;

