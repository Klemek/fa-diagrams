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