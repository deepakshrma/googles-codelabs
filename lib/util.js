const marked = require("marked");
const path = require("path");
const { promisify } = require("util");

const { readdir, readFile, writeFile } = require("fs");

function isPageBreak(token) {
  return (
    token.type == "html" &&
    token.raw.indexOf("<!--") === 0 &&
    token.raw.includes("-->")
  );
}
exports.isPageBreak = isPageBreak;
const buildSlug = (slugTxt) => {
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
exports.buildSlug = buildSlug;

const cwd = process.cwd();
const fromRoot = (...p) => path.join(cwd, ...p);

exports.fromRoot = fromRoot;

exports.rd = promisify(readdir);
exports.rf = promisify(readFile);
exports.wf = promisify(writeFile);

// OVERRIDE GLOBAL PROMISE
Promise.prototype.map = function (cb) {
  return this.then((x = []) => x.map(cb));
};

const pageTemplate = (codelabInfo, pages) => {
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
exports.pageTemplate = pageTemplate;

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
exports.parsePage = parsePage;

const parseHeader = (buck = [], codelabInfo = {}) => {
  buck.forEach(({ type, text }) => {
    if (type === "heading") {
      codelabInfo.title = text;
    }
  });
};
exports.parseHeader = parseHeader;
const delay = (ms = 300) =>
  new Promise((r) => {
    setInterval(r, ms);
  });
exports.delay = delay;
