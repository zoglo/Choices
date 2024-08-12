import { ActionType } from '../interfaces';
export interface ClearAllAction {
    type: ActionType.CLEAR_ALL;
}
export interface SetTransactionStateAction {
    type: ActionType.SET_TRANSACTION;
    txn: boolean;
}
export declare const clearAll: () => ClearAllAction;
export declare const setTxn: (txn: boolean) => SetTransactionStateAction;
