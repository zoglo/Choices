import { SetTransactionStateAction } from '../actions/misc';
import { State } from '../interfaces/state';
import { ActionType } from '../interfaces';

type ActionTypes = SetTransactionStateAction | Record<string, never>;

const general = (state: number = 0, action: ActionTypes = {}): State['txn'] => {
  switch (action.type) {
    case ActionType.SET_TRANSACTION: {
      if (action.txn) {
        return state + 1;
      }

      return Math.max(0, state - 1);
    }

    default: {
      return state;
    }
  }
};

export default general;
