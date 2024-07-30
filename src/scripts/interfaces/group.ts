/* eslint-disable @typescript-eslint/no-explicit-any */

import { Choice } from './choice';

export interface Group {
  id?: number;
  active?: boolean;
  disabled?: boolean;
  value: any;
  element?: HTMLOptGroupElement;
  choices?: Choice[];
}
