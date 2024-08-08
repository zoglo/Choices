import { Options } from '../interfaces';
import { SearchResult } from '../interfaces/search';

export function searchByPrefixFilter<T extends object>(
  config: Options,
  _haystack: T[],
  _needle: string,
): SearchResult<T>[] {
  const fields = config.searchFields;
  if (!fields || fields.length === 0) {
    return [];
  }

  let haystack = _haystack;
  if (_needle !== '') {
    const needle = _needle.toLowerCase();
    haystack = haystack.filter((obj) =>
      fields.some(
        (field) =>
          field in obj &&
          (obj[field] as string).toLowerCase().startsWith(needle),
      ),
    );
  }

  return haystack.map((value, index): SearchResult<T> => {
    return {
      item: value,
      score: index,
    };
  });
}
