export class PreEscapedString {
  public readonly s: string;

  constructor(unescapedString: string) {
    this.s = unescapedString;
  }

  toString() {
    return this.s;
  }
}
