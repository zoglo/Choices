import { searchByFuse } from './fuse';
import { searchByPrefixFilter } from './prefix-filter';
import { Options } from '../interfaces';
import { SearchResult } from './search-results';

// eslint-disable-next-line import/no-mutable-exports
let search: <T extends object>(
  config: Options,
  haystack: T[],
  needle: string,
) => SearchResult<T>[];

if (process.env.SEARCH_FUSE) {
  search = searchByFuse;
} else {
  search = searchByPrefixFilter;
}

export default search;
