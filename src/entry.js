import Choices from './scripts/choices';

Choices.version = '__VERSION__';

/* TODO implement build-based registration of which search provider is used; Fuse-basic/Fuse-full/simple-prefix
if (process.env.SEARCH === 'fuse-full') {
  Choices.SearchProvider = Fuse.Full;
} else if (process.env.SEARCH === 'fuse-basic') {
  Choices.SearchProvider = Fuse.Simple;
}
*/

export default Choices;
