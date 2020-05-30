const { Worker } = require("worker_threads");

const isSilent = process.argv.indexOf("-k") !== -1;

async function run(textFiles = []) {
  if (!textFiles.length) {
    !isSilent && console.log(`❌ NO FILES FOUND`);
    return [];
  }
  const promises = textFiles.map((file) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__dirname + "/parse_file.js", {
        workerData: file,
      });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  });
  return Promise.all(promises);
}

exports.run = run;
