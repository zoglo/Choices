import { expect } from 'chai';
import * as actions from './misc';

describe('actions/misc', () => {
  describe('clearAll action', () => {
    it('returns CLEAR_ALL action', () => {
      const expectedAction: actions.ClearAllAction = {
        type: 'CLEAR_ALL',
      };

      expect(actions.clearAll()).to.eql(expectedAction);
    });
  });

  describe('setIsLoading action', () => {
    describe('setting loading state to true', () => {
      it('returns expected action', () => {
        const expectedAction: actions.SetIsLoadingAction = {
          type: 'SET_IS_LOADING',
          isLoading: true,
        };

        expect(actions.setIsLoading(true)).to.eql(expectedAction);
      });
    });

    describe('setting loading state to false', () => {
      it('returns expected action', () => {
        const expectedAction: actions.SetIsLoadingAction = {
          type: 'SET_IS_LOADING',
          isLoading: false,
        };

        expect(actions.setIsLoading(false)).to.eql(expectedAction);
      });
    });
  });
});
