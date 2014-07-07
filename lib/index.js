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

function getQueryModifier(query) {
  var limit  = query.$limit,
      sort   = query.$sort,
      page   = query.$page,
      skip   = query.$skip,
      select = query.$select;

  delete query.$limit;
  delete query.$sort;
  delete query.$page;
  delete query.$skip;
  delete query.$select;

  return function queryModifier(query) {
    if(!isUndefined(page)) {
      if(!limit) {
        limit = 20;
      }
      query = query.skip(page * limit);
    }
    if(!isUndefined(limit)) {
      query = query.limit(limit);
    }
    if(!isUndefined(sort)) {
      query = query.sort(sort);
    }
    if(!isUndefined(skip)) {
      query = query.skip(skip);
    }
    if(!isUndefined(select)) {
      if(Array.isArray(select)) select = select.join(' ');
      query = query.select(select);
    }
    return query;
  };
}

/**
 * Returns true if a value is undefined.
 * @param {Mixed} value The value to test
 * @return {Boolean} Whether this value is undefined
 */

function isUndefined(value) {
  return typeof value === 'undefined';
}
