import { expect } from 'chai';
import general from '../../../src/scripts/reducers/loading';
import { ActionType } from '../../../src';
import { defaultState } from '../../../src/scripts/reducers';

describe('reducers/loading', () => {
  it('should return same state when no action matches', () => {
    expect(general(defaultState.loading, {} as any)).to.equal(
      defaultState.loading,
    );
  });

  describe('SET_IS_LOADING', () => {
    it('sets loading state', () => {
      const expectedState = true;

      const actualState = general(undefined, {
        type: ActionType.SET_IS_LOADING,
        isLoading: true,
      });

      expect(expectedState).to.eql(actualState);
    });
  });
});
