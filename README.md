[![npm version](https://img.shields.io/npm/v/fa-diagrams.svg)](https://www.npmjs.com/package/fa-diagrams)
[![Build Status](https://img.shields.io/travis/Klemek/fa-diagrams.svg?branch=master)](https://travis-ci.org/Klemek/fa-diagrams)
[![Coverage Status](https://img.shields.io/coveralls/github/Klemek/fa-diagrams.svg?branch=master)](https://coveralls.io/github/Klemek/fa-diagrams?branch=master)

# (WIP) fa-diagrams
## SVG diagrams built from Font-Awesome icons

* [Install](#install)
  * [CDN](#cdn)
  * [Static scripts](#static-scripts)
  * [NPM](#npm)
  * [Build from sources](#build-from-sources)
* [Usage](#usage)
  * [Node module](#node-module)
  * [Html script](#html-script)

## Install

### Static scripts

Get the scripts from this repository `dist` folder

```html
<script src="fa-diagrams-data.min.js"></script>
<script src="fa-diagrams.min.js"></script>
```

### CDN (soon)

```html
<script src="https://cdn.jsdelivr.net/npm/fa-diagrams@latest/dist/fa-diagrams-data.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/fa-diagrams@latest/dist/fa-diagrams.min.js"></script>
```

or

```html
<script src="https://unpkg.com/fa-diagrams/dist/fa-diagrams-data.min.js"></script>
<script src="https://unpkg.com/fa-diagrams/dist/fa-diagrams.min.js"></script>
```


### NPM (soon)

```
npm install fa-diagrams
```

### Build from sources

You will need subversion installed (used for precise folder fetching in GitHub)

```
git clone https://github.com/klemek/fa-diagrams.git
cd fa-diagrams
npm install
node build.sh
```

## Usage

### Node module

```javascript
const faDiagrams = require('fa-diagrams');

const data = {
    options: {
        font: 'Courier New'
    },
    nodes: [
        {
            name: 'node1',
            icon: 'server',
            bottom: {text: 'myserver' },
            top: {icon: 'node'}
        },
        {
            name: 'node2',
            icon: 'globe',
            bottom: {text: 'world'}
        }
    ],
    links: [
        {
            type: 'arrow',
            from: 'node1',
            to: 'node2',
            bottom: {text: 'Hello World!'}
        }
    ]
};

const svg = faDiagrams.compute(data); // string containing xml data
```

Will produce the following diagram :

![sample](sample.png)

### Html script

```html
<head>
    ...
    <script src="fa-diagrams-data.min.js"></script>
    <script src="fa-diagrams.min.js"></script>
    ...
</head>
<body>
...
<script>
    ...
    const svg = faDiagrams.compute(data); // string containing xml data
    ...
</script>
...
</body>
</html>
```


