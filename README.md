# git-semver2-tag

Upgrades any semver 1.0 tags to semver 2.0. e.g. "v1.0.0" becomes "1.0.0".

## Installation

```
npm install -g git-semver2-tag
```

## Usage

By setting the `DRY` flag this CLI tool will not perform any operations against `git`. This way you can see what `git` commands it will run.

```
DRY=yes git-semver2-tag
## Renaming local tags
git tag 0.1.0 v0.1.0
git tag 0.1.1 v0.1.1

## Removing old tags
git tag -d v0.1.0
git tag -d v0.1.1

## Removing remote tags
git push origin :refs/tags/v0.1.0
git push origin :refs/tags/v0.1.1

## Adding new remote tags
Executing git push --tags

DRY run completed. No git commands run.
```

If you are satisfied with the `git` commands it is going to run then simply run it without the DRY flag.

```
git-semver2-tag
```

#### LICENSE: MIT
