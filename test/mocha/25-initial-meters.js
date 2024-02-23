/*!
 * Copyright (c) 2021-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {meters} from '@bedrock/meter';

describe('Initial Meters Config', function() {
  it('meters in initialMeters should exist', async () => {
    const id = 'z1A2E8GAQazt1FTTp8jYJ28Jt';
    const {meter} = await meters.get({id});
    should.exist(meter);
    meter.id.should.equal(id);
  });
});
