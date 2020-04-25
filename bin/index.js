#!/usr/bin/env node
const path = require("path");
const { existsSync, mkdirSync } = require("fs");
const { fromRoot, rd, rf, wf, pageTemplate, delay } = require("../lib/util");
const { run } = require("../lib");
const createLogger = require("progress-estimator");
const logger = createLogger();

async function main() {
  let docs = "docs"; // directory to documents
  let output = "public"; // target directory
  let argv = require("minimist")(process.argv.slice(2));
  if (argv.help) {
    await logger(
      delay(100),
      `Help:\n\n\tnode-claat --docs docs[default] --output public[default]\n\n🙏Thanks for using!🙏`
    );
    process.exit(0);
  }
  if (argv.docs) docs = argv.docs;
  if (argv.output) output = argv.output;
  const docPath = fromRoot(docs);
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
  const sulgs = run(textFiles);
  if (!existsSync(fromRoot(output))) {
    mkdirSync(fromRoot(output));
  }
  for (let index = 0; index < sulgs.length; index++) {
    const { codelabInfo, pages } = sulgs[index];
    const outDir = fromRoot(output, codelabInfo.url);
    if (!existsSync(outDir)) {
      mkdirSync(outDir);
    }
    const html = pageTemplate(codelabInfo, pages);
    await wf(
      path.join(outDir, "codelab.json"),
      JSON.stringify(codelabInfo, null, 2)
    );
    await wf(path.join(outDir, "index.html"), html);
  }
  process.exit(0);
}
main();
