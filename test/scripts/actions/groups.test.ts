import { expect } from 'chai';
import * as actions from '../../../src/scripts/actions/groups';
import { mapInputToChoice } from '../../../src/scripts/lib/choice-input';
import { InputGroup, ActionType } from '../../../src';

describe('actions/groups', () => {
  describe('addGroup action', () => {
    it('returns ADD_GROUP action', () => {
      const value = 'test';
      const id = 1;
      const active = true;
      const disabled = false;

      const expectedAction: actions.AddGroupAction = {
        type: ActionType.ADD_GROUP,
        group: {
          label: value,
          id,
          active,
          disabled,
          choices: [],
        },
      };

      expect(
        actions.addGroup(
          mapInputToChoice(
            {
              value,
              id,
              active,
              disabled,
              choices: [],
            } as InputGroup,
            true,
          ),
        ),
      ).to.deep.equal(expectedAction);
    });
  });
});
