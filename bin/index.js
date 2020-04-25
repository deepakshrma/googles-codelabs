#!/usr/bin/env node
const path = require("path");
const { existsSync, mkdirSync } = require("fs");
const { fromRoot, rd, rf, wf, pageTemplate, delay } = require("../src/util");
const { run } = require("../src");
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
  if (!existsSync(docPath)) {
    console.log(`❌ Folder: '${docs}' does not exists`);
    process.exit(0);
  }
  let files = await rd(docPath).map((name) => {
    const ext = path.extname(name).slice(1);
    return {
      parent: docPath,
      fullPath: path.join(docPath, name),
      name: path.basename(name, ext),
      ext,
    };
  });
  files = files.filter((file) => file.ext === "md");
  const textFiles = await Promise.all(
    files.map((file) =>
      rf(file.fullPath, { encoding: "utf-8" }).then((data) => {
        file.raw = data;
        return file;
      })
    )
  );
  let slugsPromises = run(textFiles);
  await logger(slugsPromises, `Working on ${textFiles.length} files;`, {
    estimate: 10000,
  });
  const slugs = await slugsPromises;
  if (slugs.length) {
    if (!existsSync(fromRoot(output))) {
      mkdirSync(fromRoot(output));
    }
    for (let index = 0; index < slugs.length; index++) {
      const { codelabInfo, pages } = slugs[index];
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
  }
  process.exit(0);
}
main();
