const xml = require('xml-js');
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

const DEFAULT_OPTIONS = {};

const self = {
  compute: (data) => {
    const options = merge(DEFAULT_OPTIONS, data['options']);

    /**
     * @type {Object<string,{name: string, icon: string}>}
     */
    const nodes = {};
    const nodeList = (data['nodes'] || []).filter(n => n.name);
    nodeList.forEach((n, i) => n.order = i);
    nodeList.forEach(n => nodes[n.name] = n);

    /**
     * @type {[{from: string, to: string, direction: string?}]}
     */
    let links = (data['links'] || []).filter(l => l.from && l.to);
    links.filter(l => !nodes[l.from]).forEach(l => console.warn(`unknown source node "${l.from}"`));
    links.filter(l => !nodes[l.to]).forEach(l => console.warn(`unknown destination node "${l.to}"`));
    links = links.filter(l => nodes[l.from] && nodes[l.to]);

    Object.values(nodes).forEach(node => {
      node.beforeX = undefined;
      node.beforeY = undefined;
    });

    links.forEach(link => {
      if (link.direction) {
        switch (link.direction) {
          case 'up':
          case 'top':
            nodes[link.from].beforeY = link.to;
            break;
          case 'down':
          case 'bottom':
            nodes[link.to].beforeY = link.from;
            break;
          case 'left':
            nodes[link.from].beforeX = link.to;
            break;
          case 'right':
            nodes[link.to].beforeX = link.from;
            break;
        }
      }
    });

    const grid = [[false]];

    const expand = (y) => {
      if (y)
        grid.push(new Array(grid[0].length).fill(false));
      else
        grid.forEach(row => row.push(false));
    };

    const findPlace = (cx, cy, minx, miny) => {
      const width = grid[0].length;
      const height = grid.length;
      for (let x = (cx || 0); x <= (cx || (width - 1)); x++) {
        for (let y = (cy || 0); y <= (cy || (height - 1)); y++) {
          if (!grid[y][x] && x >= (minx || -1) && y >= (miny || -1)) {
            grid[y][x] = true;
            return {x: x, y: y};
          }
        }
      }
      expand(height < width);
      return findPlace(cx, cy, minx, miny);
    };


    const updateLinked = node1 => node2 => {
      let p;
      if (node2.beforeX === node1.name) {
        if (!node2.beforeY) {
          p = findPlace(null, node1.y, node1.x + 1, null);
        } else if (nodes[node2.beforeY].x) {
          p = findPlace(nodes[node2.beforeY].x, node1.y, null, null);
        }
      }
      if (node2.beforeY === node1.name) {
        if (!node2.beforeX) {
          p = findPlace(node1.x, null, null, node1.y + 1);
        } else if (nodes[node2.beforeX].y) {
          p = findPlace(node1.x, nodes[node2.beforeX].y, null, null);
        }
      }
      if (p) {
        node2.x = p.x;
        node2.y = p.y;

        Object.values(nodes).forEach(updateLinked(node2));
      }
    };

    let first;

    while ((first = Object.values(nodes).filter(n => n.x === undefined && !n.beforeX && !n.beforeY).sort((n1, n2) => n1.order - n2.order)).length) {
      const node = first[0];
      const p = findPlace();

      node.x = p.x;
      node.y = p.y;

      Object.values(nodes).forEach(updateLinked(node));
    }

    console.log(JSON.stringify(nodes, null, 2));
  }
};

module.exports = self; // Node
global['faDiagrams'] = self; // Browserify