//const xml = require('xml-js');
let list = {};
try {
  list = require('../svg_list.json');
} catch (err) {
  console.error('fa-diagrams: SVG list could not be loaded', err);
}
const ezclone = (a) => JSON.parse(JSON.stringify(a));
const newmap = (w, h, fill = 0) => new Array(w).fill(0).map(() => new Array(h).fill(fill));

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
  debug: false,
  /**
   * @param {{options: Object, nodes:Object[], links: Object[]}} data
   */
  compute: (data) => {
    self.options = merge(DEFAULT_OPTIONS, data['options']);

    /**
     * @type {Object<string,{name: string, icon: string}>}
     */
    let nodes = {};
    const nodeList = (data['nodes'] || []).filter(n => typeof n.name === 'string');
    //nodeList.forEach((n, i) => n.order = i);
    nodeList.forEach(n => nodes[n.name] = n);

    /**
     * @type {[{from: string, to: string, direction: string?}]}
     */
    let links = (data['links'] || []).filter(l => l.from && l.to);
    links.filter(l => !nodes[l.from]).forEach(l => console.warn(`unknown source node "${l.from}"`));
    links.filter(l => !nodes[l.to]).forEach(l => console.warn(`unknown destination node "${l.to}"`));
    links = links.filter(l => nodes[l.from] && nodes[l.to]);

    nodes = self.placeNodes(nodes, links);

    if (!nodes)
      throw 'Failed to place nodes';

    //console.log(JSON.stringify(nodes, null, 2));
    console.log(Object.values(nodes).map(n => `${n.name} : [${n.x}, ${n.y}]`).join('\n'));
  },
  placeNodes: (nodes, links) => {
    Object.values(nodes).forEach(node => {
      node.const = {
        beforeX: [],
        afterX: [],
        beforeY: [],
        afterY: []
      };
    });

    links.forEach(link => {
      if (link.direction) {
        switch (link.direction) {
          case 'up':
          case 'top':
            nodes[link.from].const.beforeY.push(link.to);
            nodes[link.to].const.afterY.push(link.from);
            break;
          case 'down':
          case 'bottom':
            nodes[link.from].const.afterY.push(link.to);
            nodes[link.to].const.beforeY.push(link.from);
            break;
          case 'left':
            nodes[link.from].const.beforeX.push(link.to);
            nodes[link.to].const.afterX.push(link.from);
            break;
          case 'right':
            nodes[link.from].const.afterX.push(link.to);
            nodes[link.to].const.beforeX.push(link.from);
            break;
        }
      }
    });

    return self.applyLinks(nodes, links);
  },
  applyLinks: (nodes, links, depth = 0) => {
    if(self.debug) self.debugMap(nodes);

    if (!self.isValid(nodes, links)) {
      if (self.debug) console.log(`${new Array(depth).fill('.').join('')}invalid node placement`);
      return null;
    }

    const keys = Object.keys(nodes).filter(k => nodes[k].x === undefined); //not placed

    if (keys.length === 0)
      return nodes;

    const free = [];

    const tryPos = (key, x, y) => {
      const nodes2 = ezclone(nodes);
      nodes2[key].x = x;
      nodes2[key].y = y;
      if (self.debug) console.log(`${new Array(depth).fill('.').join('')}${key} -> [${x}, ${y}]`);
      return self.applyLinks(nodes2, links, depth + 1);
    };

    let key;
    let c;
    let nodes2;
    let p;

    // prefer no diagonals
    for (let ln = 0; ln < keys.length; ln++) {
      key = keys[ln];
      c = self.getConstraints(nodes, key, false);
      if (!c && !self.options['diagonals']) {
        if (self.debug) console.log(`${new Array(depth).fill('.').join('')}${key} -> impossible`);
        return null;
      } else if (c && c.free) {
        free.push(keys[ln]);
      } else if (c) {
        nodes2 = tryPos(key, c.startX, c.startY);
        if (nodes2)
          return nodes2;
      } else {
        if (self.debug) console.log(`${new Array(depth).fill('.').join('')}${key} -> impossible without diagonals`);
      }
    }

    // allow diagonals
    for (let ln = 0; ln < keys.length; ln++) {
      key = keys[ln];
      c = self.getConstraints(nodes, key, true);
      if (!c) {
        if (self.debug) console.log(`${new Array(depth).fill('.').join('')}${key} -> impossible`);
        return null;
      } else if (c.free) {
        free.push(keys[ln]);
      } else {
        nodes2 = tryPos(key, c.startX, c.startY);
        if (nodes2)
          return nodes2;
      }
    }

    for (let ln = 0; ln < free.length; ln++) {
      key = free[ln];
      p = self.getNewPos(nodes);
      nodes2 = tryPos(key, p.x, p.y);
      if (nodes2)
        return nodes2;
    }
    return null;
  },
  debugMap: (nodes) => {
    const b = self.getBounds(nodes);

    const map = newmap(b.w, b.h).map(row => row.map(() => []));
    const list = Object.values(nodes).filter(n => n.x !== undefined);
    list.forEach(n => {
      map[n.x - b.x][n.y - b.y].push(n.name);
    });
    let out = map.map(row => row.map(cell => cell.join(',')));
    let maxLen = 0;
    out.forEach(row => row.forEach(cell => {
      maxLen = Math.max(maxLen, cell.length);
    }));
    out = out.map(row => row.map(cell => cell + new Array(maxLen - cell.length).fill(' ').join('')));
    console.log('\n' + out.map(row => row.join('|')).join('\n') + '\n');
  },
  isValid: (nodes, links) => {
    let link, src, dst;
    for (let li = 0; li < links.length; li++) {
      link = links[li];
      src = nodes[link.from];
      dst = nodes[link.to];
      if (src.x !== undefined && dst.x !== undefined) {
        if (self.nodeBetween(nodes, link.from, link.to)) {
          if (self.debug) console.log(` ${link.from} -> ${link.to}: path obstructed`);
          return false;
        }
        switch (link.direction) {
          case 'up':
          case 'top':
            if (dst.y - src.y >= 0) {
              if (self.debug) console.log(` ${src.name} -> ${dst.name}: invalid dy: ${dst.y - src.y} >= 0`);
              return false;
            }
            break;
          case 'down':
          case 'bottom':
            if (dst.y - src.y <= 0) {
              if (self.debug) console.log(` ${src.name} -> ${dst.name}: invalid dy: ${dst.y - src.y} <= 0`);
              return false;
            }
            break;
          case 'left':
            if (dst.x - src.x >= 0) {
              if (self.debug) console.log(` ${src.name} -> ${dst.name}: invalid dx: ${dst.x - src.x} >= 0`);
              return false;
            }
            break;
          case 'right':
            if (dst.x - src.x <= 0) {
              if (self.debug) console.log(` ${src.name} -> ${dst.name}: invalid dx; ${dst.x - src.x} <= 0`);
              return false;
            }
            break;
        }
      }
    }
    return true;
  },
  nodeBetween: (nodes, n1, n2) => {
    const x1 = nodes[n1].x;
    const y1 = nodes[n1].y;
    const x2 = nodes[n2].x;
    const y2 = nodes[n2].y;

    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);

    const samePos = (x, y) => n => n.x === x && n.y === y && n.name !== n1 && n.name !== n2;

    if (dx >= dy) {
      for (let x = x1; x <= x2; x++) {
        let y = Math.round(y1 + dy * (x - x1) / dx);
        if (Object.values(nodes).find(samePos(x, y)))
          return true;
      }
    } else {
      for (let y = y1; y <= y2; y++) {
        let x = Math.round(x1 + dx * (y - y1) / dy);
        if (Object.values(nodes).find(samePos(x, y)))
          return true;
      }
    }
    return false;
  },
  /**
   * @param nodes
   * @param {string} n - node key
   * @param {boolean} diagonals
   * @returns {null|{minX: number, maxX: number, minY: number, maxY: number, free: boolean, startX: number, startY: number}} null if not possible
   */
  getConstraints: (nodes, n, diagonals) => {
    const node = nodes[n];
    const c = {
      maxX: undefined,
      maxY: undefined,
      minX: undefined,
      minY: undefined,
      startX: undefined,
      startY: undefined,
      free: true,
    };

    const apply = (dMinX, dMaxX, dMinY, dMaxY) => n2 => {
      if (nodes[n2].x !== undefined) {
        const x2 = nodes[n2].x;
        const y2 = nodes[n2].y;
        c.minX = c.minX ? Math.max(x2 + dMinX, c.minX) : x2 + dMinX;
        c.maxX = c.maxX ? Math.min(x2 + dMaxX, c.maxX) : nodes[n2].x + dMaxX;
        c.minY = c.minY ? Math.max(y2 + dMinY, c.minY) : y2 + dMinY;
        c.maxY = c.maxY ? Math.min(y2 + dMaxY, c.maxY) : y2 + dMaxY;
        if (!c.startX) {
          c.startX = Math.abs(dMaxY + dMinY) > 0 ? x2 : (Math.abs(dMinX) === 1 ? 'minX' : 'maxX');
          c.startY = Math.abs(dMaxX + dMinX) > 0 ? y2 : (Math.abs(dMinY) === 1 ? 'minY' : 'maxY');
        }
        c.free = false;
      }
    };

    const area = self.options['max-link-length'];
    const sideArea = diagonals ? area : 0;

    node.const.afterX.forEach(apply(1 - area, -1, -sideArea, sideArea));
    node.const.beforeX.forEach(apply(1, 1 + area, -sideArea, sideArea));
    node.const.afterY.forEach(apply(-sideArea, sideArea, -1 - area, -1));
    node.const.beforeY.forEach(apply(-sideArea, sideArea, 1, 1 + area));

    if (self.debug && !c.free) console.log(` ${n} constraints: x(${c.minX} -> ${c.maxX}) y(${c.minY} -> ${c.maxY}) start(${c.startX}, ${c.startY})`);

    if (typeof c.startX === 'string')
      c.startX = c[c.startX];
    if (typeof c.startY === 'string')
      c.startY = c[c.startY];

    return (c.minX > c.maxX || c.minY > c.maxY) ? null : c;
  },
  getNewPos: (nodes) => {
    const b = self.getBounds(nodes);
    const map = newmap(b.w, b.h, false);
    const list = Object.values(nodes).filter(n => n.x !== undefined);
    list.forEach(n => {
      map[n.x - b.x][n.y - b.y] = true;
    });
    for (let x = 0; x < b.w; x++) {
      for (let y = 0; y < b.h; y++) {
        if (!map[x][y])
          return {x: x + b.x, y: y + b.y};
      }
    }
    if (self.options['expand'] === 'h')
      return {x: b.x + b.w, y: b.y}; //expand horizontally
    else
      return {x: b.x, y: b.y + b.h}; //expand vertically
  },
  getBounds: (nodes) => {
    const list = Object.values(nodes).filter(n => n.x !== undefined);
    if (list.length === 0)
      return {x: 0, y: 0, w: 0, h: 0}; //empty
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;
    list.forEach(n => {
      minX = Math.min(n.x, minX);
      minY = Math.min(n.y, minY);
      maxX = Math.max(n.x, maxX);
      maxY = Math.max(n.y, maxY);
    });
    return {x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1};
  },
};

module.exports = self; // Node
global['faDiagrams'] = self; // Browserify