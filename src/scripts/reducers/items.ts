import {
  AddItemAction,
  RemoveItemAction,
  HighlightItemAction,
} from '../actions/items';
import { Item } from '../interfaces/item';
import { State } from '../interfaces/state';
import { RemoveChoiceAction } from '../actions/choices';

export const defaultState = [];

type ActionTypes =
  | AddItemAction
  | RemoveItemAction
  | RemoveChoiceAction
  | HighlightItemAction
  | Record<string, never>;

export default function items(
  state: Item[] = defaultState,
  action: ActionTypes = {},
): State['items'] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const addItemAction = action as AddItemAction;
      // Add object to items array
      const newState = [
        ...state,
        {
          id: addItemAction.id,
          choiceId: addItemAction.choiceId,
          groupId: addItemAction.groupId,
          value: addItemAction.value,
          label: addItemAction.label,
          active: true,
          highlighted: false,
          labelClass: addItemAction.labelClass,
          labelDescription: addItemAction.labelDescription,
          customProperties: addItemAction.customProperties,
          placeholder: addItemAction.placeholder || false,
          keyCode: null,
        },
      ];

      return newState.map((obj: Item) => {
        const item = obj;
        item.highlighted = false;

        return item;
      });
    }

    case 'REMOVE_ITEM': {
      const removeItemAction = action as RemoveItemAction;

      // Set item to inactive
      return state.map((obj) => {
        const item = obj;
        if (item.id === removeItemAction.id) {
          item.active = false;
        }

        return item;
      });
    }

    case 'REMOVE_CHOICE': {
      const removeChoiceAction = action as RemoveChoiceAction;
      const choiceValue = removeChoiceAction.value;

      return state.filter((choice) => choice.value !== choiceValue);
    }

    case 'HIGHLIGHT_ITEM': {
      const highlightItemAction = action as HighlightItemAction;

      return state.map((obj) => {
        const item = obj;
        if (item.id === highlightItemAction.id) {
          item.highlighted = highlightItemAction.highlighted;
        }

        return item;
      });
    }

    default: {
      return state;
    }
  }
}
