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

export const addItem = (item: ChoiceFull): AddItemAction => ({
  type: ACTION_TYPES.ADD_ITEM,
  item,
});

export const removeItem = (item: ChoiceFull): RemoveItemAction => ({
  type: ACTION_TYPES.REMOVE_ITEM,
  item,
});

export const highlightItem = (
  id: number,
  highlighted: boolean,
): HighlightItemAction => ({
  type: ACTION_TYPES.HIGHLIGHT_ITEM,
  id,
  highlighted,
});
