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

const DEFAULT_OPTIONS = {
  'beautify': false
};

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
     * @param {Object<string,Node2>} nodes
     * @returns {Object}
     */
    renderNodes: (nodes) => {
      const g = [];
      Object.values(nodes).forEach(() => {
        //TODO
      });
      return {'g': g};
    },

    /**
     * Convert xml-js data into correct svg xml string
     * @param {Object} data
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    toXML: (data, width, height) => {
      const xml = {
        'svg': {
          '_attributes': {
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': `0 0 ${width} ${height}`
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

    compute: (nodes) => {
      const data = self.renderNodes(nodes);
      return self.toXML(data, 0, 0); //TODO temporary
    }
  };

  return self;
};