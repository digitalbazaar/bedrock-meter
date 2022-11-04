/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {meters} from '@bedrock/meter';

describe('add mock meter (config.meter.addMockMeters)', () => {
  describe('get mock meter', () => {
    it('should get mock meter', async () => {
      const id = 'z19ygjQcNmQ9AbG7hCF39Kizs';
      const {meter} = await meters.get({id});
      should.exist(meter);
      meter.id.should.equal(id);
    });
  });
});
