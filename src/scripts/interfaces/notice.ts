import { PreEscapedString } from '../lib/PreEscapedString';
import { UntrustedString } from '../lib/UntrustedString';

// @todo rename
export interface Notice {
  response: boolean;
  notice: UntrustedString | PreEscapedString | string;
}
