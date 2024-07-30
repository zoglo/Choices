/* eslint-disable @typescript-eslint/no-explicit-any */

import { StringUntrusted } from './string-untrusted';

export interface Choice {
  id?: number;
  highlighted?: boolean;
  element?: HTMLOptionElement | HTMLOptGroupElement;
  labelClass?: string | Array<string>;
  labelDescription?: string;
  customProperties?: Record<string, any> | null;
  disabled?: boolean;
  active?: boolean;
  elementId?: string;
  groupId?: number;
  keyCode?: number;
  label: StringUntrusted | string;
  placeholder?: boolean;
  selected?: boolean;
  value: any;
  score?: number;
  choices?: Choice[];
}
