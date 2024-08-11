import { Options } from '../interfaces';
import { Searcher } from '../interfaces/search';
import { SearchByPrefixFilter } from './prefix-filter';
import { SearchByFuse } from './fuse';

export function getSearcher<T extends object>(config: Options): Searcher<T> {
  if (process.env.SEARCH_FUSE) {
    return new SearchByFuse<T>(config);
  }

  return new SearchByPrefixFilter<T>(config);
}
