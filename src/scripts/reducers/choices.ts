import { ActionType, State } from '../interfaces';
import { StateUpdate } from '../interfaces/store';
import { ChoiceActions } from '../actions/choices';
import { ItemActions } from '../actions/items';
import { SearchResult } from '../interfaces/search';
import { ChoiceFull } from '../interfaces/choice-full';

type ActionTypes = ChoiceActions | ItemActions;
type StateType = State['choices'];

export default function choices(s: StateType, action: ActionTypes): StateUpdate<StateType> {
  let state = s;
  let update = true;

  switch (action.type) {
    case ActionType.ADD_CHOICE: {
      /*
        A disabled choice appears in the choice dropdown but cannot be selected
        A selected choice has been added to the passed input's value (added as an item)
        An active choice appears within the choice dropdown
      */
      state.push(action.choice);
      break;
    }

    case ActionType.REMOVE_CHOICE: {
      state = state.filter((obj) => obj.id !== action.choice.id);
      break;
    }

    case ActionType.ADD_ITEM: {
      // trigger a rebuild of the choices list as the item can not be added multiple times
      update = action.item.selected;
      break;
    }

    case ActionType.REMOVE_ITEM: {
      // trigger a rebuild of the choices list as the item can be added
      update = action.item.selected;
      break;
    }

    case ActionType.FILTER_CHOICES: {
      // avoid O(n^2) algorithm complexity when searching/filtering choices
      const scoreLookup: SearchResult<ChoiceFull>[] = [];
      action.results.forEach((result) => {
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
      state.forEach((obj) => {
        const choice = obj;
        choice.active = action.active;

        return choice;
      });
      break;
    }

    case ActionType.CLEAR_CHOICES: {
      state = [];
      break;
    }

    default: {
      update = false;
      break;
    }
  }

  return { state, update };
}
