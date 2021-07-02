const bedrock = require('bedrock');
const {meters} = require('bedrock-meter');

let _insertHandlerCount;
let _removeHandlerCount;
let _useHandlerCount;
function _clearTestHandlerCounts() {
  _insertHandlerCount = 0;
  _removeHandlerCount = 0;
  _useHandlerCount = 0;
}
function _setupTestHandlers() {
  meters.setInsertHandler({
    handler: () => {
      _insertHandlerCount++;
    }
  });
  meters.setRemoveHandler({
    handler: () => {
      _removeHandlerCount++;
    }
  });
  meters.setUseHandler({
    handler: () => {
      _useHandlerCount++;
    }
  });
}

// setup test handlers.
//
// meter lib requires these are setup on bedrock.start.
// if not set the lib will throw an error.
bedrock.events.on('bedrock.init', async () => {
  // FIXME: not called.  lib start checks not tested.
  console.log('METER TEST BEDROCK.INIT');
  _setupTestHandlers();
  _clearTestHandlerCounts();
});

describe('meters', () => {
  describe('setHandler', () => {
    beforeEach(async () => {
      // handler checking requires internals manipulation
      meters._resetHandlers();
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
      meters._resetHandlers();
      _setupTestHandlers();
      _clearTestHandlerCounts();
    });
    it('insert - basic', async () => {
      const record = await meters.insert();
      should.exist(record);
      // FIXME: check result
      _insertHandlerCount.should.equal(1);
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
      meters._resetHandlers();
      _setupTestHandlers();
      _clearTestHandlerCounts();
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
      meters._resetHandlers();
      _setupTestHandlers();
      _clearTestHandlerCounts();
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
      _removeHandlerCount.should.equal(1);
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
