/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {meters} = require('bedrock-meter');
const {clearHandlers, resetCountHandlers, HANDLER_COUNTS} =
  require('./helpers');

describe('meters', () => {
  describe('setHandler', () => {
    beforeEach(async () => {
      clearHandlers();
    });
    // empty handler
    const _h = () => {};
    it('setInsertHandler', async () => {
      meters.setInsertHandler({handler: _h});
    });
    it('setRemoveHandler', async () => {
      meters.setRemoveHandler({handler: _h});
    });
    it('setUseHandler', async () => {
      meters.setUseHandler({handler: _h});
    });
    it('setInsertHandler without function', async () => {
      let err;
      try {
        meters.setInsertHandler({handler: null});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('AssertionError');
    });
    it('setRemoveHandler without function', async () => {
      let err;
      try {
        meters.setRemoveHandler({handler: null});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('AssertionError');
    });
    it('setUseHandler without function', async () => {
      let err;
      try {
        meters.setUseHandler({handler: null});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('AssertionError');
    });
    it('setInsertHandler twice', async () => {
      meters.setInsertHandler({handler: _h});
      let err;
      try {
        meters.setInsertHandler({handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('DuplicateError');
    });
    it('setRemoveHandler twice', async () => {
      meters.setRemoveHandler({handler: _h});
      let err;
      try {
        meters.setRemoveHandler({handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('DuplicateError');
    });
    it('setUseHandler twice', async () => {
      meters.setUseHandler({handler: _h});
      let err;
      try {
        meters.setUseHandler({handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('DuplicateError');
    });
  });

  describe('insert', () => {
    beforeEach(async () => {
      resetCountHandlers();
    });
    it('insert - basic', async () => {
      const record = await meters.insert();
      should.exist(record);
      // FIXME: check result
      HANDLER_COUNTS.insert.should.equal(1);
    });
  });

  describe('get', () => {
    it('get', async () => {
      // insert - get - check
      const _insert = await meters.insert();
      //console.log('MI', _insert);
      const _get = await meters.get({meterId: _insert.meter.id});
      //console.log('MG', _get);
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
    });
  });

  describe('update', () => {
    before(() => {
      resetCountHandlers();
    });
    it('update - none', async () => {
      // insert - get - update - get
      const _insert = await meters.insert();
      const _get = await meters.get({meterId: _insert.meter.id});
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
      await meters.update({meter: _get.meter});
      const _get2 = await meters.get({meterId: _insert.meter.id});
      should.exist(_get2);
      _get2.meter.id.should.equal(_insert.meter.id);
      // check updated and meters equal
      _get2.meta.updated.should.be.above(_get.meta.updated);
      _get.meter.should.deep.equal(_get2.meter);
    });
    it('update - controller', async () => {
      // insert - get - update - get
      const _insert = await meters.insert();
      const _get = await meters.get({meterId: _insert.meter.id});
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
      // updated meter
      const meter2 = {
        ..._get.meter,
        controller: 'c2'
      };
      await meters.update({meter: meter2});
      const _get2 = await meters.get({meterId: _insert.meter.id});
      should.exist(_get2);
      _get2.meter.id.should.equal(_insert.meter.id);
      // check updated and meters equal
      _get2.meta.updated.should.be.above(_get.meta.updated);
      _get2.meter.should.not.deep.equal(_get.meter);
      _get2.meter.controller.should.equal('c2');
    });
  });

  describe('remove', () => {
    beforeEach(async () => {
      resetCountHandlers();
    });
    it('check removed', async () => {
      // insert - get - remove - get
      const _insert = await meters.insert();
      //console.log('MI', _insert);
      const _get = await meters.get({meterId: _insert.meter.id});
      //console.log('MG', _get);
      should.exist(_get);
      _get.meter.id.should.equal(_insert.meter.id);
      await meters.remove({meterId: _insert.meter.id});
      HANDLER_COUNTS.remove.should.equal(1);
      // check removed
      let err;
      try {
        await meters.get({meterId: _insert.meter.id});
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
