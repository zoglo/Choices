import { StringUntrusted } from './string-untrusted';
// eslint-disable-next-line
import { Types } from './types';

export interface InputChoice {
  id?: number;
  highlighted?: boolean;
  labelClass?: string | Array<string>;
  labelDescription?: string;
  customProperties?: Types.CustomProperties;
  disabled?: boolean;
  active?: boolean;
  label: StringUntrusted | string;
  placeholder?: boolean;
  selected?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any; // string;
}
