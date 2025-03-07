# bedrock-meter ChangeLog

## 6.0.0 - 2025-03-07

### Changed
- Update peer dependencies.
  - `@bedrock/core@6.3.0`.
  - **BREAKING**: `@bedrock/mongodb@11`.
    - Use MongoDB driver 6.x and update error names and details.
    - See changelog for details.
- Update dev dependencies.
- Update test dependencies.

## 5.3.2 - 2025-03-04

### Fixed
- Do not pass `writeOptions` in database calls.

## 5.3.1 - 2025-03-04

### Fixed
- Return passed `record` instead of resulting record from mongodb calls to
  enable using newer mongodb driver.
- Use `result.modifiedCount` to enable newer mongodb driver.
- Remove unused `background` option from mongodb index creation.

## 5.3.0 - 2024-02-24

### Added
- Add a config variable `meter.initialMeters`. This array may contain one or
  more meters that will be inserted on startup.

## 5.2.1 - 2023-08-17

### Fixed
- Change `return` to `continue` when getting a duplicate error adding
  mock meters. Prior to this fix, some of the mock meters may not be
  properly created.

## 5.2.0 - 2023-07-17

### Added
- Add a private mock meter that can be used for development in private
  application repositories.

## 5.1.1 - 2022-11-16

### Fixed
- Ensure invalid meter IDs are surfaced as not found errors with
  a cause of invalid meter ID.

## 5.1.0 - 2022-11-16

### Changed
- Improve invalid meter ID errors.

## 5.0.0 - 2022-11-04

### Changed
- **BREAKING**: Use multihash (identity hash ID) when encoding
  meter IDs to ensure size is encoded / self-describing. No existing meters
  from previous versions will be compatible with this release.

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
