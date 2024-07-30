import { StringPreEscaped } from './string-pre-escaped';
import { StringUntrusted } from './string-untrusted';

// @todo rename
export interface Notice {
  response: boolean;
  notice: StringUntrusted | StringPreEscaped | string;
}
