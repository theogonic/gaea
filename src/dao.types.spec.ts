import { emptyUUID } from '../utils/id';
import { AbstractGenericObject, GenericObjectStatus } from './types';


class FakeGenericObject extends AbstractGenericObject<any> {}

describe('Generic Object Defualt Behaviors', () => {

  it('Generic Object should have type ID', () => {
        const gObject = new FakeGenericObject({}, null);
        expect(gObject.metadata.typeId).toBe(FakeGenericObject.name);
  });

  it('Generic Object should have default status', () => {
    const gObject = new FakeGenericObject({}, null);
    expect(gObject.metadata.status).toBe(GenericObjectStatus.Active);
  });

  it('Generic Object should have default user ID', () => {
    const gObject = new FakeGenericObject({}, null);
    expect(gObject.metadata.userId).toBe(emptyUUID);
  });
});