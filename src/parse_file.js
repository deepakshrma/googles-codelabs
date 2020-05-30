const { workerData, parentPort } = require("worker_threads");
const marked = require("marked");
const {
  isPageBreak,
  buildSlug,
  parsePage,
  parseHeader,
  slug,
} = require("./util");

async function parseFile(file) {
  const lexer = new marked.Lexer();
  let tokens = lexer.lex(file.raw);
  const codelabInfo = buildSlug(tokens.shift().raw);
  const id = slug(file.name);
  codelabInfo.url = id;
  codelabInfo.id = id;
  let lineNum = 0,
    num = 0,
    bucket = [],
    pages = [];
  while (lineNum < tokens.length) {
    let token = tokens[lineNum];
    if (isPageBreak(token)) {
      //page found
      num += 1;
      if (num === 1 && lineNum !== 0) {
        parseHeader(bucket, codelabInfo);
      } else {
        pages.push({
          ...parsePage(bucket),
          num,
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
      num,
    });
  }
  parentPort.postMessage({ codelabInfo, pages });
}
parseFile(workerData);
