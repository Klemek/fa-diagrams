const ezclone = (a) => JSON.parse(JSON.stringify(a));
const newmap = (w, h, fill) => new Array(w).fill(0).map(() => new Array(h).fill(fill));

/**
 * @typedef Node1
 * @property {string} name
 * @property {undefined|number} x
 * @property {undefined|number} y
 * @property {undefined|{beforeX: string[], afterX: string[], beforeY: string[], afterY: string[]}} const
 */

/**
 * @typedef Link1
 * @property {string} from
 * @property {string} to
 * @property {string|undefined} direction
 */

module.exports = (options) => {
  const self = {
    /**
     * Get the current bounds of the graph of nodes
     * @param {Object<string,Node1>} nodes
     * @returns {{w: number, x: number, h: number, y: number}}
     */
    getBounds: (nodes) => {
      const list = Object.values(nodes).filter(n => n.x !== undefined);
      if (list.length === 0)
        return {x: 0, y: 0, w: 0, h: 0}; //empty
      let minX = null;
      let minY = null;
      let maxX = null;
      let maxY = null;
      list.forEach(n => {
        minX = minX !== null ? Math.min(n.x, minX) : n.x;
        minY = minY !== null ? Math.min(n.y, minY) : n.y;
        maxX = maxX !== null ? Math.max(n.x, maxX) : n.x;
        maxY = maxY !== null ? Math.max(n.y, maxY) : n.y;
      });
      return {x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1};
    },
    /**
     * Get a new available position around the existing nodes
     * @param {Object<string,Node1>} nodes
     * @returns {{x: number, y: number}}
     */
    getNewPos: (nodes) => {
      const b = self.getBounds(nodes);
      const map = newmap(b.w, b.h, false);
      const list = Object.values(nodes).filter(n => n.x !== undefined);
      list.forEach(n => {
        map[n.x - b.x][n.y - b.y] = true;
      });
      for (let y = 0; y < b.h; y++) {
        for (let x = 0; x < b.w; x++) {
          if (!map[x][y])
            return {x: x + b.x, y: y + b.y};
        }
      }
      if (b.w <= b.h)
        return {x: b.x + b.w, y: b.y}; //expand horizontally
      else
        return {x: b.x, y: b.y + b.h}; //expand vertically
    },
    /**
     * Check if no other nodes are located in the path of n1 <-> n2
     * @param {Object<string,Node1>} nodes
     * @param {string} n1
     * @param {string} n2
     * @returns {boolean}
     */
    nodeBetween: (nodes, n1, n2) => {
      let x1 = nodes[n1].x;
      let y1 = nodes[n1].y;
      let x2 = nodes[n2].x;
      let y2 = nodes[n2].y;

      const dx = x2 - x1;
      const dy = y2 - y1;

      const samePos = (x, y) => n => n.x === x && n.y === y && n.name !== n1 && n.name !== n2;

      if (Math.abs(dx) >= Math.abs(dy)) {
        if (x1 > x2) {
          let tmp = x1;
          x1 = x2;
          x2 = tmp;
        }
        for (let x = x1; x <= x2; x++) {
          let y = Math.round(y1 + dy * (x - x1) / dx);
          if (Object.values(nodes).find(samePos(x, y)))
            return true;
        }
      } else {
        if (y1 > y2) {
          let tmp = y1;
          y1 = y2;
          y2 = tmp;
        }
        for (let y = y1; y <= y2; y++) {
          let x = Math.round(x1 + dx * (y - y1) / dy);
          if (Object.values(nodes).find(samePos(x, y)))
            return true;
        }
      }
      return false;
    },

    /**
     * Compute the area of possibility for the node placement and return the node calculated position or if it is unconstrained
     * @param {Object<string,Node1>} nodes
     * @param {string} n - node key
     * @param {boolean} diagonals
     * @returns {null|{x: number, y: number, free: boolean}} null if not possible
     */
    getPosition: (nodes, n, diagonals) => {
      const node = nodes[n];
      const c = {
        maxX: null,
        maxY: null,
        minX: null,
        minY: null,
        startX: null,
        startY: null,
        free: true,
      };

      const apply = (dMinX, dMaxX, dMinY, dMaxY) => n2 => {
        if (nodes[n2].x !== undefined) {
          const x2 = nodes[n2].x;
          const y2 = nodes[n2].y;
          c.minX = c.minX !== null ? Math.max(x2 + dMinX, c.minX) : x2 + dMinX;
          c.maxX = c.maxX !== null ? Math.min(x2 + dMaxX, c.maxX) : x2 + dMaxX;
          c.minY = c.minY !== null ? Math.max(y2 + dMinY, c.minY) : y2 + dMinY;
          c.maxY = c.maxY !== null ? Math.min(y2 + dMaxY, c.maxY) : y2 + dMaxY;
          if (c.startX === null) {
            c.startX = Math.abs(dMaxY + dMinY) > 0 ? x2 : (Math.abs(dMinX) === 1 ? 'minX' : 'maxX');
            c.startY = Math.abs(dMaxX + dMinX) > 0 ? y2 : (Math.abs(dMinY) === 1 ? 'minY' : 'maxY');
          }
          c.free = false;
        }
      };

      const area = options['max-link-length'];
      const sideArea = diagonals ? area : 0;

      node.const.beforeX.forEach(apply(1, 1 + area, -sideArea, sideArea));
      node.const.beforeY.forEach(apply(-sideArea, sideArea, 1, 1 + area));
      node.const.afterX.forEach(apply(-1 - area, -1, -sideArea, sideArea));
      node.const.afterY.forEach(apply(-sideArea, sideArea, -1 - area, -1));

      if (typeof c.startX === 'string')
        c.startX = c[c.startX];
      if (typeof c.startY === 'string')
        c.startY = c[c.startY];

      return (c.minX > c.maxX || c.minY > c.maxY) ? null : {x: c.startX, y: c.startY, free: c.free};
    },

    /**
     * Test if the links are respected by the currently placed nodes
     * @param {Object<string,Node1>} nodes
     * @param {Link1[]} links
     * @returns {boolean}
     */
    isValid: (nodes, links) => {
      let link, src, dst;

      //check overlapping
      const list = Object.values(nodes).filter(n => n.x !== undefined);
      for (let n1 = 0; n1 < list.length - 1; n1++)
        for (let n2 = n1 + 1; n2 < list.length; n2++)
          if (list[n1].x === list[n2].x && list[n1].y === list[n2].y)
            return false;

      for (let li = 0; li < links.length; li++) {
        link = links[li];
        src = nodes[link.from];
        dst = nodes[link.to];
        if (src.x !== undefined && dst.x !== undefined) {
          if (self.nodeBetween(nodes, link.from, link.to))
            return false;
          switch (link.direction) {
            case 'up':
            case 'top':
              if (dst.y - src.y >= 0) return false;
              break;
            case 'down':
            case 'bottom':
              if (dst.y - src.y <= 0) return false;
              break;
            case 'left':
              if (dst.x - src.x >= 0) return false;
              break;
            case 'right':
              if (dst.x - src.x <= 0) return false;
              break;
          }
          if (!options['diagonals'] && src.x !== dst.x && src.y !== dst.y)
            return false;
        }
      }
      return true;
    },


    /**
     * Assure that all nodes coordinates are starting at 0,0
     * @param {Object<string,Node1>} nodes
     */
    correctPlacing: (nodes) => {
      const b = self.getBounds(nodes);
      Object.values(nodes).forEach(node => {
        node.x -= b.x;
        node.y -= b.y;
      });
    },

    /**
     * Core function that do the placing recursively until one combination works
     * @param {Object<string,Node1>} nodes
     * @param {Link1[]} links
     * @param {number} depth
     * @returns {null|Object<string,Node1>}
     */
    applyLinks: (nodes, links, depth = 0) => {
      if (!self.isValid(nodes, links)) {
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
        return self.applyLinks(nodes2, links, depth + 1);
      };

      let key;
      let nodes2;
      let p;

      // prefer no diagonals
      for (let ln = 0; ln < keys.length; ln++) {
        key = keys[ln];
        p = self.getPosition(nodes, key, false);
        if (!p && !options['diagonals']) {
          return null;
        } else if (p && p.free) {
          free.push(keys[ln]);
        } else if (p) {
          nodes2 = tryPos(key, p.x, p.y);
          if (nodes2)
            return nodes2;
        }
      }

      // allow diagonals
      for (let ln = 0; ln < keys.length; ln++) {
        key = keys[ln];
        p = self.getPosition(nodes, key, true);
        if (!p) {
          return null;
        } else if (p.free) {
          free.push(keys[ln]);
        } else {
          nodes2 = tryPos(key, p.x, p.y);
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

    /**
     * Compute x and y coordinates of the nodes with the given links between them
     * @param {Object<string,Node1>} nodes
     * @param {Link1[]} links
     * @returns {Object<string,Node1>|null}
     */
    compute: (nodes, links) => {
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

      nodes = self.applyLinks(nodes, links);

      if (nodes) {
        self.correctPlacing(nodes);

        Object.values(nodes).forEach(node => {
          delete node.const;
        });
      }

      return nodes;
    },

  };
  return self;
};