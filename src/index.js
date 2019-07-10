const path = require('path');

const loadList = () => {
  const paths = [
    path.join(__dirname, '..', 'build', 'svg_list.json'),
    path.join(__dirname, '..', 'svg_list.json'),
  ];
  for (let p = 0; p < paths.length; p++) {
    try {
      return require(paths[p]);
    } catch (err) {
      //ignored
    }
  }
  console.error('fa-diagrams: SVG list was not found at the following paths:\n\t* ' + paths.join('\n\t* '));
  return {};
};

const list = loadList();

const self = {
  list: list
};

module.exports = self;