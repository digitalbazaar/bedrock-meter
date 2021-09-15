/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {meters} = require('bedrock-meter');

describe('add mock meter (config.meter.addMockMeters)', () => {
  describe('get mock meter', () => {
    it('should get mock meter', async () => {
      const id = 'zV2wZh7G61vwMPk2PVuSC1L';
      const {meter} = await meters.get({id});
      should.exist(meter);
      meter.id.should.equal(id);
    });
  });
});
