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
  meters.setHandler({
    name: 'insert',
    handler: () => {
      _insertHandlerCount++;
    }
  });
  meters.setHandler({
    name: 'remove',
    handler: () => {
      _removeHandlerCount++;
    }
  });
  meters.setHandler({
    name: 'use',
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
    it('setHandler insert', async () => {
      meters.setHandler({name: 'insert', handler: _h});
    });
    it('setHandler remove', async () => {
      meters.setHandler({name: 'remove', handler: _h});
    });
    it('setHandler use', async () => {
      meters.setHandler({name: 'use', handler: _h});
    });
    it('setHandler unknown', async () => {
      let err;
      try {
        meters.setHandler({name: 'bogus', handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('SetHandlerError');
    });
    it('setHandler without function', async () => {
      let err;
      try {
        meters.setHandler({name: 'insert', handler: null});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('SetHandlerError');
    });
    it('setHandler insert twice', async () => {
      meters.setHandler({name: 'insert', handler: _h});
      let err;
      try {
        meters.setHandler({name: 'insert', handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('SetHandlerError');
    });
    it('setHandler remove twice', async () => {
      meters.setHandler({name: 'remove', handler: _h});
      let err;
      try {
        meters.setHandler({name: 'remove', handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('SetHandlerError');
    });
    it('setHandler use twice', async () => {
      meters.setHandler({name: 'use', handler: _h});
      let err;
      try {
        meters.setHandler({name: 'use', handler: _h});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('SetHandlerError');
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
