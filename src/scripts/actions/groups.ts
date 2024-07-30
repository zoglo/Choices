import { ACTION_TYPES } from '../constants';
import { GroupFull } from '../interfaces/group-full';

export interface AddGroupAction {
  type: typeof ACTION_TYPES.ADD_GROUP;
  group: GroupFull;
}

export const addGroup = (group: GroupFull): AddGroupAction => ({
  type: ACTION_TYPES.ADD_GROUP,
  group,
});
