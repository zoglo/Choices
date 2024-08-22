import { ItemActions } from '../actions/items';
import { State } from '../interfaces/state';
import { ChoiceActions } from '../actions/choices';
import { ActionType } from '../interfaces';
import { StateUpdate } from '../interfaces/store';
import { isHtmlSelectElement } from '../lib/html-guard-statements';
import { SELECT_ONE_TYPE } from '../constants';
import { ChoiceFull } from '../interfaces/choice-full';

type ActionTypes = ChoiceActions | ItemActions;
type StateType = State['items'];

const removeItem = (item: ChoiceFull): void => {
  const { itemEl } = item;
  if (itemEl) {
    itemEl.remove();
    item.itemEl = undefined;
  }
};

export default function items(s: StateType, action: ActionTypes): StateUpdate<StateType> {
  let state = s;
  let update = true;

  switch (action.type) {
    case ActionType.ADD_ITEM: {
      const { item } = action;
      item.selected = true;
      const el = item.element as HTMLOptionElement | undefined;
      if (el) {
        el.selected = true;
        el.setAttribute('selected', '');
      }

      state.push(item);
      state.forEach((choice) => {
        choice.highlighted = false;
      });
      break;
    }

    case ActionType.REMOVE_ITEM: {
      const { item } = action;
      item.selected = false;
      const el = item.element as HTMLOptionElement | undefined;
      if (el) {
        el.selected = false;
        el.removeAttribute('selected');
        // For a select-one, if all options are deselected, the first item is selected. To set a black value, select.value needs to be set
        const select = el.parentElement;
        if (select && isHtmlSelectElement(select) && select.type === SELECT_ONE_TYPE) {
          select.value = '';
        }
      }
      // this is mixing concerns, but this is *so much faster*
      removeItem(item);
      state = state.filter((choice) => choice.id !== item.id);
      break;
    }

    case ActionType.REMOVE_CHOICE: {
      const { choice } = action;
      state = state.filter((item) => item.id !== choice.id);
      removeItem(choice);
      break;
    }

    case ActionType.HIGHLIGHT_ITEM: {
      const highlightItemAction = action;
      state.forEach((choice) => {
        if (choice.id === highlightItemAction.item.id) {
          choice.highlighted = highlightItemAction.highlighted;
        }
      });
      break;
    }

    default: {
      update = false;
      break;
    }
  }

  return { state, update };
}
