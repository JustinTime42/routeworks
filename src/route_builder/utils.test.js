import { removeExtraFields } from './utils';

describe('removeExtraFields', () => {
  it('should remove extra fields from the item', () => {
    const item = {
      id: 1,
      service_address: '123 Main St',
      service_level: 'High',
      active: true,
      priority: false,
      status: 'Waiting',
      temp: false,
      new: false,
    };

    const expected = {
      id: 1,
      service_address: '123 Main St',
      service_level: 'High',
      active: true,
      priority: false,
      status: 'Waiting',
      temp: false,
      new: false,
    };

    expect(removeExtraFields(item)).toEqual(expected);
  });

  it('should set default values for missing fields', () => {
    const item = {
      id: 2,
      service_address: '456 Elm St',
    };

    const expected = {
      id: 2,
      service_address: '456 Elm St',
      service_level: null,
      active: true,
      priority: false,
      status: 'Waiting',
      temp: false,
      new: false,
    };

    expect(removeExtraFields(item)).toEqual(expected);
  });

  it('should remove extra fields from the item', () => {
    const item = {
      id: 3,
      service_address: '789 Oak St',
      service_level: 'Low',
      active: false,
      priority: true,
      status: 'Active',
      temp: true,
      new: true,
      junk: 'junk',
    };

    const expected = {
      id: 3,
      service_address: '789 Oak St',
      service_level: 'Low',
      active: false,
      priority: true,
      status: 'Active',
      temp: true,
      new: true,
    };

    expect(removeExtraFields(item)).toEqual(expected);
  })
});