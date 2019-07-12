//const xml = require('xml-js');
const placing = require('./placing');
let list = {};
try {
  list = require('../svg_list.json');
} catch (err) {
  console.error('fa-diagrams: SVG list could not be loaded', err);
}

/**
 * Merge resources by reading object keys and keeping reference value only if it's type is different from the source
 * @param ref - reference object/value
 * @param src - source object/value
 * @returns {*}
 */
const merge = (ref, src) => {
  if (typeof ref !== typeof src) {
    return ref;
  } else if (ref.length && !src.length) {
    return ref;
  } else if (ref.length && src.length) {
    return src;
  } else if (typeof ref === 'object') {
    const out = {};
    Object.keys(ref).forEach((key) => out[key] = merge(ref[key], src[key]));
    return out;
  } else {
    return src;
  }
};

const DEFAULT_OPTIONS = {
  'expand': 'h',
  'max-link-length': 2,
  'diagonals': true,
};


const self = {
  options: DEFAULT_OPTIONS,
  compute: (data) => {
    const options = merge(DEFAULT_OPTIONS, data['options']);

    let nodes = {};
    const nodeList = (data['nodes'] || []).filter(n => typeof n.name === 'string');
    nodeList.forEach(n => nodes[n.name] = n);

    let links = (data['links'] || []).filter(l => l.from && l.to);
    links.filter(l => !nodes[l.from]).forEach(l => console.warn(`unknown source node "${l.from}"`));
    links.filter(l => !nodes[l.to]).forEach(l => console.warn(`unknown destination node "${l.to}"`));
    links = links.filter(l => nodes[l.from] && nodes[l.to]);

    nodes = placing(options).compute(nodes, links);

    if (!nodes)
      throw 'Failed to place nodes';

    //console.log(JSON.stringify(nodes, null, 2));
    console.log(Object.values(nodes).map(n => `${n.name} : [${n.x}, ${n.y}]`).join('\n'));
  },

};

module.exports = self; // Node
global['faDiagrams'] = self; // Browserify