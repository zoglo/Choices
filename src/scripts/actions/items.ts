import { ACTION_TYPES } from '../constants';
import { Choice } from '../interfaces/choice';

export interface AddItemAction {
  type: typeof ACTION_TYPES.ADD_ITEM;
  item: Choice;
}

export interface RemoveItemAction {
  type: typeof ACTION_TYPES.REMOVE_ITEM;
  item: Choice;
}

export interface HighlightItemAction {
  type: typeof ACTION_TYPES.HIGHLIGHT_ITEM;
  id: number;
  highlighted: boolean;
}

export const addItem = (item: Choice): AddItemAction => ({
  type: ACTION_TYPES.ADD_ITEM,
  item,
});

export const removeItem = (item: Choice): RemoveItemAction => ({
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
