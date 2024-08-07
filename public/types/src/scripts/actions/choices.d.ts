import { ChoiceFull } from '../interfaces/choice-full';
import { ActionType } from '../interfaces';
export interface AddChoiceAction {
    type: ActionType.ADD_CHOICE;
    choice: ChoiceFull;
}
export interface RemoveChoiceAction {
    type: ActionType.REMOVE_CHOICE;
    value: string;
}
export interface Result<T> {
    item: T;
    score: number;
}
export interface FilterChoicesAction {
    type: ActionType.FILTER_CHOICES;
    results: Result<ChoiceFull>[];
}
export interface ActivateChoicesAction {
    type: ActionType.ACTIVATE_CHOICES;
    active: boolean;
}
export interface ClearChoicesAction {
    type: ActionType.CLEAR_CHOICES;
}
export declare const addChoice: (choice: ChoiceFull) => AddChoiceAction;
export declare const removeChoice: (value: any) => RemoveChoiceAction;
export declare const filterChoices: (results: Result<ChoiceFull>[]) => FilterChoicesAction;
export declare const activateChoices: (active?: boolean) => ActivateChoicesAction;
export declare const clearChoices: () => ClearChoicesAction;
