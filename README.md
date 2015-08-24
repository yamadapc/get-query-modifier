get-query-modifier
==================
[![Build Status](https://travis-ci.org/yamadapc/get-query-modifier.svg?branch=master)](https://travis-ci.org/yamadapc/get-query-modifier)
[![Coverage Status](https://coveralls.io/repos/yamadapc/get-query-modifier/badge.png)](https://coveralls.io/r/yamadapc/get-query-modifier)
[![devDependency Status](https://david-dm.org/yamadapc/get-query-modifier/dev-status.svg)](https://david-dm.org/yamadapc/get-query-modifier#info=devDependencies)
[![npm downloads per month](http://img.shields.io/npm/dm/get-query-modifier.svg)](https://www.npmjs.org/package/get-query-modifier)

- - -

Helper for parsing mongoose mongodb query operators.

## What is this?

**get-query-modifier** is a module designed to help with mongoose query parsing.
Let's say you have a `GET /api/comments` endpoint, in your API like the
following:

```javascript
app.get('/api/comments', function(req, res) {
  Comment
    .find()
    .lean()
    .exec(function(err, comments) {
      if(err) res.json(err.status || 500, { error: err.message });
      else res.json({ comments: comments });
    });
});
```

Suddenly, you decided to add pagination to this route. You could easily
implement calls with mongoose's `Query.prototype.limit` and
`Query.prototype.skip`, as follows:

```javascript
app.get('/api/comments', function(req, res) {
  Comment
    .find()
    .skip(req.query.page * req.query.items_per_page)
    .limit(req.query.items_per_page)
    .exec(/**/);
});
```

Or something like that.

You'd be, however, recreating your own query syntax.

You can get a **lot** more power by using mongodb's default query syntax,
extending it where mongoose/mongodb expose a slightly different API, such
as `.limit`, `.skip` etc.

**get-query-modifier** solves this solution by extracting the _operators_
`$sort`, `$limit`, `$skip`, `$page` and `$select` (plus any operator you want to
support by setting `options.allow`), and translating them into a set of method
calls to the query object (calls to `Query.prototype.sort`,
`Query.prototype.select` etc.). This allows maximum flexibility for using both
the `req.query` object for further querying in the mongoose API and supporting a
known standard set of operators, which come out-of-the-box in mongodb.

It does it by taking the query object as its first argument and returning a
modifier function, which handles calling each of these deferred `Query` method
calls once your `Query` instance is available.

```javascript
app.get('/api/comments', function(req, res) {
  var modifier = getQueryModifier(req.query);
  // `req.query` had its `$limit`, `$sort`, `$page`, `$skip` and `$select`
  // fields striped from it and translated into a set of method calls in
  // `modifier`

  var query = Comment
    .find(req.query) // we can create an arbitrary Query, re-using `req.query`
    .lean();

  modifier(query) // modifier applies the extracted operators to the Query
    .exec(/**/);
});
```

## getQueryModifier(query, [options])

Manipulates an object representation of a querystring, extracting its
`mongoose` query operators and returning a function to attach them to a
`mongoose.Query` object.

Note this function isn't pure and does delete the operators from the `query`
parameter after reading them.

### Params:

* **Object** *query* The querystring representation to manipulate
* **Object** *[options]* An options object
* **Object** *[options.defaults]* An object with defaults for the valid
  operators
* **Object** *[options.ignore]* An object with the properties corresponding to
  the ignored operators set to true
* **Boolean** *[options.deleteIgnored=false]* Whether to delete the ignored
  operators from the `query` object
* **Array.<String>** *[options.allow]* An array of operators to parse in
  addition to the plugin's default `VALID_OPERATORS.`

### Return:

* **Function** queryModifier The `mongoose.Query` modifier function, which
  attaches the operators to the search

### Example:

```javascript
var app = require('./app'); // some express app
var mongoose = require('mongoose');
var User = mongoose.model('User'); // some mongoose model

app.get('/api/users', function(req, res) {
  var modifier = getQueryModifier(req.query);
  var query = modifier(User.find(req.query).lean());

  query.exec(function(err, results) {
    // use the results...
  });
});
```

See the tests for more elaborate examples.

## getQueryModifier.middleware([options])

A connect middleware for parsing and using mongodb query operators with
mongoose given an object representation of a query.

### Params:

* **Object** *[options]* An options object which will simply be passed onto
  `getQueryModifier(req.query, options)`

### Return:

* **Function** mdw The middleware function

### Example:

```javascript
var app = require('./app'); // some express app
app.use(getQueryModifier.middleware());
```

## License

This code is licensed under the MIT License. See LICENSE for more information.
