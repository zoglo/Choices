import { ChoiceFull } from '../interfaces/choice-full';
import { ActionType } from '../interfaces';

export interface AddItemAction {
  type: ActionType.ADD_ITEM;
  item: ChoiceFull;
}

export interface RemoveItemAction {
  type: ActionType.REMOVE_ITEM;
  item: ChoiceFull;
}

export interface HighlightItemAction {
  type: ActionType.HIGHLIGHT_ITEM;
  id: number;
  highlighted: boolean;
}

export const addItem = (item: ChoiceFull): AddItemAction => ({
  type: ActionType.ADD_ITEM,
  item,
});

export const removeItem = (item: ChoiceFull): RemoveItemAction => ({
  type: ActionType.REMOVE_ITEM,
  item,
});

export const highlightItem = (
  id: number,
  highlighted: boolean,
): HighlightItemAction => ({
  type: ActionType.HIGHLIGHT_ITEM,
  id,
  highlighted,
});
