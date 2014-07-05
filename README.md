get-query-modifier
==================

Helper for parsing mongoose mongodb query operators.

## getQueryModifier(query)

Manipulates an object representation of a querystring, extracting its
`mongoose` query operators and returning a function to attach them to a
`mongoose.Query` object.

Note this function isn't pure and does delete the operators from the `query`
parameter after reading them.

### Params: 

* **Object** *query* The querystring representation to manipulate

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

## License

This code is licensed under the MIT License. See LICENSE for more information.
