# bedrock-meter ChangeLog

## 4.0.0 - 2022-06-21

### Changed
- **BREAKING**: Require Node.js >=16.
- Update dependencies and remove unused test dependencies.
- Lint module.
- Use `package.json` `files` field.

## 3.0.0 - 2022-04-29

### Changed
- **BREAKING**: Update peer deps:
  - `@bedrock/core@6`
  - `@bedrock/mongodb@10`.

## 2.0.0 - 2022-04-05

### Changed
- **BREAKING**: Rename package to `@bedrock/meter`.
- **BREAKING**: Convert to module (ESM).
- **BREAKING**: Remove default export.
- **BREAKING**: Require node 14.x.

## 1.3.0 - 2021-01-21

### Added
- Add additional tests.

### Fixed
- Disable esm cache for coverage testing.

## 1.2.0 - 2021-11-29

### Added
- Add optional `explain` param to get more details about database performance.
- Add database tests in order to check database performance.

## 1.1.0 - 2021-09-14

### Added
- Add `config.meter.addMockMeters` which allows for mock meter(s) to be used
  for development.

## 1.0.0 - 2021-07-22

### Added
- Add core files.
- See git history for changes.
