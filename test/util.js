const marked = require("marked");
const {
  buildSlug,
  delay,
  fromRoot,
  isPageBreak,
  parseHeader,
  parsePage,
  pageTemplate,
} = require("../src/util");

const test = require("ava");

// test("foo", (t) => {
//   t.pass();
// });

test("delay: should able to delay for 200ms", async (t) => {
  const time = new Date().getTime();
  const d = delay(200);
  t.is(typeof d, "object");
  t.is(d instanceof Promise, true);
  await d;
  t.is(new Date().getTime() - time >= 200, true);
});

test("delay: should have default 300ms delay", async (t) => {
  const time = new Date().getTime();
  const d = delay();
  t.is(typeof d, "object");
  t.is(d instanceof Promise, true);
  await d;
  t.is(new Date().getTime() - time >= 300, true);
});

test("delay: should have correct delay of 100ms", async (t) => {
  const time = new Date().getTime();
  const d = delay();
  t.is(typeof d, "object");
  t.is(d instanceof Promise, true);
  await Promise.race([d, delay(100)]);
  t.is(new Date().getTime() - time < 300, true);
});

test("fromRoot: should take path from root", (t) => {
  t.is(fromRoot("docs").includes("test"), false);
});

test("isPageBreak: should return page break", (t) => {
  t.is(isPageBreak({ type: "html", raw: "<!-- ---- -->" }), true);
  t.is(isPageBreak({ type: "html", raw: "<!-- xxxx -->" }), true);
  t.is(isPageBreak({ type: "html", raw: "<!--xxx\n-->" }), true);
});

test("isPageBreak: should not return page break", (t) => {
  t.is(isPageBreak({ type: "html", raw: "<!- -->" }), false);
  t.is(isPageBreak({ type: "html", raw: "<!--xxx- ->" }), false);
  t.is(isPageBreak({ type: "html", raw: "<!- XXXX-\n->" }), false);
});

test("buildSlug: should return codelabinfo with summary, category, tags", (t) => {
  const info = buildSlug(`
  summary: How to use nodejs CodeLabs
  id: how-to-use-nodejs-codelab
  category: nodejs
  status: Published
  authors: Deepak
  Feedback Link: https://github.com/deepakshrma/googles-codelabs
  `);
  t.is(info.summary, "How to use nodejs CodeLabs");
  t.is(info.id, "how-to-use-nodejs-codelab");
  t.is(info.prefix, "/");
  t.deepEqual(info.category, ["nodejs"]);
  t.deepEqual(info.tags, []);
  t.deepEqual(info.status, ["Published"]);
  t.deepEqual(info.authors, ["Deepak"]);
  t.is(
    info["feedback-link"],
    "https://github.com/deepakshrma/googles-codelabs"
  );
});
test("parseHeader: should return updated title", (t) => {
  t.deepEqual(parseHeader([{ type: "heading", text: "Heading" }]), {
    title: "Heading",
  });
  t.deepEqual(
    parseHeader([{ type: "heading", text: "Heading" }], {
      status: ["published"],
    }),
    { title: "Heading", status: ["published"] }
  );
});

test("parseHeader: should not updated title", (t) => {
  t.notDeepEqual(parseHeader([{ type: "p", text: "Heading" }]), {
    title: "Heading",
  });
  t.deepEqual(
    parseHeader([{ type: "html", text: "Heading" }], {
      status: ["published"],
    }),
    { status: ["published"] }
  );
  t.deepEqual(parseHeader(undefined, { title: "Heading" }), {
    title: "Heading",
  });
});

test("Promise.prototype.map: should able to map on promise", async (t) => {
  const arr = await Promise.resolve([1, 2, 3]).map((x) => x * x);
  t.deepEqual(arr, [1, 4, 9]);
  const arr2 = await Promise.resolve().map((x) => x * x);
  t.deepEqual(arr2, []);
});

test("parsePage: should return updated page", (t) => {
  const lx = new marked.Lexer();
  let data = parsePage(
    lx.lex(`## Overview

  Duration: 2
  
  ### What is nodejs [CodeLabs](https://github.com/deepakshrma/googles-codelabs)`)
  );
  data.html = data.html.slice(0, -1); // to remove ␊
  t.deepEqual(data, {
    duration: 2,
    label: "Overview",
    html: `<h3 id="what-is-nodejs-codelabs">What is nodejs <a href="https://github.com/deepakshrma/googles-codelabs">CodeLabs</a></h3>`,
  });
});

test("parsePage: should blank label but parsed html", (t) => {
  const lx = new marked.Lexer();
  let data = parsePage(lx.lex(`## Overview`));
  data.html = data.html.slice(0, -1); // to remove ␊
  t.deepEqual(data, {
    duration: 0,
    label: "",
    html: `<h2 id="overview">Overview</h2>`,
  });
});

test("parsePage: should blank on buck not provided", (t) => {
  let data = parsePage();
  data.html = data.html.slice(0, -1); // to remove ␊
  t.deepEqual(data, {
    duration: 0,
    label: "",
    html: "",
  });
});

test("pageTemplate: should return proper page", (t) => {
  let page = pageTemplate({ title: "TEST", id: "1234" }, [
    { label: "Page1", duration: 1, html: `<h1>test</h1>` },
  ]);
  t.is(page.includes(`<title>TEST</title>`), true);
  t.is(page.includes(`<google-codelab-step label="Page1" duration="1">`), true);
  t.is(page.includes(`<h1>test</h1>`), true);
  t.is(page.includes(`google-codelab id="1234`), true);

  page = pageTemplate({ title: "TEST2", id: "1234" }, [
    { label: "Page1", duration: 1, html: `<h1>test</h1>` },
    { label: "Page2", duration: 2, html: `<h1>test2</h1>` },
  ]);
  t.is(page.includes(`<title>TEST2</title>`), true);
  t.is(page.includes(`<google-codelab-step label="Page2" duration="2">`), true);
});
