const marked = require("marked");
const Slugger = require("marked/src/Slugger");

const path = require("path");
const { existsSync, mkdirSync } = require("fs");

const {
  isPageBreak,
  buildSlug,
  fromRoot,
  rd,
  rf,
  wf,
  pageTemplate,
  parsePage,
} = require("./util");

const slugger = new Slugger();

async function run() {
  const docPath = fromRoot("docs");
  const files = await rd(docPath).map((name) => {
    const ext = path.extname(name).slice(1);
    return {
      parent: docPath,
      fullPath: path.join(docPath, name),
      name: path.basename(name, ext),
      ext,
    };
  });
  const textFiles = await Promise.all(
    files.map((file) =>
      rf(file.fullPath, { encoding: "utf-8" }).then((data) => {
        file.raw = data;
        return file;
      })
    )
  );
  textFiles.forEach((file) => {
    const lexer = new marked.Lexer();
    let tokens = lexer.lex(file.raw);
    const codelabInfo = buildSlug(tokens.shift().raw);
    const id = slugger.slug(file.name);
    codelabInfo.url = id;
    codelabInfo.id = id;
    let lineNum = 0,
      pageCount = 0;
    let bucket = [];
    const parseHeader = (buck = []) => {
      buck.forEach(({ type, text }) => {
        if (type === "heading") {
          codelabInfo.title = text;
        }
      });
    };

    let pages = [];
    while (lineNum < tokens.length) {
      let token = tokens[lineNum];
      if (isPageBreak(token)) {
        //page found
        pageCount += 1;
        if (pageCount === 1 && lineNum !== 0) {
          parseHeader(bucket);
        } else {
          const page = parsePage(bucket);
          pages.push({
            ...page,
            num: pageCount,
          });
        }
        bucket = [];
      } else {
        bucket.push(token);
      }
      lineNum += 1;
    }
    if (bucket.length) {
      const page = parsePage(bucket);
      pages.push({
        ...page,
        num: pageCount,
      });
    }
    const outDir = fromRoot("public", codelabInfo.url);
    if (!existsSync(fromRoot("public"))) {
      mkdirSync(fromRoot("public"));
    }
    if (!existsSync(outDir)) {
      mkdirSync(outDir);
    }
    const html = pageTemplate(codelabInfo, pages);
    wf(path.join(outDir, "codelab.json"), JSON.stringify(codelabInfo, null, 2));
    wf(path.join(outDir, "index.html"), html);
  });
}

exports.run = run;
run();
