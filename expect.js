var assert = require('assert');
var util = require('util');

module.exports = Expectation;

/**
 * An Expectation is a wrapper around an assertion that allows it to be written
 * in a more natural style, without the need to remember the order of arguments.
 * This helps prevent you from making mistakes when writing tests. For example,
 * instead of writing:
 *
 *   assert.equal(actual, expected, [message])
 *
 * you can write
 *
 *   expect(actual).toEqual(expected, [message])
 */
function Expectation(actual) {
  if (!(this instanceof Expectation))
    return new Expectation(actual);

  this.actual = actual;
}

var _slice = Array.prototype.slice;
function wrapAssertion(assertion) {
  return function () {
    return assertion.apply(assert, [ this.actual ].concat(_slice.call(arguments, 0)));
  };
}

Expectation.prototype.toBe = wrapAssertion(assert.strictEqual);
Expectation.prototype.toNotBe = wrapAssertion(assert.notStrictEqual);
Expectation.prototype.toEqual = wrapAssertion(assert.deepEqual);
Expectation.prototype.toNotEqual = wrapAssertion(assert.notDeepEqual);
Expectation.prototype.toThrow = wrapAssertion(assert.throws);
Expectation.prototype.toNotThrow = wrapAssertion(assert.doesNotThrow);

Expectation.prototype.toBeA = toBeA;
Expectation.prototype.toBeAn = toBeA;
function toBeA(constructor, message) {
  assert(typeof constructor === 'function', 'The constructor used in toBeA must be a function');

  message = message || util.inspect(this.actual) + ' is not a ' + (constructor.name || constructor.toString());
  assert(this.actual instanceof constructor, message);
}

Expectation.prototype.toMatch = toMatch;
function toMatch(pattern, message) {
  assert(util.isRegExp(pattern), 'The pattern used in toMatch must be a RegExp');

  message = message || util.inspect(this.actual) + ' does not match ' + util.inspect(pattern);
  assert(pattern.test(this.actual), message);
}

Expectation.prototype.toBeLessThan = toBeLessThan;
Expectation.prototype.toBeFewerThan = toBeLessThan;
function toBeLessThan(value, message) {
  message = message || util.inspect(this.actual) + ' is not less than ' + util.inspect(value);
  assert(this.actual < value, message);
}

Expectation.prototype.toBeGreaterThan = toBeGreaterThan;
Expectation.prototype.toBeMoreThan = toBeGreaterThan;
function toBeGreaterThan(value, message) {
  message = message || util.inspect(this.actual) + ' is not greater than ' + util.inspect(value);
  assert(this.actual > value, message);
}

Expectation.prototype.toInclude = toInclude;
Expectation.prototype.toContain = toInclude;
function toInclude(value, comparator, message) {
  assert(Array.isArray(this.actual), 'The actual value used in toContain/toInclude must be an Array');

  message = message || util.inspect(this.actual) + ' does not include ' + util.inspect(value);
  comparator = comparator || assert.deepEqual;
  assert(arrayContains(this.actual, comparator, value), message);
}

Expectation.prototype.toExclude = toExclude;
Expectation.prototype.toNotContain = toExclude;
function toExclude(value, comparator, message) {
  assert(Array.isArray(this.actual), 'The actual value used in toNotContain/toExclude must be an Array');

  message = message || util.inspect(this.actual) + ' includes ' + util.inspect(value);
  comparator = comparator || assert.deepEqual;
  assert(!arrayContains(this.actual, comparator, value), message);
}

/**
 * Returns true if the given array contains the value, false otherwise. The
 * comparator function must return false or throw to indicate a non-match.
 */
function arrayContains(array, comparator, value) {
  return array.some(function (item) {
    try {
      return comparator(item, value) !== false;
    } catch (e) {
      return false;
    }
  });
}
