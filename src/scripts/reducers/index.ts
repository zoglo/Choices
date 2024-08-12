import { AnyAction, combineReducers } from 'redux';
import items from './items';
import groups from './groups';
import choices from './choices';
import txn from './txn';
import { cloneObject } from '../lib/utils';
import { ActionType, State } from '../interfaces';

export const defaultState: State = {
  groups: [],
  items: [],
  choices: [],
  txn: 0,
};

const appReducer = combineReducers({
  items,
  groups,
  choices,
  txn,
});

const rootReducer = (passedState: State, action: AnyAction): object => {
  let state = passedState;
  // If we are clearing all items, groups and options we reassign
  // state and then pass that state to our proper reducer. This isn't
  // mutating our actual state
  // See: http://stackoverflow.com/a/35641992
  if (action.type === ActionType.CLEAR_ALL) {
    // preserve the txn state as to allow withTxn to work
    const paused = state.txn;
    state = cloneObject(defaultState);
    state.txn = paused;
  }

  return appReducer(state, action);
};

export default rootReducer;
