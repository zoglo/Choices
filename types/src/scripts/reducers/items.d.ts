import { ItemActions } from '../actions/items';
import { State } from '../interfaces/state';
import { ChoiceActions } from '../actions/choices';
import { StateUpdate } from '../interfaces/store';
type ActionTypes = ChoiceActions | ItemActions;
type StateType = State['items'];
export default function items(s: StateType, action: ActionTypes): StateUpdate<StateType>;
export {};
