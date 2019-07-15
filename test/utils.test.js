/* jshint -W117 */
const utils = require('../src/utils');

describe('merge', () => {
  test('undefined', () => {
    const res = utils.merge({'a': 1}, undefined);
    expect(res).toEqual({'a': 1});
  });
  test('redefine', () => {
    const res = utils.merge({'a': 1}, {'a': 2});
    expect(res).toEqual({'a': 2});
  });
  test('wrong type', () => {
    const res = utils.merge({'a': 'hello'}, {'a': 2});
    expect(res).toEqual({'a': 'hello'});
  });
  test('array redefine', () => {
    const res = utils.merge({'a': [1, 2, 3]}, {'a': [4, 5, 6]});
    expect(res).toEqual({'a': [4, 5, 6]});
  });
  test('sub object wrong type', () => {
    const res = utils.merge({'a': {'b': 5}}, {'a': 5});
    expect(res).toEqual({'a': {'b': 5}});
  });
  test('sub object redefine', () => {
    const res = utils.merge({'a': {'b': 5}}, {'a': {'b': 6}});
    expect(res).toEqual({'a': {'b': 6}});
  });
  test('add missing keys', () => {
    const res = utils.merge({'a': 1, 'b': 3}, {'a': 2});
    expect(res).toEqual({'a': 2, 'b': 3});
  });
  test('extra keys ignore', () => {
    const res = utils.merge({'a': 1}, {'a': 2, 'b': 3});
    expect(res).toEqual({'a': 2});
  });
});

describe('isValid', () => {
  test('valid number', () => {
    expect(utils.isValid({a: 0}, {a: 'number'})).toBe(null);
  });
  test('invalid number', () => {
    expect(utils.isValid({b: 'number'}, {b: 'number'})).toBe('b');
  });
  test('valid string', () => {
    expect(utils.isValid({b: ''}, {b: 'string'})).toBe(null);
  });
  test('invalid string', () => {
    expect(utils.isValid({b: 0}, {b: 'string'})).toBe('b');
  });
  test('valid array', () => {
    expect(utils.isValid({c: [1, 2, 3]}, {c: 'array'})).toBe(null);
  });
  test('invalid array', () => {
    expect(utils.isValid({c: {d: 5}}, {c: 'array'})).toBe('c');
  });
  test('undefined optional key', () => {
    expect(utils.isValid({}, {a: 'number'})).toBe(null);
  });
  test('undefined required key', () => {
    expect(utils.isValid({}, {a: '!number'})).toBe('a');
  });
  test('defined required key', () => {
    expect(utils.isValid({a: 5}, {a: '!number'})).toBe(null);
  });
  test('invalid sub-object', () => {
    expect(utils.isValid({a: 5}, {a: {b: 'number'}})).toBe('a');
  });
  test('undefined not required sub-object', () => {
    expect(utils.isValid({}, {a: {b: 'number'}})).toBe(null);
  });
  test('undefined required sub-object', () => {
    expect(utils.isValid({}, {a: {b: '!number'}})).toBe('a.b');
  });
  test('invalid sub-object', () => {
    expect(utils.isValid({a: {b: 'hello'}}, {a: {b: 'number'}})).toBe('a.b');
  });
  test('defined required sub-object', () => {
    expect(utils.isValid({a: {b: 5}}, {a: {b: '!number'}})).toBe(null);
  });
  test('ignored extra key', () => {
    expect(utils.isValid({b: 5}, {a: 'number'})).toBe(null);
  });
});

test('ezClone', () => {
  const a = {
    'a': 5,
    'b': {
      'c': [1, 2, 3]
    }
  };
  const b = utils.ezClone(a);
  expect(b).toEqual(a);
  b.b.c[1] = 3;
  expect(b).toEqual({
    'a': 5,
    'b': {
      'c': [1, 3, 3]
    }
  });
  expect(a).toEqual({
    'a': 5,
    'b': {
      'c': [1, 2, 3]
    }
  });
});

test('newMap', () => {
  expect(utils.newMap(2, 3, 3)).toEqual([
    [3, 3, 3], [3, 3, 3]
  ]);
});