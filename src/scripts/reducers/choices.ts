import { ActionType, State } from '../interfaces';
import { StateUpdate } from '../interfaces/store';
import { ChoiceActions } from '../actions/choices';
import { ItemActions } from '../actions/items';
import { SearchResult } from '../interfaces/search';
import { ChoiceFull } from '../interfaces/choice-full';

type ActionTypes = ChoiceActions | ItemActions;
type StateType = State['choices'];

export default function choices(
  s: StateType,
  action: ActionTypes,
): StateUpdate<StateType> {
  let state = s;
  let update = false;

  switch (action.type) {
    case ActionType.ADD_CHOICE: {
      const { choice } = action;

      /*
        A disabled choice appears in the choice dropdown but cannot be selected
        A selected choice has been added to the passed input's value (added as an item)
        An active choice appears within the choice dropdown
      */
      state.push(choice);
      update = true;
      break;
    }

    case ActionType.REMOVE_CHOICE: {
      const { choice } = action;

      update = true;
      state = state.filter((obj) => obj.id !== choice.id);
      break;
    }

    case ActionType.ADD_ITEM: {
      const { item } = action;
      // trigger a rebuild of the choices list as the item can not be added multiple times
      if (item.id && item.selected) {
        update = true;
      }

      break;
    }

    case ActionType.REMOVE_ITEM: {
      const { item } = action;
      // trigger a rebuild of the choices list as the item can be added
      if (item.id && !item.selected) {
        update = true;
      }

      break;
    }

    case ActionType.FILTER_CHOICES: {
      const { results } = action;

      update = true;
      // avoid O(n^2) algorithm complexity when searching/filtering choices
      const scoreLookup: SearchResult<ChoiceFull>[] = [];
      results.forEach((result) => {
        scoreLookup[result.item.id] = result;
      });

      state.forEach((obj) => {
        const choice = obj;
        const result = scoreLookup[choice.id];
        if (result !== undefined) {
          choice.score = result.score;
          choice.rank = result.rank;
          choice.active = true;
        } else {
          choice.score = 0;
          choice.rank = 0;
          choice.active = false;
        }
      });

      break;
    }

    case ActionType.ACTIVATE_CHOICES: {
      const { active } = action;

      update = true;
      state.forEach((obj) => {
        const choice = obj;
        choice.active = active;

        return choice;
      });
      break;
    }

    case ActionType.CLEAR_CHOICES: {
      update = true;
      state = [];
      break;
    }

    default:
      break;
  }

  return { state, update };
}
