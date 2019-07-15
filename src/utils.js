const self = {
  /**
   * Merge resources by reading object keys and keeping reference value only if it's type is different from the source
   * @param ref - reference object/value
   * @param src - source object/value
   * @returns {*}
   */
  merge: (ref, src) => {
    if (typeof ref !== typeof src) {
      return ref;
    } else if (ref.length && !src.length) {
      return ref;
    } else if (ref.length && src.length) {
      return src;
    } else if (typeof ref === 'object') {
      const out = {};
      Object.keys(ref).forEach((key) => out[key] = self.merge(ref[key], src[key]));
      return out;
    } else {
      return src;
    }
  },

  /**
   * Verify if an object respect it's definition
   * @param obj
   * @param def
   * @returns {null|string}
   */
  isValid: (obj, def) => {
    const keys = Object.keys(def).filter(k => k !== '_');
    let key;
    let type;
    for (let i = 0; i < keys.length; i++) {
      key = keys[i];
      type = (typeof obj !== 'object' || obj[key] === undefined || obj[key] === null) ? null : typeof obj[key];
      if (type === 'object' && obj[key].length > 0)
        type = 'array';
      if (typeof def[key] === 'object') {
        if (type && type !== 'object' && type !== def[key]['_'])
          return key;
        const res = self.isValid(type ? obj[key] : undefined, def[key]);
        if (res)
          return key + '.' + res;
      } else {
        if (def[key][0] === '!') {
          def[key] = def[key].substr(1);
          if (!type)
            return key;
        }
        if (type && type !== def[key])
          return key;
      }
    }
    return null;
  },

  /**
   * Clone any JS variable or object
   * @param {*} arg
   * @returns {any}
   */
  ezClone: (arg) => JSON.parse(JSON.stringify(arg)),

  /**
   * Create a new map of the defined bounds and filling
   * @param {number} w
   * @param {number} h
   * @param {*} fill
   * @returns {any[][]}
   */
  newMap: (w, h, fill) => new Array(w).fill(0).map(() => new Array(h).fill(fill))
};

module.exports = self;