# Changelog

## [10.3.0] (2024-07-30)

### ⚠ BREAKING CHANGES

* Templates/text functions now escape `'` for display, as this might escape custom templates.

### Features

* Remove `deepMerge` dependency for a custom extend, reduces minified javascript by ~2kb.
* `Remove item text` can be localized.
* Allow user-created choices for selects. #1117
* Render options without a group even if groups are present.
* Read `data-labelclass`/`data-label-description` from `<option>` HTML to drive adding a per-choice CSS label and description text when `allowHtml: false`.
* Add `removeItemButtonAlignLeft` option, to control if the remove item button is at the start or the end of the item.
* Add `removeChoice` method.
* Improve rendering performance by batching changes.
* Provide original templates via a new argument to the `callbackOnCreateTemplates` callback. #1149
* Templates now render escaped html to innerHtml instead of switching to innerText when allowHtml config is false.
  This provides consistent rendering performance as innerText is quirky and slower than just inserting pure text into HTML.
* Add ``

### Bug Fixes

* Replace malicious polyfill with cdnjs. #1161
* Maintain groups in search mode. #1152
* Fix various "first press" bugs on single select dropdowns. #1104
* Fix 'esc' would close the dropdown and also apply to the container resulting in an overlay/modal unexpectedly closing. #1039
* Fix form reset would clear the choices list, but not clear the search bar. #1023
* Fix options would be disabled when choices.js was intialized on a disabled <select> element. #1025
* Fix a `search_term` element to appear in form submit data. #1049
* Fix 'remove item' button would trigger the change event twice due to placeholder value being used (match html single-select). #892
* Fix placeholder config option would be ignored for select boxes which have blank entries.
* Fix `data-custom-properties` attribute did not serialize to created elements as a json blob as expected.
* Fix multi-select not resizing correctly when an select option is selected on choices.js initialization.
* Fix clearInput function did not clear the last search
* Fix `addItemFilter` would allow empty strings as input to be added for items