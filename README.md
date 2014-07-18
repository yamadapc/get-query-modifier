get-query-modifier
==================
[![Build Status](https://travis-ci.org/yamadapc/get-query-modifier.svg?branch=master)](https://travis-ci.org/yamadapc/get-query-modifier)
[![Coverage Status](https://coveralls.io/repos/yamadapc/get-query-modifier/badge.png)](https://coveralls.io/r/yamadapc/get-query-modifier)
[![devDependency Status](https://david-dm.org/yamadapc/get-query-modifier/dev-status.svg)](https://david-dm.org/yamadapc/get-query-modifier#info=devDependencies)

- - -

Helper for parsing mongoose mongodb query operators.

## getQueryModifier(query, [options])

Manipulates an object representation of a querystring, extracting its
`mongoose` query operators and returning a function to attach them to a
`mongoose.Query` object.

Note this function isn't pure and does delete the operators from the `query`
parameter after reading them.

### Params:

* **Object** *query* The querystring representation to manipulate
* **Object** *[options]* An options object
* **Object** *[options.ignore]* An object with the properties corresponding to
  the ignored operators set to true
* **Boolean** *[options.deleteIgnored=false]* Whether to delete the ignored
  operators from the `query` object
* **Array.<String>** *[options.allow]* An array of operators to parse regardless
  of the plugin's default `VALID_OPERATORS.`

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

See the test for more elaborate examples.

## License

This code is licensed under the MIT License. See LICENSE for more information.
