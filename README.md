[![npm version](https://img.shields.io/npm/v/fa-diagrams.svg)](https://www.npmjs.com/package/fa-diagrams)
[![Build Status](https://img.shields.io/travis/Klemek/fa-diagrams.svg?branch=master)](https://travis-ci.org/Klemek/fa-diagrams)
[![Coverage Status](https://img.shields.io/coveralls/github/Klemek/fa-diagrams.svg?branch=master)](https://coveralls.io/github/Klemek/fa-diagrams?branch=master)

# (WIP) fa-diagrams
## SVG diagrams built from Font-Awesome icons

## RoadMap to v1

* [x] Font-Awesome paths scrapping in build
* [x] Node placing with links
* [x] SVG output
* [x] Node's icon rendering
* [x] Simple links rendering
* [ ] Dashed links rendering
* [ ] Colors
* [ ] Sub-elements
* [ ] More options
* [ ] PNG output
* [ ] Unit testing

## Summary

* [Install](#install)
  * [CDN](#cdn)
  * [Static scripts](#static-scripts)
  * [NPM](#npm)
  * [Build from sources](#build-from-sources)
* [Usage](#usage)
  * [Node module](#node-module)
  * [Html script](#html-script)
* [API](#api)
  * [`options`](#options)
  * [`nodes`](#nodes)
  * [`links`](#links)
  * [Sub-elements](#sub-elements)
* [More info](#more-info)
  * [Icon names](#icon-names)
  * [Link types](#link-types)
* [Examples](#examples)
  
## Install  
*[back to top](#top)*

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
*[back to top](#top)*

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
            from: 'node1',
            to: 'node2',
            bottom: {text: 'Hello World!'}
        }
    ]
};

const svg = faDiagrams.compute(data); // string containing xml data
```

Will produce the following diagram:

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

## API
*[back to top](#top)*

**You must pass as argument an object containing 3 keys:**
  * [`options`](#options)
  * [`nodes`](#nodes)
  * [`links`](#links)

### `options`

| Key (`/subkey`) | Default value | Info |
| --- | --- |  --- |
| `placing/max-link-length` | 3 | maximum stretching of links between nodes |
| `placing/diagonals` | `true` | allow diagonal links to be made |
| `rendering/beautify` | `false` | output a readable SVG file |
| `rendering/scale` | 128 | (in pixels) final icons size |
| `rendering/color` | `black` | color of all elements |
| `rendering/h-spacing` | 1.3 | how width is stretched comparing to height |
| `rendering/icons/scale` | 1 | default scaling of icons (might be redefined in node definition) |
| `rendering/links/scale` | 1 | default scaling of links (might be redefined in link definition) |
| `rendering/links/size` | 0 | forced size/length of the links (0 means it will be computed from the distance between the nodes) (might be redefined in link definition) |
| `rendering/texts/font` | `'Arial'` | font family of the texts (might be redefined in sub-elements definition) |
| `rendering/texts/font-size` | 20 | font size of the texts (might be redefined in sub-elements definition) |
| `rendering/texts/font-style` | `'normal'` | font style of the texts (see [Font styles](#font-styles)) (might be redefined in sub-elements definition) |

### `nodes`

Array of object as following:

| Key | Type | Required | Info |
| --- | --- | --- |  --- |
| **`name`** | string | **yes** | used in links to reference nodes |
| **`icon`** | string | **yes** | name of the Font-Awesome icon of the node (see [Icon names](#icon-names)) |
| `top`, `bottom`, `left`, `right` | string or object | no | see [Sub-elements](#sub-elements) |
| `color` | string | no | redefined the color |
| `scale` | number | no | redefine this node icon scale |
| `x`, `y` | number | no | force the position of this node |

### `links`

Array of object as following:

| Key | Type | Required | Info |
| --- | --- | --- |  --- |
| **`from`** | string | **yes** | source node name  |
| **`to`** | string | **yes** | destination node name |
| `type` | string | no | link's appearance (see [Link types](#link-types)) |
| `top`, `bottom` | string or object | no | see [Sub-elements](#sub-elements) |
| `color` | string | no | redefined the color |
| `scale` | number | no | redefine this link scale |
| `size` | number | no | forced size/length of the link |

### Sub-elements

Elements meant to be drawn along-side a node/link.  
There are two types: text and icons

### Texts

You can **just enter a string** to be considered a text but you can define a text with more options as following:

| Key | Type | Required | Info |
| --- | --- | --- |  --- |
| **`text`** | string | **yes** | value of your text  |
| `color` | string | no | redefined the color |
| `font` | string | no | redefine the font family |
| `font-size` | number | no | redefine the font size |
| `font-style` | string | no | redefine the font style (see [Font styles](#font-styles)) |

### Icons

You can define a relative icon with the following:

| Key (`/subkey`) | Type | Required | Info |
| --- | --- | --- |  --- |
| **`icon`** | string | **yes** | name of the Font-Awesome icon of the sub-element (see [Icon names](#icon-names)) |
| `color` | string | no | redefined the color |

## More info
*[back to top](#top)*

### Icon names

(soon)

### Link types

(soon)

### Font styles

(soon)

## Examples
*[back to top](#top)*
(soon)