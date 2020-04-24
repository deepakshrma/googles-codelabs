const marked = require("marked");
const Slugger = require("marked/src/Slugger");

const path = require("path");
const { readdir, readFile, writeFile, existsSync, mkdirSync } = require("fs");
const { promisify } = require("util");
const readdirP = promisify(readdir);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const cwd = process.cwd();
const slugger = new Slugger();
const fromRoot = (...p) => path.join(cwd, ...p);
Promise.prototype.map = function (cb) {
  return this.then((x = []) => x.map(cb));
};
const slugParser = (slugTxt) => {
  let meta = {
    environment: "web",
    format: "html",
    prefix: "/",
    updated: new Date().toISOString(),
    duration: 0,
    title: "",
    authors: "",
    summary: "",
    source: "",
    theme: "",
    status: [],
    category: [],
    tags: [],
    feedback: "",
  };

  return slugTxt.split("\n").reduce((m, line) => {
    let [key, value] = line.split(": ", 2);
    key = key.toLowerCase().replace(/\s+/, "-");
    value = value.trim();
    if (["status", "category", "tags", "authors"].indexOf(key) !== -1) {
      m[key] = value.split(",");
    } else {
      m[key] = value;
    }
    return m;
  }, meta);
};
const template = (codelabInfo, pages) => {
  const meta = Object.entries(codelabInfo)
    .map(([key, value]) => key + '="' + value + '"')
    .join("\n\t\t\t");
  const html = pages
    .map(
      ({ label, duration, html }) =>
        `\t\t<google-codelab-step label="${label}" duration="${duration}">\t\t${html}\t\t</google-codelab-step>`
    )
    .join("\n");
  const t = `
    <!doctype html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=yes">
      <meta name="theme-color" content="#4F7DC9">
      <meta charset="UTF-8">
      <title>${codelabInfo.title}</title>
      <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Source+Code+Pro:400|Roboto:400,300,400italic,500,700|Roboto+Mono">
      <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
      <link rel="stylesheet" href="https://storage.googleapis.com/codelab-elements/codelab-elements.css">
      <style>
        .success {
          color: #1e8e3e;
        }
        .error {
          color: red;
        }
      </style>
    </head>
    <body>
      <google-codelab-analytics gaid="UA-49880327-14"></google-codelab-analytics>
      <google-codelab ${meta} >
          ${html}
      </google-codelab>
    
      <script src="https://storage.googleapis.com/codelab-elements/native-shim.js"></script>
      <script src="https://storage.googleapis.com/codelab-elements/custom-elements.min.js"></script>
      <script src="https://storage.googleapis.com/codelab-elements/prettify.js"></script>
      <script src="https://storage.googleapis.com/codelab-elements/codelab-elements.js"></script>
      <script src="//support.google.com/inapp/api.js"></script>
    
    </body>
    </html>
    `;
  return t;
};
async function main() {
  const docPath = fromRoot("docs");
  const files = await readdirP(docPath).map((name) => {
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
      readFileP(file.fullPath, { encoding: "utf-8" }).then((data) => {
        file.raw = data;
        return file;
      })
    )
  );
  const isPageBreak = (token) =>
    token.type == "html" &&
    token.raw.indexOf("<!--") === 0 &&
    token.raw.includes("-->");
  textFiles.forEach((file) => {
    const lexer = new marked.Lexer();
    let tokens = lexer.lex(file.raw);
    const codelabInfo = slugParser(tokens.shift().raw);
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
    const parsePage = (buck = []) => {
      let label = "";
      let duration = 0;
      if (buck.length > 1) {
        label = buck.shift().text;
        if (buck[0].raw.toLowerCase().includes("duration:")) {
          const token = buck.shift();
          duration = Number(token.raw.split(": ")[1].trim());
        }
      }
      return {
        label,
        duration,
        html: marked.parser(buck),
      };
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
    const outDir = fromRoot("public", codelabInfo.url)
    if(!existsSync(outDir)) {
        mkdirSync(outDir)
    }
    const html = template(codelabInfo, pages)
    writeFileP(path.join(outDir, "codelab.json"), JSON.stringify(codelabInfo, null, 2))
    writeFileP(path.join(outDir, "index.html"), html)
  });
}

main();
