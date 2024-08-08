import { Options } from '../interfaces';
import { SearchResult } from './search-results';
export declare function searchByPrefixFilter<T extends object>(config: Options, _haystack: T[], _needle: string): SearchResult<T>[];
