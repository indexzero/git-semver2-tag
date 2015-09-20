#!/usr/bin/env node

'use strict';

var exec = require('child_process').exec,
    async = require('async'),
    concat = require('concat-stream');

var isOld = /^v/;

/**
 * Lists all git tags for the current repository
 */
function listTags(done) {
  exec('git tag', function (err, stdout) {
    if (err) { return done(err); }
    var tags = stdout.split('\n').filter(Boolean);
    var types = { past: {}, current: {} };

    tags.forEach(function (tag) {
      var type = isOld.test(tag) ? 'past' : 'current';
      types[type][tag] = true;
    });

    done(null, types);
  });
}

/**
 * Generates all git commands based on the tags
 */
function allCommands(tags, done) {
  var local = { create: [], remove: [] };
  var remote = { create: [], remove: [] };

  Object.keys(tags.past).forEach(function (tag) {
    var current = tag.replace(isOld, '');

    if (tags.current[current]) {
      console.log('%s already exists');
    } else {
      local.create.push(['git', 'tag', current, tag].join(' '));
    }

    local.remove.push(['git', 'tag', '-d', tag].join(' '));
    remote.remove.push(['git', 'push', 'origin', ':refs/tags/' + tag].join(' '));
  });

  done(null, {
    local: local,
    remote: remote
  });
}

/**
 * Confirms that the following commands need be run
 */
function confirmAndRun(commands, done) {
  console.log(commands.local.create);
  console.log(commands.local.remove);
  console.log(commands.remote.create);
  console.log(commands.remote.remove);
  done();
}

/**
 * Runs all the `series` of commands.
 */
function runCommands(series, done) {
  async.forEachSeries(series, function execOne(cmd, next) {
    console.log('Executing %s', cmd);
    if (!process.env.DRY) {

    }

    next();
  }, done);
}

async.waterfall([
  listTags,
  allCommands,
  confirmAndRun
], function () {
  console.log(arguments);
});
