import { AddGroupAction } from '../actions/groups';
import { ClearChoicesAction } from '../actions/choices';
import { Group } from '../interfaces/group';
import { State } from '../interfaces/state';

export const defaultState = [];

type ActionTypes = AddGroupAction | ClearChoicesAction | Record<string, never>;

export default function groups(
  state: Group[] = defaultState,
  action: ActionTypes = {},
): State['groups'] {
  switch (action.type) {
    case 'ADD_GROUP': {
      const addGroupAction = action as AddGroupAction;

      return [...state, addGroupAction.group];
    }

    case 'CLEAR_CHOICES': {
      return [];
    }

    default: {
      return state;
    }
  }
}
