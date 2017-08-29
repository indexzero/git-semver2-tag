'use strict';

const { exec } = require('child_process');
const async = require('async');

/**
 * Runs all the `series` of commands.
 */
exports.runCommands = function runCommands(msg, series, done) {
  console.log(msg);
  async.forEachSeries(series, function execOne(cmd, next) {
    console.log('%s', cmd);
    if (!process.env.DRY) {
      return exec(cmd, next);
    }

    next();
  }, done);
}

/**
 * Pushes git tags respecting DRY runs.
 */
exports.pushTags = function pushTags(done) {
  console.log('\n## Adding new remote tags');
  var cmd = 'git push --tags';
  console.log('Executing %s\n', cmd);
  if (!process.env.DRY) {
    return exec(cmd, done);
  }

  setImmediate(done);
}
