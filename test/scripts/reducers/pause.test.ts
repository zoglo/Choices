import { expect } from 'chai';
import general from '../../../src/scripts/reducers/txn';
import { ActionType, State } from '../../../src';
import { defaultState } from '../../../src/scripts/reducers';

describe('reducers/loading', () => {
  it('should return same state when no action matches', () => {
    expect(general(defaultState.txn, {} as any)).to.equal(
      defaultState.txn,
    );
  });

  describe('SET_TRANSACTION', () => {
    it('sets transaction state', () => {
      const expectedState: State['txn'] = 1;

      const actualState = general(undefined, {
        type: ActionType.SET_TRANSACTION,
        txn: true,
      });

      expect(expectedState).to.deep.equal(actualState);
    });
  });
});
