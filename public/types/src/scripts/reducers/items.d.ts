import { AddItemAction, RemoveItemAction, HighlightItemAction } from '../actions/items';
import { Item } from '../interfaces/item';
import { State } from '../interfaces/state';
import { RemoveChoiceAction } from '../actions/choices';
export declare const defaultState: never[];
type ActionTypes = AddItemAction | RemoveItemAction | RemoveChoiceAction | HighlightItemAction | Record<string, never>;
export default function items(state?: Item[], action?: ActionTypes): State['items'];
export {};
//# sourceMappingURL=items.d.ts.map