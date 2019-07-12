const placing = require('./placing');
const rendering = require('./rendering');

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
  'placing': placing().defaultOptions,
  'rendering': rendering().defaultOptions
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

    nodes = placing(options['placing']).compute(nodes, links);

    if (!nodes)
      throw 'Failed to place nodes';

    return rendering(options['rendering']).compute(nodes, links);
  },

};

module.exports = self; // Node
global['faDiagrams'] = self; // Browserify