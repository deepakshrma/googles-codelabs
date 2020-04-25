const { workerData, parentPort } = require("worker_threads");
const marked = require("marked");
const Slugger = require("marked/src/Slugger");
const { isPageBreak, buildSlug, parsePage, parseHeader } = require("./util");

const slugger = new Slugger();
async function parseFile(file) {
  const lexer = new marked.Lexer();
  let tokens = lexer.lex(file.raw);
  const codelabInfo = buildSlug(tokens.shift().raw);
  const id = slugger.slug(file.name);
  codelabInfo.url = id;
  codelabInfo.id = id;
  let lineNum = 0,
    pageCount = 0;
  let bucket = [];
  let pages = [];
  while (lineNum < tokens.length) {
    let token = tokens[lineNum];
    if (isPageBreak(token)) {
      //page found
      pageCount += 1;
      if (pageCount === 1 && lineNum !== 0) {
        parseHeader(bucket, codelabInfo);
      } else {
        pages.push({
          ...parsePage(bucket),
          num: pageCount,
        });
      }
      bucket = [];
    } else {
      bucket.push(token);
    }
    lineNum += 1;
  }
  // Last page
  if (bucket.length) {
    pages.push({
      ...parsePage(bucket),
      num: pageCount,
    });
  }
  parentPort.postMessage({ codelabInfo, pages });
}
parseFile(workerData);
