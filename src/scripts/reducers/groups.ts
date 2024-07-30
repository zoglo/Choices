import { AddGroupAction } from '../actions/groups';
import { ClearChoicesAction } from '../actions/choices';
import { State } from '../interfaces/state';
import { GroupFull } from '../interfaces/group-full';

export const defaultState = [];

type ActionTypes = AddGroupAction | ClearChoicesAction | Record<string, never>;

export default function groups(
  state: GroupFull[] = defaultState,
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
