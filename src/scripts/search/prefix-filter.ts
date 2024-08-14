import { Options } from '../interfaces';
import { Searcher, SearchResult } from '../interfaces/search';

export class SearchByPrefixFilter<T extends object> implements Searcher<T> {
  _fields: string[];

  _haystack: T[] = [];

  constructor(config: Options) {
    this._fields = config.searchFields;
  }

  index(data: T[]): void {
    this._haystack = data;
  }

  reset(): void {
    this._haystack = [];
  }

  isEmptyIndex(): boolean {
    return this._haystack.length === 0;
  }

  search(_needle: string): SearchResult<T>[] {
    const fields = this._fields;
    if (!fields || fields.length === 0 || _needle === '') {
      return [];
    }
    const needle = _needle.toLowerCase();

    return this._haystack
      .filter((obj) => fields.some((field) => field in obj && (obj[field] as string).toLowerCase().startsWith(needle)))
      .map((value, index): SearchResult<T> => {
        return {
          item: value,
          score: index,
          rank: index,
        };
      });
  }
}
