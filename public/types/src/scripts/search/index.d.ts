import { Options } from '../interfaces';
import { SearchResult } from './search-results';
declare let search: <T extends object>(config: Options, haystack: T[], needle: string) => SearchResult<T>[];
export default search;
