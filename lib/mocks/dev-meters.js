import * as bedrock from 'bedrock';
import * as meters from '../meters.js';

const mockMeters = [{
  // stable multibase id
  id: 'zV2wZh7G61vwMPk2PVuSC1L',
  // default application id, from br-app-identity
  controller: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
  // default product id for Example WebKMS Product
  product: {id: 'urn:uuid:80a82316-e8c2-11eb-9570-10bf48838a29'},
  // default WebKMS id, from br-app-identity
  serviceId: 'did:key:z6MkwZ7AXrDpuVi5duY2qvVSx1tBkGmVnmRjDvvwzoVnAzC4'
}];

bedrock.events.on('bedrock-mongodb.ready', async () => {
  if(!bedrock.config.meter.seedMockData) {
    return;
  }

  for(const mockMeter of mockMeters) {
    try {
      await meters.insert({meter: mockMeter});
    } catch(e) {
      if(e.name === 'DuplicateError') {
        // ignore duplicate error
        return;
      }

      throw e;
    }
  }
});
