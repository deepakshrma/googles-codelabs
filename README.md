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

Duration: 2

### What is nodejs [CodeLabs](https://github.com/deepakshrma/googles-codelabs)

Go Lang claat tool replica written in node js, using [marked parser](https://marked.js.org/#/USING_PRO.md#lexer)

<!-- ------------------------ -->

## How to install

Duration: 2

You can either install as CLI or nodejs module

_Install as CLI_

```bash
npm install -g @deepakvishwakarma/node-claat

##OR

npm install -g git+ssh://git@github.com/deepakshrma/googles-codelabs.git
```

<!-- ------------------------ -->

## How to create codelab docs

Duration: 5

_Create a folder[docs]_

```bash
md codelabs
cd codelabs
md docs
cd docs
```

_Create a md file_

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

_Run commandline_

```bash
cd .. # move to home folder codelabs
ls # you will see docs folder here
node-claat --docs docs
```

<!-- ------------------------ -->

## How to contribute

Duration: 10

_Prerequisite:_

- NodeJS 12.16.2 LTS or above
- Basic knowledge of nodejs
- ES2015 and above

```bash
git clone https://github.com/deepakshrma/googles-codelabs.git
npm install

npm run example
npm run serve
```

_Write Test case and run:_

Write test cases in test folder

```bash
npm run test:watch

## OR coverage

npm run test
```

<!-- ------------------------ -->

## Thanks For using

Duration: 1

_Now you can run and see output using any static server_

```bash
http-server
```

_open browser:_

```
open http://localhost:8080/this-is-going-to-be-awesome/#0
```

Thanks you for using! Work is still in progress. Keep supporting!

_For more visit:_
[CodeLabs](https://github.com/deepakshrma/googles-codelabs)
