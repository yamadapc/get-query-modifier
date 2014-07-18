'use strict';
exports = module.exports = getQueryModifier;
/**
 * Manipulates an object representation of a querystring, extracting its
 * `mongoose` query operators and returning a function to attach them to a
 * `mongoose.Query` object.
 *
 * Note this function isn't pure and does delete the operators from the `query`
 * parameter after reading them.
 *
 * @param {Object} query The querystring representation to manipulate
 * @param {Object} [options] An options object
 * @param {Object} [options.ignore] An object with the keys corresponding of the
 * operators to ignore set to true
 * @param {Array.<String>} [options.allow] An array of operators to parse
 * regardless of the plugin's default VALID_OPERATORS.
 * @return {Function} queryModifier The `mongoose.Query` modifier function,
 * which attaches the operators to the search
 *
 * @example
 * ```javascript
 * var app = require('./app'); // some express app
 * var mongoose = require('mongoose');
 * var User = mongoose.model('User'); // some mongoose model
 *
 * app.get('/api/users', function(req, res) {
 *   var modifier = getQueryModifier(req.query);
 *   var query = modifier(User.find(req.query).lean());
 *
 *   query.exec(function(err, results) {
 *     // use the results...
 *   });
 * });
 * ```
 */

function getQueryModifier(query, options) {
  if(!query) return identity;
  if(!options) options = {};
  if(!options.ignore) options.ignore = {};
  if(!options.allow) options.allow = [];

  var operators = {};
  var validOperators = VALID_OPERATORS.concat(options.allow);

  for(var i = 0, len = validOperators.length; i < len; i++) {
    var operator = validOperators[i];
    if(options.ignore[operator]) continue;
    operators[operator] = query[operator];
    delete query[operator];
  }

  return function queryModifier(query) {
    if(operators.$sort) {
      query = query.sort(operators.$sort);
    }
    if(operators.$skip) {
      query = query.skip(operators.$skip);
    }
    if(operators.$page) {
      if(!operators.$limit) {
        operators.$limit = 20;
      }
      query = query.skip(operators.$page * operators.$limit);
    }
    if(operators.$limit) {
      query = query.limit(operators.$limit);
    }
    if(operators.$select) {
      if(Array.isArray(operators.$select)) {
        operators.$select = operators.$select.join(' ');
      }
      query = query.select(operators.$select);
    }

    // Support custom operators
    if(options.allow) {
      for(var i = 0, len = options.allow.length; i < len; i++) {
        var operator = options.allow[i];
        var value = operators[operator];
        if(!value) continue;

        var methodName = operator.slice(1);
        if(!query[methodName]) throw new Error('Invalid operator ' + operator);

        var ret = query[methodName](value);
        if(ret) query = ret;
      }
    }

    return query;
  };
}

function identity(x) {
  return x;
}

var VALID_OPERATORS = exports.VALID_OPERATORS = [
  '$limit',
  '$sort',
  '$page',
  '$skip',
  '$select'
];
