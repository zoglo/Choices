import { ACTION_TYPES } from '../constants';
export interface ClearAllAction {
    type: typeof ACTION_TYPES.CLEAR_ALL;
}
export interface SetIsLoadingAction {
    type: typeof ACTION_TYPES.SET_IS_LOADING;
    isLoading: boolean;
}
export declare const clearAll: () => ClearAllAction;
export declare const setIsLoading: (isLoading: boolean) => SetIsLoadingAction;
//# sourceMappingURL=misc.d.ts.map