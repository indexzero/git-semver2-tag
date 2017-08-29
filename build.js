#!/usr/bin/env node

const { execFile } = require('child_process');
const async = require('async');
const diagnostics = require('diagnostics');
const { runCommands, pushTags } = require('./run');

const isMaxBuffer = /maxBuffer exceeded/;
const isVersionBump = /^\+  "version": "([^"]+)"/;
const debug = {
  ver: diagnostics('git-semver2-tag:ver'),
  skip: diagnostics('git-semver2-tag:skip')
};

/**
 * Lists all git tags for the current repository
 */
function listTags(done) {
  execFile('git', ['tag'], function (err, stdout) {
    if (err) { return done(err); }
    done(null, stdout.split('\n').filter(Boolean));
  });
}

/**
 * List all SHAs that may have a potential version. That is:
 * all SHAs where package.json was changes.
 */
function listPotentialVersionShas(done) {
  execFile('git', ['--no-pager', 'log', '--format=format:%H', 'package.json'], function (err, stdout) {
    if (err) { return done(err); }
    done(null, stdout.split('\n'));
  });
}

/**
 * Get the version the specified SHA represents if it exists
 * by looking for a line in the diff of the form:
 *
 * +  "version": "4.5.1"
 * -  "version": "4.5.0"
 *
 */
function getShaVersion(sha, done) {
  execFile('git', ['show', sha], function (err, stdout) {
    if (err) {
      if (isMaxBuffer.test(err.message)) {
        debug.skip('Ignored error %s for: %s', err.message, sha);
        return done();
      }

      return done(err);
    }

    const versionLine = stdout.split('\n')
      .find(line => isVersionBump.test(line))

    if (!versionLine) {
      debug.skip('No version bump in SHA: %s', sha);
      return done();
    }

    const [, version] = isVersionBump.exec(versionLine);
    debug.ver('Found version %s in %s %s', version, sha, versionLine);
    done(null, {
      version,
      line: versionLine,
      stdout,
      sha
    });
  });
}

/**
 * Filters the specified information in the `repo` for only missing
 * versions.
 */
function filterMissingVersions(repo, done) {
  async.mapLimit(repo.shas, 20, getShaVersion, function (err, versions) {
    if (err) { throw err; }

    const tagLookup = repo.tags.reduce((acc, tag) => {
      acc[tag] = true;
      return acc;
    }, {});

    versions = versions.filter(ver => {
      if (!ver) { return; }
      if (tagLookup[ver.version]) {
        console.log('Skipping existing version: %s', ver.version);
        return false;
      }

      return true;
    });

    console.log('\n## Found missing git tags \n[\n%s\n]', versions.map(v => `  ${v.version}`).join(',\n'));
    done(null, versions);
  });
}

function createGitTags(versions, done) {
  const commands = versions.map(ver => {
    return `git tag -a '${ver.version}' -m 'Version ${ver.version}' ${ver.sha}`;
  });

  runCommands('\n## Creating git tags', commands, err => {
    if (err) { return done(err) }
    pushTags(done);
  });
}

console.log('## Reading package.json git history')
async.parallel({
  shas: listPotentialVersionShas,
  tags: listTags
}, function (err, repo) {
  if (err) { throw err; }

  async.waterfall([
    async.apply(filterMissingVersions, repo),
    createGitTags
  ], err => {
    if (err) { throw err; }
    console.log('Historical git tags created');
  })
});
