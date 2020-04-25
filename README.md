summary: How to use nodejs CodeLabs
id: how-to-use-nodejs-codelab
category: nodejs
tags: medium
status: Published
authors: Deepak
Feedback Link: https://github.com/deepakshrma/googles-codelabs

## How to use nodejs CodeLabs

<!-- ------------------------ -->

## Overview

Duration: 1

### What is nodejs CodeLabs

Go Lang claat tool replica written in node js, using [marked parser](https://marked.js.org/#/USING_PRO.md#lexer)

<!-- ------------------------ -->

## How to install

Duration: 1

You can either install as CLI or nodejs module

> Install as CLI

```bash
npm install -g @deepakvishwakarma/node-claat

##OR

npm install -g git+ssh://git@github.com/deepakshrma/googles-codelabs.git
```

<!-- ------------------------ -->

## How to create codelab docs

Duration: 2

> Create a folder[docs]

```bash
md codelabs
cd codelabs
md docs
cd docs
```

> Create a md file

````bash
echo 'summary: This is going to be Awesome
id: this-going-to-be-awesome
category: doc
tags: medium
status: Published
authors: Deepak
Feedback Link: https://github.com/deepakshrma/googles-codelabs

## This is going to be Awesome

<!-- ------------------------ -->

## Overview

Duration: 1

### What is nodejs CodeLabs
```js
function isPageBreak(token) {
  return (
    token.type == "html" &&
    token.raw.indexOf("<!--") === 0 &&
    token.raw.includes("-->")
  );
}
```' > this-is-going-to-be-awesome.md
````

> Run commandline

```bash
cd .. # move to home folder codelabs
ls # you will see docs folder here
node-claat --docs docs
```

<!-- ------------------------ -->

## Thanks For using

Duration: 1

> Now you can run and see output using any static server

```bash
http-server
```

> open browser:

```
open http://localhost:8080/this-is-going-to-be-awesome/#0
```

Thanks you for using! Work is still in progress. Keep supporting
