export interface SearchResult<T extends object> {
    item: T;
    score: number;
}
