const convert = require('xml-js');
const utils = require('./utils');

let resources = {
  name: 'error',
  height: 512,
  index: [],
  links: {
    'arrow-head': {},
    'arrow-head-reverse': {},
    'line-start': {},
    'line-end': {},
    'dashed-step': {}
  },
  icons: {}
};
try {
  resources = require('../resources.json');
} catch (err) {
  console.error('fa-diagrams: SVG resources could not be loaded: ' + err);
}


/**
 * @typedef SubElement2
 * @property {string|undefined} text
 * @property {string|{path:string,width:number:height:number}|undefined} icon
 * @property {string|undefined} color
 * @property {string|undefined} font
 * @property {string|undefined} font-size
 * @property {string|undefined} font-style
 * @property {number|undefined} margin
 * @property {number|undefined} line-height
 * @property {number|undefined} scale
 */
const SUB_DEF = {
  '_': 'string',
  'text': 'string',
  'icon': {
    '_': 'string',
    'path': 'string',
    'width': 'number',
    'height': 'number'
  },
  'color': 'string',
  'font': 'string',
  'font-size': 'number',
  'font-style': 'string',
  'margin': 'number',
  'line-height': 'number',
  'scale': 'number'
};

/**
 * @typedef Node2
 * @property {string} name
 * @property {number} x
 * @property {number} y
 * @property {string|{path:string,width:number:height:number}} icon
 * @property {SubElement2|undefined} bottom
 * @property {SubElement2|undefined} top
 * @property {SubElement2|undefined} left
 * @property {SubElement2|undefined} right
 */
const NODE_DEF = {
  'name': '!string',
  'icon': {
    '_': 'string',
    'path': 'string',
    'width': 'number',
    'height': 'number'
  },
  'x': '!number',
  'y': '!number',
  'color': 'string',
  'scale': 'number',
  'top': SUB_DEF,
  'bottom': SUB_DEF,
  'left': SUB_DEF,
  'right': SUB_DEF
};

/**
 * @typedef Link2
 * @property {string} from
 * @property {string} to
 * @property {string|undefined} type
 * @property {SubElement2|undefined} bottom
 * @property {SubElement2|undefined} top
 * @property {SubElement2|undefined} left
 * @property {SubElement2|undefined} right
 */
const LINK_DEF = {
  'from': '!string',
  'to': '!string',
  'type': 'string',
  'color': 'string',
  'scale': 'number',
  'size': 'number',
  'top': SUB_DEF,
  'bottom': SUB_DEF,
};

const DEFAULT_OPTIONS = {
  'beautify': false,
  'scale': 128,
  'h-spacing': 1.3,
  'color': 'black',
  'icons': {
    'scale': 1,
    'color': ''
  },
  'links': {
    'scale': 1,
    'color': '',
    'size': 0
  },
  'texts': {
    'font': 'Arial',
    'font-size': 15,
    'font-style': 'normal',
    'color': '',
    'margin': 0.2,
    'line-height': 1.2
  }
};

const SUBSTITUTES = {
  'font-awesome': {
    'fas': 'solid',
    'far': 'regular',
    'fab': 'brands'
  }
};

const DEFAULT_SCALE = 0.4;
const LINK_MARGIN = (1 - DEFAULT_SCALE) / 2;

