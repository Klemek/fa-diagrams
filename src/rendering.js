const convert = require('xml-js');

let list = {};
try {
  list = require('../svg_list.json');
} catch (err) {
  console.error('fa-diagrams: SVG list could not be loaded', err);
}

/**
 * @typedef Node2
 * @property {string} name
 * @property {number} x
 * @property {number} y
 * @property {string} icon
 */

/**
 * @typedef Link2
 * @property {string} from
 * @property {string} to
 * @property {string|undefined} type
 */

const DEFAULT_OPTIONS = {
  'beautify': false,
  'scale': 128,
  'h-spacing': 1.3,
  'icons': {
    'scale': 1
  },
  'links': {
    'scale': 1,
    'size': 0
  },
  'font': 'Arial' // https://websitesetup.org/web-safe-fonts-html-css/
};

const DEFAULT_SCALE = 0.4;
const LINK_MARGIN = (1 - DEFAULT_SCALE) / 2;

module.exports = (options = DEFAULT_OPTIONS) => {
  const self = {
    defaultOptions: DEFAULT_OPTIONS,

    /**
     * Find icon data from given name
     * @param {string} name
     * @returns {null|{path: string, width: number}}
     */
    getIcon: (name) => {
      if (!name || !name.trim())
        return null;

      let search = ['solid', 'regular', 'brands'];
      const spl = name.trim().split(' ').map(t => t.indexOf('fa-') === 0 ? t.substr(3) : t);

      const checkType = (type, keywords) => {
        if (search.length > 1) // else it's already found
          keywords.forEach(kw => {
            const i = spl.indexOf(kw);
            if (i >= 0) {
              spl.splice(i, 1);
              search = [type];
            }
          });
      };

      checkType('solid', ['fas', 'solid']);
      checkType('regular', ['far', 'regular']);
      checkType('brands', ['fab', 'brands']);

      name = spl[0];

      for (let i = 0; i < search.length; i++) {
        if (list[search[i]] && list[search[i]][name]) {
          return list[search[i]][name];
        }
      }

      return null;
    },

    /**
     * Create the correct path from the type and width
     * @param {string} type
     * @param {number} width
     * @return {string|null}
     */
    getLinkPath: (type, width) => {
      switch (type) {
        case 'none':
          return null;
        case 'line':
          return `M12 216c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h${width * 512 - 24}c6.627 0 12 -5.373 12 -12v-56c0 -6.627 -5.373 -12 -12 -12z`;
        case 'double':
          const size = width * 512 - 268.06;
          return `M${134.059 + size} 216h-${size}v-46.059c0-21.382-25.851-32.09-40.971-16.971l-86.059 86.059c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971v-46.059h${size}v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z`;
        default:
          return `M12 216c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h${width * 512 - 146.03}v46.059c0 21.382 25.851 32.09 40.971 16.971 l86.059 -86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z`;
      }
    },

    /**
     * Get the width and height of the graph of nodes
     * @param {Object<string,Node2>} nodes
     * @returns {{w: number, h: number}}
     */
    getBounds: (nodes) => {
      const list = Object.values(nodes);
      if (list.length === 0)
        return {w: 0, h: 0}; //empty
      let maxX = 0;
      let maxY = 0;
      list.forEach(n => {
        maxX = Math.max(n.x, maxX);
        maxY = Math.max(n.y, maxY);
      });
      return {w: maxX + 1, h: maxY + 1};
    },

    /**
     * @param {{g:Object[]}} data
     * @param {Object<string,Node2>} nodes
     */
    renderNodes: (data, nodes) => {
      Object.values(nodes).forEach(node => {
        const icon = self.getIcon(node.icon);
        if (icon) {
          const scale = (node['scale'] || options['icons']['scale']) * DEFAULT_SCALE;
          const group = {
            '_attributes': {
              'transform': `translate(${(node.x + 0.5) * options['h-spacing']} ${node.y + 0.5})`
            },
            'g': {
              '_attributes': {
                'transform': `scale(${scale / 512} ${scale / 512}) translate(${-icon.width / 2} ${-256})`
              },
              'path': {
                '_attributes': {
                  'd': icon.path,
                }
              }
            }
          };
          data['g'].push(group);
        }
      });
    },

    /**
     * @param {{g:Object[]}} data
     * @param {Object<string,Node2>} nodes
     * @param {Link2[]} links
     */
    renderLinks: (data, nodes, links) => {
      links.forEach(link => {
        const src = nodes[link.from];
        const dst = nodes[link.to];

        const posX = ((src.x + dst.x) / 2 + 0.5) * options['h-spacing'];
        const posY = (src.y + dst.y) / 2 + 0.5;

        const angle = Math.atan2(dst.y - src.y, (dst.x - src.x) * options['h-spacing']) * 180 / Math.PI;

        let size = link['size'] || options['links']['size'];

        if (!size) {
          let dx = Math.abs(dst.x - src.x) * options['h-spacing'];
          if (dx > 0)
            dx -= LINK_MARGIN * 2;
          let dy = Math.abs(dst.y - src.y);
          if (dy > 0)
            dy -= LINK_MARGIN * 2;

          size = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / DEFAULT_SCALE;
        }

        const path = self.getLinkPath(link.type, size);

        if (!path)
          return;

        const scale = (link['scale'] || options['links']['scale']) * DEFAULT_SCALE;
        const group = {
          '_attributes': {
            'transform': `translate(${posX} ${posY}) rotate(${angle})`
          },
          'g': {
            '_attributes': {
              'transform': `scale(${scale / 512} ${scale / 512}) translate(${(-256 * size)} ${-256})`
            },
            'path': {
              '_attributes': {
                'd': path
              }
            }
          }
        };
        data['g'].push(group);
      });
    },

    /**
     * Convert xml-js data into correct svg xml string
     * @param {Object} data
     * @param {{w:number, h:number}} bounds
     * @returns {string}
     */
    toXML: (data, bounds) => {
      const xml = {
        'svg': {
          '_attributes': {
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': `0 0 ${bounds.w * options['h-spacing']} ${bounds.h}`,
            'width': bounds.w * options['h-spacing'] * options['scale'] / DEFAULT_SCALE,
            'height': bounds.h * options['scale'] / DEFAULT_SCALE,
          }
        }
      };
      Object.keys(data).forEach(key => {
        xml['svg'][key] = data[key];
      });
      return convert.js2xml(xml, {
        compact: true,
        spaces: options['beautify'] ? '\t' : 0
      });
    },

    compute: (nodes, links) => {

      const bounds = self.getBounds(nodes);

      const data = {'g': []};

      self.renderNodes(data, nodes);
      self.renderLinks(data, nodes, links);

      return self.toXML(data, bounds);
    }
  };

  return self;
};