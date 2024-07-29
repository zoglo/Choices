import { SetIsLoadingAction } from '../actions/misc';
import { State } from '../interfaces/state';

export const defaultState = 0;

type ActionTypes = SetIsLoadingAction | Record<string, never>;

const general = (
  state = defaultState,
  action: ActionTypes = {},
): State['loading'] => {
  switch (action.type) {
    case 'SET_IS_LOADING': {
      if (action.isLoading) {
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
