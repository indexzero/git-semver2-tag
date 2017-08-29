#!/usr/bin/env node

'use strict';

const { exec } = require('child_process');
const async = require('async');
const { runCommands, pushTags } = require('./run');

const isOld = /^v/;

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
      console.log('%s already exists for %s', current, tag);
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
  var hasCommands = !!(
    commands.local.create.length,
    commands.local.remove.length,
    commands.remote.remove.length
  );

  async.series([
    async.apply(runCommands, '## Renaming local tags', commands.local.create),
    async.apply(runCommands, '\n## Removing old tags', commands.local.remove),
    async.apply(runCommands, '\n## Removing remote tags', commands.remote.remove),
    function (next) {
      if (!hasCommands) {
        console.log('git tags are already semver@2.0.0 compliant');
        return done(null, true);
      }

      pushTags(next);
    }
  ], done);
}

async.waterfall([
  listTags,
  allCommands,
  confirmAndRun
], function (err, noop) {
  if (err) {
    throw err;
  } else if (process.env.DRY) {
    console.log('DRY run completed. No git commands run.');
  } else if (!noop) {
    console.log('Local and origin git tags are now semver@2.0.0 compliant.');
  }
});
