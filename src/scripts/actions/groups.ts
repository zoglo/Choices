import { ACTION_TYPES } from '../constants';
import { Group } from '../interfaces/group';

export interface AddGroupAction {
  type: typeof ACTION_TYPES.ADD_GROUP;
  group: Group;
}

export const addGroup = (group: Group): AddGroupAction => ({
  type: ACTION_TYPES.ADD_GROUP,
  group,
});
