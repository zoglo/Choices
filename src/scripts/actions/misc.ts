import { ACTION_TYPES } from '../constants';

export interface ClearAllAction {
  type: typeof ACTION_TYPES.CLEAR_ALL;
}

export interface SetIsLoadingAction {
  type: typeof ACTION_TYPES.SET_IS_LOADING;
  isLoading: boolean;
}

export const clearAll = (): ClearAllAction => ({
  type: ACTION_TYPES.CLEAR_ALL,
});

export const setIsLoading = (isLoading: boolean): SetIsLoadingAction => ({
  type: ACTION_TYPES.SET_IS_LOADING,
  isLoading,
});
