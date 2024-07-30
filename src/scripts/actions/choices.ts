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

export const addChoice = (choice: ChoiceFull): AddChoiceAction => ({
  type: ACTION_TYPES.ADD_CHOICE,
  choice,
});

export const removeChoice = (value): RemoveChoiceAction => ({
  type: ACTION_TYPES.REMOVE_CHOICE,
  value,
});

export const filterChoices = (
  results: Result<ChoiceFull>[],
): FilterChoicesAction => ({
  type: ACTION_TYPES.FILTER_CHOICES,
  results,
});

export const activateChoices = (active = true): ActivateChoicesAction => ({
  type: ACTION_TYPES.ACTIVATE_CHOICES,
  active,
});

export const clearChoices = (): ClearChoicesAction => ({
  type: ACTION_TYPES.CLEAR_CHOICES,
});
