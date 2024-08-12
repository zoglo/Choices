import { SetTransactionStateAction } from '../actions/misc';
import { State } from '../interfaces/state';
type ActionTypes = SetTransactionStateAction | Record<string, never>;
declare const general: (state?: number, action?: ActionTypes) => State["txn"];
export default general;