module.exports = (options) => {

  options = utils.merge(DEFAULT_OPTIONS, options);

  const self = {

    /**
     * Find icon data from given name or data
     * @param {string|{path: string, width: number, height: number}} icon
     * @returns {null|{path: string, width: number, height: number}}
     */
    getIcon: (icon) => {
      if (!icon)
        return null;

      if (typeof icon === 'object') {
        if (!icon.path || !icon.path.trim())
          return null;

        icon.height = icon.height || icon.width || resources.height;
        icon.width = icon.width || icon.height;
        return icon;
      }

      if (!icon.trim())
        return null;

      let search = utils.ezClone(resources.index);
      const spl = icon.trim().split(' ').map(t => t.indexOf('fa-') === 0 ? t.substr(3) : t);

      for (let i = 0; i < spl.length; i++) {
        //replace fas by regular for example
        if (Object.keys(SUBSTITUTES[resources.name] || {}).includes(spl[i])) {
          spl[i] = SUBSTITUTES[resources.name][spl[i]];
        }
        if (resources.index.includes(spl[i])) {
          search = [spl.splice(i, 1)];
        }
      }

      icon = spl[0];

      for (let i = 0; i < search.length; i++) {
        if (resources.icons[search[i]] && resources.icons[search[i]][icon]) {
          resources.icons[search[i]][icon].height = resources.height;
          return resources.icons[search[i]][icon];
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
      const arrowHead = 'v46.059c0 21.382 25.851 32.09 40.971 16.971 l86.059 -86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971v46.059'; //134.059
      const arrowHeadR = 'v-46.059c0-21.382-25.851-32.09-40.971-16.971l-86.059 86.059c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971v-46.059'; //134.059
      const lineEnd = 'c6.627 0 12 -5.373 12 -12v-56c0 -6.627 -5.373 -12 -12 -12'; // 12
      const lineStart = 'c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12'; // 12
      const dashedStep = `${lineStart}h56${lineEnd}`; // 80
      switch (type) {
        case 'none':
          return null;
        default:
          return `M12 216${lineStart}h${width * 512 - 146.059}${arrowHead}z`;
        case 'line':
          return `M12 216${lineStart}h${width * 512 - 24}${lineEnd}z`;
        case 'double':
          return `M134.059 216${arrowHeadR}h${width * 512 - 268.06}${arrowHead}z`;
        case 'split-double':
          return `M12 126${lineStart}h${width * 512 - 146.059}${arrowHead}M134.059 306${arrowHeadR}h${width * 512 - 146.059}${lineEnd}z`;
        case 'dashed':
          const n1 = Math.floor((width * 512 - 134.059) / (80 * 2.1));
          const space1 = ((width * 512 - 134.059) - n1 * 56 - 24) / (n1);
          return `M12 216${new Array(n1).fill(`${dashedStep}m${space1} 0`).join('')}v80${arrowHead}z`;
        case 'dashed-line':
          const n2 = Math.floor(width * 512 / (80 * 2.1));
          const space2 = (width * 512 - n2 * 56 - 24) / (n2 - 1);
          return `M12 216${new Array(n2).fill(dashedStep).join(`m${space2} 0`)}z`;
        case 'dashed-double':
          const n3 = Math.floor((width * 512 - 134.059 * 2) / (80 * 2.1));
          const space3 = ((width * 512 - 134.059 * 2) - n3 * 56 - 24) / (n3 + 1);
          return `M134.059 216${arrowHeadR}m${space3}-80${new Array(n3).fill(`${dashedStep}m${space3} 0`).join('')}v80${arrowHead}z`;
        case 'dashed-split-double':
          const n4 = Math.floor((width * 512 - 134.059) / (80 * 2.1));
          const space4 = ((width * 512 - 134.059) - n4 * 56 - 24) / (n4);
          return `M12 126${new Array(n4).fill(`${dashedStep}m${space4} 0`).join('')}v80${arrowHead}M134.059 306${arrowHeadR}m${space4} -80${new Array(n4).fill(`${dashedStep}`).join(`m${space4} 0`)}z`;
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
     * @param {string} text
     * @param {number} lineHeight
     * @param {number} x
     * @param {string} anchor
     * @return {Object} svg text
     */
    getSvgText: (text, lineHeight, x, anchor) => {
      text = text.trim();
      if (!text.includes('\n'))
        return {'_text': text};
      const list = [];
      text.split('\n').map(t => t.trim()).forEach((line, i) => {
        list.push({
          '_attributes': {
            'x': x,
            'dy': i === 0 ? '0' : `${lineHeight}em`,
            'text-anchor': anchor
          },
          '_text': line
        });
      });
      return {'tspan': list};
    },

    getFontWeight: (style, force = false) => {
      if (!style)
        return undefined;
      const spl = style.split(' ');
      if (spl.includes('bold'))
        return 'bold';
      return force ? 'normal' : undefined;
    },

    getFontStyle: (style, force = false) => {
      if (!style)
        return undefined;
      const spl = style.split(' ');
      if (spl.includes('italic'))
        return 'italic';
      if (spl.includes('oblique'))
        return 'oblique';
      return force ? 'normal' : undefined;
    },

    getTextDecoration: (style) => {
      if (!style)
        return undefined;
      const out = [];
      const spl = style.split(' ');
      if (spl.includes('underlined'))
        out.push('underline');
      if (spl.includes('overlined'))
        out.push('overline');
      if (spl.includes('striked'))
        out.push('line-through');
      return out.length ? out.join(',') : undefined;
    },

    /**
     * @param {Node2|Link2} element
     * @param {string} side
     * @param {SubElement2} subE
     * @param {boolean?} reverse
     * @param {boolean?} link
     * @returns {Object} svg group
     */
    renderSubText: (element, side, subE, reverse = false, link = false) => {
      const fontSize = subE['font-size'] || options['texts']['font-size'];
      const margin = (subE['margin'] || options['texts']['margin']) / (link ? 4 : 1);
      let pos;
      let anchor;
      switch (side) {
        case 'bottom':
          pos = {x: 0, y: 1};
          anchor = 'middle';
          break;
        case 'top':
          pos = {x: 0, y: -1};
          anchor = 'middle';
          break;
        case 'left':
          pos = {x: -1, y: 0};
          anchor = 'end';
          break;
        case 'right':
          pos = {x: 1, y: 0};
          break;
      }

      const lineHeight = subE['line-height'] || options['texts']['line-height'];
      const text = self.getSvgText(subE.text, lineHeight, pos.x * fontSize / 2, anchor);
      const textHeight = text['tspan'] ? text['tspan'].length - 1 : 0;

      text['_attributes'] = {
        'font-family': subE['font'],
        'font-size': subE['font-size'],
        'font-weight': self.getFontWeight(subE['font-style'], true),
        'font-style': self.getFontStyle(subE['font-style'], true),
        'text-decoration': self.getTextDecoration(subE['font-style'] || options['texts']['font-style']),
        'text-anchor': anchor,
        'x': pos.x * fontSize / 2,
        'y': (pos.y + 0.25) * fontSize - (1 - pos.y) * textHeight * fontSize * lineHeight / 2
      };

      return {
        '_attributes': {
          'transform': `${reverse ? 'rotate(180) ' : ''}translate(${pos.x * margin} ${pos.y * margin}) scale(${1 / options['scale']} ${1 / options['scale']})`,
          'fill': (subE['color'] || element['color'] || options['texts']['color'] || options[link ? 'links' : 'icons']['color'] || undefined),
        },
        'text': text
      };
    },

    /**
     * @param {Node2} node
     * @return {Object} svg group
     */
    renderNode: (node) => {
      const groups = [];

      const icon = self.getIcon(node.icon);
      if (icon) {
        const scale = (node['scale'] || options['icons']['scale']) * DEFAULT_SCALE;
        groups.push({
          '_attributes': {
            'transform': `scale(${scale / icon.height} ${scale / icon.height}) translate(${-icon.width / 2} ${-icon.height / 2})`,
            'fill': (node['color'] || options['icons']['color'] || undefined)
          },
          'path': {
            '_attributes': {
              'd': icon.path,
            }
          }
        });
      }

      ['bottom', 'top', 'left', 'right'].forEach(side => {
        const subE = node[side];
        if (subE && subE.text)
          groups.push(self.renderSubText(node, side, subE));
      });

      return !groups.length ? null : {
        '_attributes': {
          'transform': `translate(${(node.x + 0.5) * options['h-spacing']} ${node.y + 0.5})`,
        },
        'g': groups
      };
    },

    /**
     * @param {Object<string,Node2>} nodes
     * @param {Link2} link
     * @return {Object} svg group
     */
    renderLink: (nodes, link) => {
      const src = nodes[link.from];
      const dst = nodes[link.to];

      const posX = ((src.x + dst.x) / 2 + 0.5) * options['h-spacing'];
      const posY = (src.y + dst.y) / 2 + 0.5;

      const angle = Math.atan2(dst.y - src.y, (dst.x - src.x) * options['h-spacing']) * 180 / Math.PI;

      const groups = [];

      const scale = (link['scale'] || options['links']['scale']) * DEFAULT_SCALE;
      let size = link['size'] || options['links']['size'];

      if (!size) {
        let dx = Math.abs(dst.x - src.x) * options['h-spacing'];
        if (dx > 0)
          dx -= LINK_MARGIN * 2;
        let dy = Math.abs(dst.y - src.y);
        if (dy > 0)
          dy -= LINK_MARGIN * 2;

        size = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / scale;
      }

      const path = self.getLinkPath(link.type, size);

      if (path) {
        groups.push({
          '_attributes': {
            'transform': `scale(${scale / 512} ${scale / 512}) translate(${(-256 * size)} ${-256})`,
            'fill': (link['color'] || options['links']['color'] || undefined)
          },
          'path': {
            '_attributes': {
              'd': path
            }
          }
        });
      }

      const reverse = Math.abs(angle) > 90;
      if (!reverse) {
        link.top = link.top || link.left;
        link.bottom = link.bottom || link.right;
      } else {
        link.top = link.top || link.right;
        link.bottom = link.bottom || link.left;
      }

      ['bottom', 'top'].forEach(side => {
        const subE = link[side];
        if (subE && subE.text)
          groups.push(self.renderSubText(link, side, subE, reverse, true));
      });


      return !groups.length ? null : {
        '_attributes': {
          'transform': `translate(${posX} ${posY}) rotate(${angle})`
        },
        'g': groups
      };
    },

    /**
     * Convert xml-js data into correct svg xml string
     * @param {Object} data
     * @param {{w:number, h:number}} bounds
     * @returns {string} SVG data
     */
    toXML: (data, bounds) => {
      const xml = {
        'svg': {
          '_attributes': {
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': `0 0 ${bounds.w * options['h-spacing']} ${bounds.h}`,
            'width': bounds.w * options['h-spacing'] * options['scale'] / DEFAULT_SCALE,
            'height': bounds.h * options['scale'] / DEFAULT_SCALE,
            'font-family': options['texts']['font'],
            'font-size': options['texts']['font-size'],
            'font-weight': self.getFontWeight(options['texts']['font-style']),
            'font-style': self.getFontStyle(options['texts']['font-style']),
            'text-decoration': self.getTextDecoration(options['texts']['font-style']),
            'fill': options['color'],
            'stroke-width': 0
          }
        }
      };
      Object.keys(data).forEach(key => {
        xml['svg'][key] = data[key];
      });
      return convert.js2xml(xml, {
        compact: true,
        spaces: options['beautify'] ? 4 : 0
      }).replace(/<\/tspan>(\s*)<tspan/gm, '<\/tspan><tspan'); //fix text rendering
    },

    /**
     * @param {Object<string,Node2>} nodes
     * @param {Link2[]} links
     * @returns {string} SVG data
     */
    compute: (nodes, links) => {

      const data = {'g': []};

      links.forEach((link, i) => {
        const res = utils.isValid(link, LINK_DEF);
        if (res)
          throw `Link ${i} (${link.from}->${link.to}) is invalid at key '${res}'`;

        ['bottom', 'top'].forEach(sub => {
          if (typeof link[sub] === 'string')
            link[sub] = {text: link[sub]};
        });

        const group = self.renderLink(nodes, link);
        if (group)
          data['g'].push(group);
      });

      Object.keys(nodes).forEach(key => {
        const res = utils.isValid(nodes[key], NODE_DEF);
        if (res)
          throw `Node '${key}' is invalid at key '${res}'`;

        ['bottom', 'top', 'left', 'right'].forEach(sub => {
          if (typeof nodes[key][sub] === 'string')
            nodes[key][sub] = {text: nodes[key][sub]};
        });

        const group = self.renderNode(nodes[key]);
        if (group)
          data['g'].push(group);
      });

      const bounds = self.getBounds(nodes);

      return self.toXML(data, bounds);
    }
  };

  return self;
};