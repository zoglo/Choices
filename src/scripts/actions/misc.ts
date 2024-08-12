import { ActionType } from '../interfaces';

export interface ClearAllAction {
  type: ActionType.CLEAR_ALL;
}

export interface SetTransactionStateAction {
  type: ActionType.SET_TRANSACTION;
  txn: boolean;
}

export const clearAll = (): ClearAllAction => ({
  type: ActionType.CLEAR_ALL,
});

export const setTxn = (txn: boolean): SetTransactionStateAction => ({
  type: ActionType.SET_TRANSACTION,
  txn,
});
