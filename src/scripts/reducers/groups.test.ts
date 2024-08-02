import { expect } from 'chai';
import groups, { defaultState } from './groups';
import { cloneObject } from '../lib/utils';
import { GroupFull } from '../interfaces/group-full';
import { ActionType } from '../interfaces';

describe('reducers/groups', () => {
  it('should return same state when no action matches', () => {
    expect(groups(defaultState, {} as any)).to.equal(defaultState);
  });

  describe('when groups do not exist', () => {
    describe('ADD_GROUP', () => {
      it('adds group', () => {
        const group: GroupFull = {
          active: true,
          disabled: false,
          id: 1,
          label: 'Group one',
          choices: [],
        };

        const expectedResponse = [group];

        const actualResponse = groups(undefined, {
          type: ActionType.ADD_GROUP,
          group: cloneObject(group),
        });

        expect(actualResponse).to.eql(expectedResponse);
      });
    });
  });

  describe('when groups exist', () => {
    let state: GroupFull[];

    beforeEach(() => {
      state = [
        {
          id: 1,
          label: 'Group one',
          active: true,
          disabled: false,
          choices: [],
        },
        {
          id: 2,
          label: 'Group two',
          active: true,
          disabled: false,
          choices: [],
        },
      ];
    });

    describe('CLEAR_CHOICES', () => {
      it('restores to defaultState', () => {
        const clonedState = state.slice(0);
        const expectedResponse = defaultState;
        const actualResponse = groups(clonedState, {
          type: ActionType.CLEAR_CHOICES,
        });

        expect(actualResponse).to.eql(expectedResponse);
      });
    });
  });
});
