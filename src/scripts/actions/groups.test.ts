import { expect } from 'chai';
import * as actions from './groups';
import { mapInputToChoice } from '../lib/choice-input';

describe('actions/groups', () => {
  describe('addGroup action', () => {
    it('returns ADD_GROUP action', () => {
      const value = 'test';
      const id = 1;
      const active = true;
      const disabled = false;

      const expectedAction: actions.AddGroupAction = {
        type: 'ADD_GROUP',
        group: {
          value,
          id,
          active,
          disabled,
        },
      };

      expect(
        actions.addGroup(
          mapInputToChoice(
            {
              label: value,
              id,
              active,
              disabled,
              choices: [],
            },
            true,
          ),
        ),
      ).to.eql(expectedAction);
    });
  });
});
