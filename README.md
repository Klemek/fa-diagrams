[![Build Status](https://img.shields.io/travis/Klemek/fa-diagrams.svg?branch=master)](https://travis-ci.org/Klemek/fa-diagrams)
[![Coverage Status](https://img.shields.io/coveralls/github/Klemek/fa-diagrams.svg?branch=master)](https://coveralls.io/github/Klemek/fa-diagrams?branch=master)

# fa-diagrams
## (WIP) SVG diagrams built from Font-Awesome icons

How to use (theorically)
```javascript
const diag = require('fa-diagrams');

const data = {
    options: {
        font: 'times'
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


