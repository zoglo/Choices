import { expect } from 'chai';
import * as actions from '../../../src/scripts/actions/misc';
import { ActionType } from '../../../src';

describe('actions/misc', () => {
  describe('clearAll action', () => {
    it('returns CLEAR_ALL action', () => {
      const expectedAction: actions.ClearAllAction = {
        type: ActionType.CLEAR_ALL,
      };

      expect(actions.clearAll()).to.deep.equal(expectedAction);
    });
  });

  describe('setTxn action', () => {
    describe('setting paused state to true', () => {
      it('returns expected action', () => {
        const expectedAction: actions.SetTransactionStateAction = {
          type: ActionType.SET_TRANSACTION,
          txn: true,
        };

        expect(actions.setTxn(true)).to.deep.equal(expectedAction);
      });
    });

    describe('setting paused state to false', () => {
      it('returns expected action', () => {
        const expectedAction: actions.SetTransactionStateAction = {
          type: ActionType.SET_TRANSACTION,
          txn: false,
        };

        expect(actions.setTxn(false)).to.deep.equal(expectedAction);
      });
    });
  });
});
