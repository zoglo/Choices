import {
  AddItemAction,
  RemoveItemAction,
  HighlightItemAction,
} from '../actions/items';
import { State } from '../interfaces/state';
import { Choice } from '../interfaces/choice';
import { RemoveChoiceAction } from '../actions/choices';

export const defaultState = [];

type ActionTypes =
  | AddItemAction
  | RemoveChoiceAction
  | RemoveItemAction
  | HighlightItemAction
  | Record<string, never>;

export default function items(
  state: Choice[] = defaultState,
  action: ActionTypes = {},
): State['items'] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action as AddItemAction;
      if (!item.id) {
        return state;
      }

      item.selected = true;
      const el = item.element as HTMLOptionElement;
      if (el) {
        el.selected = true;
        el.setAttribute('selected', '');
      }

      return [...state, item].map((obj: Choice) => {
        const choice = obj;
        choice.highlighted = false;

        return choice;
      });
    }

    case 'REMOVE_ITEM': {
      const { item } = action as RemoveItemAction;
      if (!item.id) {
        return state;
      }

      item.selected = false;
      const el = item.element as HTMLOptionElement;
      if (el) {
        el.selected = false;
        el.removeAttribute('selected');
      }

      return state.filter((choice) => choice.id !== item.id);
    }

    case 'REMOVE_CHOICE': {
      const { value } = action as RemoveChoiceAction;

      return state.filter((choice) => choice.value !== value);
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
