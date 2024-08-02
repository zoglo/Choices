# Changelog

## [11.0.0 RC1] (2024-08-02)

### ⚠ BREAKING CHANGES

* `allowHtml` now defaults to false.
* HTML escaping of choice/item labels should no longer double escape depending on allowHTML mode.
* Templates/text functions now escape `'` characters for display.
* `addItemText`/`uniqueItemText`/`customAddItemText` are now called with the `value` argument already escaped.
* Typescript classes for input data vs internal working data have been adjusted resulting in the `Choice`/`Group`/`Item` typescript classes have been renamed, and aliases left as required.

### Features

* The original option list for the select is not destroyed, and all loaded choices are serialised to HTML for better compatibility with external javascript.
* New `singleModeForMultiSelect` feature to treat a `select-single` as if it was a `select-multiple` with a max item count of `1`, and still auto-close the dropdown and swap the active item on selection.
* Remove `deepMerge` dependency.
* `Remove item text` can be localized.
* Allow user-created choices for selects. [#1117](https://github.com/Choices-js/Choices/issues/1117)
    * User input is escaped by default. At the risk of XSS attacks this can be disabled by `allowHtmlUserInput`.
* Render options without a group even if groups are present. [#615](https://github.com/Choices-js/Choices/issues/615) [#1110](https://github.com/Choices-js/Choices/issues/1110)
* Read `data-labelclass`/`data-label-description` from `<option>` HTML to drive adding a per-choice CSS label and description text when `allowHtml: false`.
* Add `removeItemButtonAlignLeft` option, to control if the remove item button is at the start or the end of the item.
* Add `removeChoice` method. Removes the choice from the `choices.js` object and any backing `<option>` HTML element
* Add `refresh` method. Reloads choices from the backing `<select>`s options.
* Improve rendering performance by batching changes.
* `escapeForTemplate` function is passed to the 2nd method of the `callbackOnCreateTemplates` callback.
* When `allowHtml` is false, default templates now render escaped html to `innerHtml` writing to `innerText`.
    * This provides consistent rendering performance as `innerText` is quirky and slower than escaped html into `innerHtml`
* Shadow DOM support [#938](https://github.com/Choices-js/Choices/pull/938)

### Bug Fixes

* Replace malicious polyfill with cdnjs. [#1161](https://github.com/Choices-js/Choices/issues/1161)
* Maintain groups in search mode. [#1152](https://github.com/Choices-js/Choices/issues/1152)
* Fix various "first press" bugs on single select dropdowns. [#1104](https://github.com/Choices-js/Choices/issues/1104)
* Fix 'esc' would close the dropdown and also apply to the container resulting in an overlay/modal unexpectedly closing. [#1039](https://github.com/Choices-js/Choices/issues/1039)
* Fix form reset would clear the choices list, but not clear the search bar. [#1023](https://github.com/Choices-js/Choices/issues/1023)
* Fix options would be disabled when choices.js was intialized on a disabled <select> element. [#1025](https://github.com/Choices-js/Choices/issues/1025)
* Fix a `search_term` element to appear in form submit data. [#1049](https://github.com/Choices-js/Choices/issues/1049)
* Fix 'remove item' button would trigger the change event twice due to placeholder value being used (match html single-select). [#892](https://github.com/Choices-js/Choices/issues/892)
* Fix optgroups are not preserved when Choices is destroyed [#1055](https://github.com/Choices-js/Choices/issues/1055)
* Fix placeholder config option would be ignored for select boxes which have blank entries.
* Fix `data-custom-properties` attribute did not serialize to created elements as a json blob as expected. [#840](https://github.com/Choices-js/Choices/issues/840) [#1155](https://github.com/Choices-js/Choices/issues/1155) [#543](https://github.com/Choices-js/Choices/issues/543)
* Fix multi-select did not correctly resizing when a select option is selected on choices.js initialization.
* Fix clearInput function did not clear the last search.
* Fix `addItemFilter` would allow empty strings as input to be added for items.
* Fix various issues with double escaping when displaying items/choices depending on allowHTML mode.
* Fix `aria-label` for placeholders was set to the string `null`
* Fix `searchEnable` flag was not respected for `select-multiple` [#1042](https://github.com/Choices-js/Choices/issues/1042)
* Fix poor error message when Choices is passed a string selector which fails to find the element for Choices to attach to.
* Avoid pushing a search to fuse.js which is just additional whitespace to the existing search term