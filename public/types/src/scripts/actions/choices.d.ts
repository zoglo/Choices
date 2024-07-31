import { ACTION_TYPES } from '../constants';
import { ChoiceFull } from '../interfaces/choice-full';
export interface AddChoiceAction {
    type: typeof ACTION_TYPES.ADD_CHOICE;
    choice: ChoiceFull;
}
export interface RemoveChoiceAction {
    type: typeof ACTION_TYPES.REMOVE_CHOICE;
    value: string;
}
export interface Result<T> {
    item: T;
    score: number;
}
export interface FilterChoicesAction {
    type: typeof ACTION_TYPES.FILTER_CHOICES;
    results: Result<ChoiceFull>[];
}
export interface ActivateChoicesAction {
    type: typeof ACTION_TYPES.ACTIVATE_CHOICES;
    active: boolean;
}
export interface ClearChoicesAction {
    type: typeof ACTION_TYPES.CLEAR_CHOICES;
}
export declare const addChoice: (choice: ChoiceFull) => AddChoiceAction;
export declare const removeChoice: (value: any) => RemoveChoiceAction;
export declare const filterChoices: (results: Result<ChoiceFull>[]) => FilterChoicesAction;
export declare const activateChoices: (active?: boolean) => ActivateChoicesAction;
export declare const clearChoices: () => ClearChoicesAction;
//# sourceMappingURL=choices.d.ts.map