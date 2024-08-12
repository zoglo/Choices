import { ItemActions } from '../actions/items';
import { State } from '../interfaces/state';
import { ChoiceActions } from '../actions/choices';
import { ActionType } from '../interfaces';
import { StateUpdate } from '../interfaces/store';

type ActionTypes = ChoiceActions | ItemActions;
type StateType = State['items'];

export default function items(
  s: StateType,
  action: ActionTypes,
): StateUpdate<StateType> {
  let state = s;
  let update = false;

  switch (action.type) {
    case ActionType.ADD_ITEM: {
      const { item } = action;
      if (item.id) {
        item.selected = true;
        const el = item.element as HTMLOptionElement | undefined;
        if (el) {
          el.selected = true;
          el.setAttribute('selected', '');
        }

        update = true;
        state.push(item);
        state.forEach((obj) => {
          // eslint-disable-next-line no-param-reassign
          obj.highlighted = false;
        });
      }

      break;
    }

    case ActionType.REMOVE_ITEM: {
      const { item } = action;
      if (item.id) {
        item.selected = false;
        const el = item.element as HTMLOptionElement | undefined;
        if (el) {
          el.selected = false;
          el.removeAttribute('selected');
        }

        update = true;
        state = state.filter((choice) => choice.id !== item.id);
      }
      break;
    }

    case ActionType.REMOVE_CHOICE: {
      const { choice } = action;

      update = true;
      state = state.filter((item) => item.id !== choice.id);
      break;
    }

    case ActionType.HIGHLIGHT_ITEM: {
      const highlightItemAction = action;

      update = true;
      state.forEach((obj) => {
        const item = obj;
        if (item.id === highlightItemAction.item.id) {
          item.highlighted = highlightItemAction.highlighted;
        }
      });

      break;
    }

    default:
      break;
  }

  return { state, update };
}
