import { ACTION_TYPES } from '../constants';
import { GroupFull } from '../interfaces/group-full';
export interface AddGroupAction {
    type: typeof ACTION_TYPES.ADD_GROUP;
    group: GroupFull;
}
export declare const addGroup: (group: GroupFull) => AddGroupAction;
//# sourceMappingURL=groups.d.ts.map