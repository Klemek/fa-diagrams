let list = {};
try {
  list = require('../svg_list.json');
}catch(err){
  console.error('fa-diagrams: SVG list could not be loaded', err);
}

const self = {
  list: list
};

module.exports = self; // Node
global['faDiagrams'] = self; // Browserify