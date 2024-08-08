import { Options } from '../interfaces/options';
import { SearchResult } from './search-results';
export declare function searchByFuse<T extends object>(config: Options, haystack: T[], needle: string): SearchResult<T>[];
