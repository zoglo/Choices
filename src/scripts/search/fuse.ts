import Fuse from 'fuse.js';
import { Options } from '../interfaces/options';
import { SearchResult } from './search-results';

export function searchByFuse<T extends object>(
  config: Options,
  haystack: T[],
  needle: string,
): SearchResult<T>[] {
  // todo figure out how to use; `process.env.SEARCH_FUSE === 'full'` to control how it imports from 'fuse.mjs' or 'fuse.basic.mjs'

  // Need to use an object literal for options argument
  // see https://github.com/krisk/Fuse/issues/303#issuecomment-506940824
  const fuse = new Fuse<T>(haystack, {
    ...config.fuseOptions,
    keys: [...config.searchFields],
    includeMatches: true,
  });
  const results = fuse.search(needle);

  return results as SearchResult<T>[];
}
