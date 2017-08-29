# git-semver2-tag

Upgrades any semver 1.0 tags to semver 2.0. e.g. "v1.0.0" becomes "1.0.0".

## Installation

```
npm install -g git-semver2-tag
```

## Usage

By setting the `DRY` flag this CLI tool will not perform any operations against `git`. This way you can see what `git` commands it will run.

If you are satisfied with the `git` commands it is going to run then simply run it without the DRY flag.

### `git-semver2-tag`

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

### `git-create-semver2-tags`

```
$ git-create-semver2-tags
## Reading package.json git history
Skipping existing version: 4.1.1
Skipping existing version: 4.1.0
Skipping existing version: 4.0.1
Skipping existing version: 4.0.0
Skipping existing version: 2.0.2
Skipping existing version: 2.0.1
Skipping existing version: 2.0.0
Skipping existing version: 1.0.4
Skipping existing version: 1.0.3
Skipping existing version: 1.0.2
Skipping existing version: 1.0.1
Skipping existing version: 1.0.0

## Found missing git tags 

[
  3.1.3,
  3.1.2,
  3.1.1,
  3.1.0,
  3.0.1,
  3.0.0,
  2.0.5
]

## Creating git tags
git tag -a '3.1.3' -m 'Version 3.1.3' 0378b130c9e2302dbdc1281a03a1c074
git tag -a '3.1.2' -m 'Version 3.1.2' a121befa10141045db7fc48fff99afc1
git tag -a '3.1.1' -m 'Version 3.1.1' b384df81d6351ea010f4335667ce7757
git tag -a '3.1.0' -m 'Version 3.1.0' d950526c994785645eb64cce8ab5f741
git tag -a '3.0.1' -m 'Version 3.0.1' 6de8ccb4c4524a934f64f662dfeee9c1
git tag -a '3.0.0' -m 'Version 3.0.0' 035cadf1487114a132c3ef7650044cd1
git tag -a '2.0.5' -m 'Version 2.0.5' 3cd7a0db76ff9dca48979e24c39b408c

## Adding new remote tags
Executing git push --tags

DRY run completed. No git commands run.
```

#### LICENSE: MIT
