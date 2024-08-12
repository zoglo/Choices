import { AnyAction } from 'redux';
import { State } from '../interfaces';
export declare const defaultState: State;
declare const rootReducer: (passedState: State, action: AnyAction) => object;
export default rootReducer;
