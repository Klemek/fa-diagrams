const convert = require('xml-js');

let list = {};
try {
  list = require('../svg_list.json');
} catch (err) {
  console.error('fa-diagrams: SVG list could not be loaded', err);
}

const DEFAULT_OPTIONS = {
  'beautify': false
};

module.exports = (options = DEFAULT_OPTIONS) => {
  const self = {
    defaultOptions: DEFAULT_OPTIONS,

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

    compute: () => {
      return self.toXML({}, 0, 0); //TODO temporary
    }
  };

  return self;
};