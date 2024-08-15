import { ItemActions } from '../actions/items';
import { State } from '../interfaces/state';
import { ChoiceActions } from '../actions/choices';
import { ActionType } from '../interfaces';
import { StateUpdate } from '../interfaces/store';
import { isHtmlSelectElement } from '../lib/html-guard-statements';
import { SELECT_ONE_TYPE } from '../constants';

type ActionTypes = ChoiceActions | ItemActions;
type StateType = State['items'];

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
      state.forEach((obj) => {
        // eslint-disable-next-line no-param-reassign
        obj.highlighted = false;
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
      state = state.filter((choice) => choice.id !== item.id);
      break;
    }

    case ActionType.REMOVE_CHOICE: {
      state = state.filter((item) => item.id !== action.choice.id);
      break;
    }

    case ActionType.HIGHLIGHT_ITEM: {
      const highlightItemAction = action;
      state.forEach((obj) => {
        const item = obj;
        if (item.id === highlightItemAction.item.id) {
          item.highlighted = highlightItemAction.highlighted;
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
