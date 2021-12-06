/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {util: {delay}} = require('bedrock');
const {meters} = require('bedrock-meter');
const bnid = require('bnid');

describe('meters', () => {
  describe('insert', () => {
    it('insert', async () => {
      const meter = {id: await bnid.generateId()};
      const record = await meters.insert({meter});
      should.exist(record);
    });
    it('should throw duplicate error when inserting same meter id again',
      async () => {
        const meter = {id: 'zEAU7Z1nZYkscF1TBiYFpig'};
        // insert meter
        const record = await meters.insert({meter});
        should.exist(record);

        let err;
        let record2;
        try {
          // try inserting same meter id again
          record2 = await meters.insert({meter});
        } catch(e) {
          err = e;
        }
        should.exist(err);
        should.not.exist(record2);
        err.name.should.equal('DuplicateError');
        err.message.should.equal('Duplicate meter.');
        err.details.httpStatusCode.should.equal(409);
      });
  });

  describe('get', () => {
    it('get', async () => {
      // insert - get - check
      const meter = {id: await bnid.generateId()};
      const _insert = await meters.insert({meter});
      const _get = await meters.get({id: _insert.meter.id});
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
    });
  });

  describe('update', () => {
    it('update - none', async () => {
      // insert - get - update - get
      const meter = {id: await bnid.generateId()};
      const _insert = await meters.insert({meter});
      const _get = await meters.get({id: _insert.meter.id});
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
      // wait to ensure new record time
      await delay(1);
      _get.meter.sequence++;
      await meters.update({meter: _get.meter});
      const _get2 = await meters.get({id: _insert.meter.id});
      should.exist(_get2);
      _get2.meter.id.should.equal(_insert.meter.id);
      // check updated and meters equal
      _get2.meta.updated.should.be.above(_get.meta.updated);
      _get.meter.should.deep.equal(_get2.meter);
    });
    it('update - controller', async () => {
      // insert - get - update - get
      const meter = {id: await bnid.generateId()};
      const _insert = await meters.insert({meter});
      const _get = await meters.get({id: _insert.meter.id});
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
      // updated meter
      const meter2 = {
        ..._get.meter,
        sequence: _get.meter.sequence + 1,
        controller: 'c2'
      };
      // wait to ensure new record time
      await delay(1);
      await meters.update({meter: meter2});
      const _get2 = await meters.get({id: _insert.meter.id});
      should.exist(_get2);
      _get2.meter.id.should.equal(_insert.meter.id);
      // check updated and meters equal
      _get2.meta.updated.should.be.above(_get.meta.updated);
      _get2.meter.should.not.deep.equal(_get.meter);
      _get2.meter.controller.should.equal('c2');
    });
    it('should throw error when updating meter that does not exist in database',
      async () => {
        const meterNotInDB = 'zH2TzRv5Qs9SsngkYSWuU1x';
        const meter = {id: meterNotInDB, sequence: 0};

        let err;
        let res;
        try {
          res = await meters.update({meter});
        } catch(e) {
          err = e;
        }
        should.exist(err);
        should.not.exist(res);
        err.name.should.equal('InvalidStateError');
        err.message.should.equal('Could not update configuration. ' +
          'Record sequence does not match or meter does not exist.');
        err.details.httpStatusCode.should.equal(409);
      });
  });

  describe('remove', () => {
    it('check removed', async () => {
      // insert - get - remove - get
      const meter = {id: await bnid.generateId()};
      const _insert = await meters.insert({meter});
      const _get = await meters.get({id: _insert.meter.id});
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
      await meters.remove({id: _insert.meter.id});
      // check removed
      let err;
      try {
        await meters.get({id: _insert.meter.id});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('NotFoundError');
    });
  });

  describe('use', () => {
    it('should throw error if "meter" param is not passed', async () => {
      let err;
      let res;
      try {
        res = await meters.use({});
      } catch(e) {
        err = e;
      }
      should.not.exist(res);
      should.exist(err);
      err.name.should.equal('AssertionError');
      err.message.should.equal('meter (object) is required');
    });
    it('should throw error if "newUsage" param is not passed', async () => {
      let err;
      let res;
      const meter = {id: 'zEAU7Z1nZYkscF1TBiYFpig'};
      try {
        res = await meters.use({meter});
      } catch(e) {
        err = e;
      }
      should.not.exist(res);
      should.exist(err);
      err.name.should.equal('AssertionError');
      err.message.should.equal('newUsage (object) is required');
    });
    it('should throw error if "newUsage.storage" is not a number', async () => {
      let err;
      let res;
      const meter = {id: 'zEAU7Z1nZYkscF1TBiYFpig'};
      const newUsage = {
        storage: 'NOT-A-NUMBER'
      };
      try {
        res = await meters.use({meter, newUsage});
      } catch(e) {
        err = e;
      }
      should.not.exist(res);
      should.exist(err);
      err.name.should.equal('AssertionError');
      err.message.should.equal('newUsage.storage (number) is required');
    });
    it('should throw error if "newUsage.operations" is not a number',
      async () => {
        let err;
        let res;
        const meter = {id: 'zEAU7Z1nZYkscF1TBiYFpig'};
        const newUsage = {
          storage: 1,
          operations: 'NOT-A-NUMBER'
        };
        try {
          res = await meters.use({meter, newUsage});
        } catch(e) {
          err = e;
        }
        should.not.exist(res);
        should.exist(err);
        err.name.should.equal('AssertionError');
        err.message.should.equal('newUsage.operations (number) is required');
      });
  });
});
