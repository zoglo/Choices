import { ChoiceFull } from '../interfaces/choice-full';
import { ActionType } from '../interfaces';
import { AnyAction } from '../interfaces/store';
export type ItemActions = AddItemAction | RemoveItemAction | HighlightItemAction;
export interface AddItemAction extends AnyAction<ActionType.ADD_ITEM> {
    item: ChoiceFull;
}
export interface RemoveItemAction extends AnyAction<ActionType.REMOVE_ITEM> {
    item: ChoiceFull;
}
export interface HighlightItemAction extends AnyAction<ActionType.HIGHLIGHT_ITEM> {
    item: ChoiceFull;
    highlighted: boolean;
}
export declare const addItem: (item: ChoiceFull) => AddItemAction;
export declare const removeItem: (item: ChoiceFull) => RemoveItemAction;
export declare const highlightItem: (item: ChoiceFull, highlighted: boolean) => HighlightItemAction;
