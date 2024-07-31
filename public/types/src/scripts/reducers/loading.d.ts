import { SetIsLoadingAction } from '../actions/misc';
import { State } from '../interfaces/state';
export declare const defaultState = 0;
type ActionTypes = SetIsLoadingAction | Record<string, never>;
declare const general: (state?: number, action?: ActionTypes) => State["loading"];
export default general;
//# sourceMappingURL=loading.d.ts.map