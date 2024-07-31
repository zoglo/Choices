import { ACTION_TYPES } from '../constants';
import { ChoiceFull } from '../interfaces/choice-full';
export interface AddItemAction {
    type: typeof ACTION_TYPES.ADD_ITEM;
    item: ChoiceFull;
}
export interface RemoveItemAction {
    type: typeof ACTION_TYPES.REMOVE_ITEM;
    item: ChoiceFull;
}
export interface HighlightItemAction {
    type: typeof ACTION_TYPES.HIGHLIGHT_ITEM;
    id: number;
    highlighted: boolean;
}
export declare const addItem: (item: ChoiceFull) => AddItemAction;
export declare const removeItem: (item: ChoiceFull) => RemoveItemAction;
export declare const highlightItem: (id: number, highlighted: boolean) => HighlightItemAction;
//# sourceMappingURL=items.d.ts.map