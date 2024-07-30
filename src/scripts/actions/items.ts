import { ACTION_TYPES } from '../constants';
import { StringUntrusted } from '../interfaces/string-untrusted';

export interface AddItemAction {
  type: typeof ACTION_TYPES.ADD_ITEM;
  id: number;
  value: string;
  label: StringUntrusted | string;
  choiceId: number;
  groupId: number;
  labelClass?: string | Array<string> | null;
  labelDescription?: string | null;
  customProperties: object;
  placeholder: boolean;
  keyCode: number;
}

export interface RemoveItemAction {
  type: typeof ACTION_TYPES.REMOVE_ITEM;
  id: number;
  choiceId: number;
}

export interface HighlightItemAction {
  type: typeof ACTION_TYPES.HIGHLIGHT_ITEM;
  id: number;
  highlighted: boolean;
}

export const addItem = ({
  value,
  label,
  id,
  choiceId,
  groupId,
  labelClass,
  labelDescription,
  customProperties,
  placeholder,
  keyCode,
}: {
  id: number;
  value: string;
  label: StringUntrusted | string;
  choiceId: number;
  groupId: number;
  labelClass?: string | Array<string> | null;
  labelDescription?: string | null;
  customProperties: object;
  placeholder: boolean;
  keyCode: number;
}): AddItemAction => ({
  type: ACTION_TYPES.ADD_ITEM,
  value,
  label,
  id,
  choiceId,
  groupId,
  labelClass,
  labelDescription,
  customProperties,
  placeholder,
  keyCode,
});

export const removeItem = (id: number, choiceId: number): RemoveItemAction => ({
  type: ACTION_TYPES.REMOVE_ITEM,
  id,
  choiceId,
});

export const highlightItem = (
  id: number,
  highlighted: boolean,
): HighlightItemAction => ({
  type: ACTION_TYPES.HIGHLIGHT_ITEM,
  id,
  highlighted,
});
