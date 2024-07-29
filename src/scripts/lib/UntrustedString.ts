import { sanitise } from './utils';

export class UntrustedString {
  public readonly s: string;

  public readonly raw: string;

  constructor(unescapedString: string) {
    this.raw = unescapedString;
    this.s = sanitise(unescapedString);
  }

  toString() {
    return this.s;
  }
}
