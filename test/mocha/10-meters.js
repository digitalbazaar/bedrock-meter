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

  describe.skip('use', () => {
    it('use', async () => {
    });
  });
});
