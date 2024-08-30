/* eslint-disable @typescript-eslint/no-explicit-any */
import { StringUntrusted } from './string-untrusted';

export type CustomProperties = Record<string, any> | string;

/*
  A disabled choice appears in the choice dropdown but cannot be selected
  A selected choice has been added to the passed input's value (added as an item)
  An active choice appears within the choice dropdown (ie search sets active to false if it doesn't match)
*/
export interface ChoiceFull {
  id: number;
  highlighted: boolean;
  element?: HTMLOptionElement | HTMLOptGroupElement;
  itemEl?: HTMLElement;
  choiceEl?: HTMLElement;
  labelClass?: Array<string>;
  labelDescription?: string;
  customProperties?: CustomProperties;
  disabled: boolean;
  active: boolean;
  elementId?: string;
  groupId: number;
  label: StringUntrusted | string;
  placeholder: boolean;
  selected: boolean;
  value: string;
  score: number;
  rank: number;
}
