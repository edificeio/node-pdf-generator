const express = require("express");
const router = express.Router();
const generatePdf = require("../helpers/generatePdf");
const printPdf = require("../helpers/printPdf");
const convertToPdf = require("../helpers/convertToPdf");
const config = require('../conf/config.json');


router.post("/generate/pdf", async (req, res, __) => {
  try {
    if (!req.files || !req.files.template || !req.files.template.tempFilePath) {
      res.status(400).end();
      return;
    }
    console.log(new Date(), "[generatePdf] using token: ", req.body.token, " Auth: ", config.auth, "OneSessionId", req.cookies.oneSessionId)
    let result = await generatePdf(req.files.template.tempFilePath, req.body.token, config.auth, req.cookies.oneSessionId);
    console.log(new Date(), "[generatePdf] pdf generated successfully token: ", req.body.token, " Auth: ", config.auth, "OneSessionId", req.cookies.oneSessionId)
    let name = req.body.name;
    if (!name) {
      name = "export";
    }
    res.attachment(name + ".pdf");
    res.contentType("application/pdf");
    res.send(result);
  } catch (e) {
    console.warn("Generate pdf failed: ",e);
    res.status(500).send({ error: `${e}` }).end();
  }
});

router.post("/print/pdf", async (req, res, __) => {
  try {
    if (!req.body.url) {
      res.status(400).end();
      return;
    }
    console.log(new Date(), "[printPdf] using token: ", req.body.token, " Auth: ", config.auth, "OneSessionId", req.cookies.oneSessionId, "from url: ",req.body.url)
    let result = await printPdf(req.body.url, req.body.token, config.auth, req.cookies.oneSessionId);
    console.log(new Date(), "[printPdf] pdf printed successfully token: ", req.body.token, " Auth: ", config.auth, "OneSessionId", req.cookies.oneSessionId, "from url: ",req.body.url)
    let name = req.body.name;
    if (!name) {
      name = "export";
    }
    res.attachment(name + ".pdf");
    res.contentType("application/pdf");
    res.send(result);
  } catch (e) {
    console.warn("Print pdf failed: ",e);
    res.status(500).send({ error: `${e}` }).end();
  }
});

router.post("/convert/pdf", async (req, res, __) => {
  if (!req.files || !req.files.template || !req.files.template.tempFilePath) {
    res.status(400).send({ error: "Missing file" }).end();
    return;
  }
  try {
    const kind = req.param("kind");
    if(!kind){
      res.status(400).send({ error: "Missing kind" }).end();
      return;
    }
    const allSheets = req.param("allSheets", "false") == "true";
    result = await convertToPdf(req.files.template.tempFilePath, kind, {allSheets});
    if(kind=="csv"){
      res.attachment(`${req.param("name", kind)}.csv`);
      res.contentType("text/csv");
    }else{
      res.attachment(`${req.param("name", kind)}.pdf`);
      res.contentType("application/pdf");
    }
    res.send(result);
  } catch (e) {
    console.warn("Convert pdf failed: ", e);
    res.status(500).send({ error: `${e}` }).end();
  }
});

module.exports = router;
