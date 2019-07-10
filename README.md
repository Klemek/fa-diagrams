[![Build Status](https://img.shields.io/travis/Klemek/fa-diagrams.svg?branch=master)](https://travis-ci.org/Klemek/fa-diagrams)
[![Coverage Status](https://img.shields.io/coveralls/github/Klemek/fa-diagrams.svg?branch=master)](https://coveralls.io/github/Klemek/fa-diagrams?branch=master)

# fa-diagrams
## (WIP) SVG diagrams built from Font-Awesome icons

## Build from sources

You will need subversion installed (used for precise folder fetching in GitHub)

```
git clone https://github.com/klemek/fa-diagrams.git
cd fa-diagrams
npm install
node build.sh
```

## Usage

### With node

```javascript
const diag = require('fa-diagrams');

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

const svg = diag.compute(data); // string containing xml data
```

Will produce the following diagram :

![sample](sample.png)

### On web page

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


