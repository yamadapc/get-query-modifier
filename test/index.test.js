'use strict'; /* global describe, it */
var assert = require('assert');
var getQueryModifier = require('..');

describe('getQueryModifier(query)', function() {
  it('doesn\'t do anything if query hasn\'t got any operators', function() {
    var q = {
      something: 'here'
    };

    var modifier = getQueryModifier(q);

    var query = {}; // will throw if any operator was recognized
    modifier(query);

    assert.deepEqual(q, {
      something: 'here'
    });
  });

  it('extracts `$limit` operators', function() {
    var q = {
      $limit: 10
    };

    var modifier = getQueryModifier(q);

    var calledWith;
    var query = { limit: function(l) { calledWith = l; return this; } };
    modifier(query);

    assert(calledWith === 10);
    assert(q.$limit === undefined);
  });

  it('extracts `$page` operators, defaulting `$limit` to 20', function() {
    var q = {
      $page: 2
    };

    var modifier = getQueryModifier(q);
    var skipped, limited;
    var query = {
      skip: function(s) { skipped = s; return this; },
      limit: function(l) { limited = l; return this; }
    };
    modifier(query);

    assert(skipped === 40, 'skipped 40');
    assert(limited === 20, 'limitted 20');
    assert(q.$skip === undefined, 'deleted query.$skip');
    assert(q.$page === undefined, 'deleted query.$page');
    assert(q.$limit === undefined, 'deleted query.$limit');
  });

  it('extracts `$select` operators, joining them if they are an array', function() {
    var q1 = {
      $select: 'something'
    };

    var modifier1 = getQueryModifier(q1);
    var selected1;
    var query1 = { select: function(s) { selected1 = s; return this; } };
    modifier1(query1);

    assert(selected1 === 'something');
    assert(q1.$select === undefined);

    var q2 = {
      $select: [ 'here', 'we', 'are' ]
    };

    var modifier2 = getQueryModifier(q2);
    var selected2;
    var query2 = { select: function(s) { selected2 = s; return this; } };
    modifier2(query2);

    assert(selected2 === 'here we are');
    assert(q2.$select === undefined);
  });

  it('accepts an `options.ignore` parameter with operators to ignore', function() {
    var q = {
      $select: '+something -here',
      $skip: 10
    };

    var modifier = getQueryModifier(q, { ignore: { $select: true } });

    assert(q.$skip === undefined, 'deleted query.$skip');
    assert(q.$select === '+something -here', 'ignored query.$select');

    var skipped;
    var query = {
      select: function() { throw new Error('Selected'); },
      skip: function(s) { skipped = s; return this; }
    };

    modifier(query);
    assert(skipped === 10);
  });

  it('accepts an `options.allow` parameter with operators to allow forcefully', function() {
    var q = {
      $custom: 'muhahah',
      $limit: 10
    };

    var modifier = getQueryModifier(q, { allow: ['$custom'] });
    assert(q.$custom === undefined, 'deleted query.$custom');
    assert(q.$limit === undefined, 'deleted query.$limit');

    var customed;
    var limited;
    var query = {
      custom: function(c) { customed = c; return this; },
      limit: function(l) { limited = l; return this; }
    };

    modifier(query);
    assert(limited === 10, 'limited');
    assert(customed === 'muhahah', '"customed"');
  });
});
