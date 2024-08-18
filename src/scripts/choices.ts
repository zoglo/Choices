/* eslint-disable @typescript-eslint/no-explicit-any */
import { activateChoices, addChoice, removeChoice, clearChoices, filterChoices } from './actions/choices';
import { addGroup } from './actions/groups';
import { addItem, highlightItem, removeItem } from './actions/items';
import { Container, Dropdown, Input, List, WrappedInput, WrappedSelect } from './components';
import { SELECT_MULTIPLE_TYPE, SELECT_ONE_TYPE, TEXT_TYPE } from './constants';
import { DEFAULT_CONFIG } from './defaults';
import { InputChoice } from './interfaces/input-choice';
import { InputGroup } from './interfaces/input-group';
import { Notice } from './interfaces/notice';
import { Options, ObjectsInConfig } from './interfaces/options';
import { StateChangeSet } from './interfaces/state';
import {
  diff,
  escapeForTemplate,
  generateId,
  getAdjacentEl,
  getClassNames,
  getClassNamesSelector,
  isScrolledIntoView,
  resolveNoticeFunction,
  resolveStringFunction,
  sanitise,
  sortByRank,
  strToEl,
} from './lib/utils';
import Store from './store/store';
import { mapInputToChoice } from './lib/choice-input';
import { ChoiceFull } from './interfaces/choice-full';
import { GroupFull } from './interfaces/group-full';
import { EventType, KeyCodeMap, PassedElementType } from './interfaces';
import { EventChoice } from './interfaces/event-choice';
import { NoticeType, NoticeTypes, Templates } from './interfaces/templates';
import { isHtmlInputElement, isHtmlSelectElement } from './lib/html-guard-statements';
import { Searcher } from './interfaces/search';
import { getSearcher } from './search';
import { StringUntrusted } from './interfaces/string-untrusted';
import { StringPreEscaped } from './interfaces/string-pre-escaped';
// eslint-disable-next-line import/no-named-default
import { default as defaultTemplates } from './templates';

/** @see {@link http://browserhacks.com/#hack-acea075d0ac6954f275a70023906050c} */
const IS_IE11 =
  '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style;

const USER_DEFAULTS: Partial<Options> = {};

const parseDataSetId = (element?: HTMLElement): number | undefined => {
  if (!element) {
    return undefined;
  }

  const { id } = element.dataset;

  return id ? parseInt(id, 10) : undefined;
};

/**
 * Choices
 * @author Josh Johnson<josh@joshuajohnson.co.uk>
 */
class Choices {
  static version: string = '__VERSION__';

  static get defaults(): {
    options: Partial<Options>;
    allOptions: Options;
    templates: Templates;
  } {
    return Object.preventExtensions({
      get options(): Partial<Options> {
        return USER_DEFAULTS;
      },
      get allOptions(): Options {
        return DEFAULT_CONFIG;
      },
      get templates(): Templates {
        return defaultTemplates;
      },
    });
  }

  initialised: boolean;

  initialisedOK?: boolean = undefined;

  config: Options;

  passedElement: WrappedInput | WrappedSelect;

  containerOuter: Container;

  containerInner: Container;

  choiceList: List;

  itemList: List;

  input: Input;

  dropdown: Dropdown;

  _elementType: PassedElementType;

  _isTextElement: boolean;

  _isSelectOneElement: boolean;

  _isSelectMultipleElement: boolean;

  _isSelectElement: boolean;

  _hasNonChoicePlaceholder: boolean = false;

  _canAddUserChoices: boolean;

  _store: Store;

  _templates: Templates;

  _lastAddedChoiceId: number = 0;

  _lastAddedGroupId: number = 0;

  _currentValue: string;

  _canSearch: boolean;

  _isScrollingOnIe: boolean;

  _highlightPosition: number;

  _wasTap: boolean;

  _isSearching: boolean;

  _placeholderValue: string | null;

  _baseId: string;

  _direction: HTMLElement['dir'];

  _idNames: {
    itemChoice: string;
  };

  _presetChoices: (ChoiceFull | GroupFull)[];

  _initialItems: string[];

  _searcher: Searcher<ChoiceFull>;

  _notice?: {
    type: NoticeType;
    text: StringUntrusted | StringPreEscaped | string;
  };

  _docRoot: ShadowRoot | HTMLElement;

  constructor(
    element: string | Element | HTMLInputElement | HTMLSelectElement = '[data-choice]',
    userConfig: Partial<Options> = {},
  ) {
    const { defaults } = Choices;
    this.config = {
      ...defaults.allOptions,
      ...defaults.options,
      ...userConfig,
    } as Options;
    ObjectsInConfig.forEach((key) => {
      this.config[key] = {
        ...defaults.allOptions[key],
        ...defaults.options[key],
        ...userConfig[key],
      };
    });

    const { config } = this;
    if (!config.silent) {
      this._validateConfig();
    }

    const docRoot = config.shadowRoot || document.documentElement;
    this._docRoot = docRoot;
    const passedElement = typeof element === 'string' ? docRoot.querySelector(element) : element;

    if (
      !passedElement ||
      typeof passedElement !== 'object' ||
      !(isHtmlInputElement(passedElement) || isHtmlSelectElement(passedElement))
    ) {
      if (!passedElement && typeof element === 'string') {
        throw TypeError(`Selector ${element} failed to find an element`);
      }
      throw TypeError(`Expected one of the following types text|select-one|select-multiple`);
    }

    this._elementType = passedElement.type as PassedElementType;
    this._isTextElement = this._elementType === TEXT_TYPE;
    if (this._isTextElement || config.maxItemCount !== 1) {
      config.singleModeForMultiSelect = false;
    }
    if (config.singleModeForMultiSelect) {
      this._elementType = SELECT_MULTIPLE_TYPE;
    }
    this._isSelectOneElement = this._elementType === SELECT_ONE_TYPE;
    this._isSelectMultipleElement = this._elementType === SELECT_MULTIPLE_TYPE;
    this._isSelectElement = this._isSelectOneElement || this._isSelectMultipleElement;
    this._canAddUserChoices = (this._isTextElement && config.addItems) || (this._isSelectElement && config.addChoices);
    if (!['auto', 'always'].includes(`${config.renderSelectedChoices}`)) {
      config.renderSelectedChoices = 'auto';
    }

    if (!['auto', true, false].includes(config.closeDropdownOnSelect)) {
      config.closeDropdownOnSelect = 'auto';
    }
    if (config.closeDropdownOnSelect === 'auto') {
      config.closeDropdownOnSelect = this._isTextElement || this._isSelectOneElement || config.singleModeForMultiSelect;
    }

    if (config.placeholder) {
      if (config.placeholderValue) {
        this._hasNonChoicePlaceholder = true;
      } else if (passedElement.dataset.placeholder) {
        this._hasNonChoicePlaceholder = true;
        config.placeholderValue = passedElement.dataset.placeholder;
      }
    }

    if (userConfig.addItemFilter && typeof userConfig.addItemFilter !== 'function') {
      const re =
        userConfig.addItemFilter instanceof RegExp ? userConfig.addItemFilter : new RegExp(userConfig.addItemFilter);

      config.addItemFilter = re.test.bind(re);
    }

    if (this._isTextElement) {
      this.passedElement = new WrappedInput({
        element: passedElement as HTMLInputElement,
        classNames: config.classNames,
      });
    } else {
      const selectEl = passedElement as HTMLSelectElement;
      this.passedElement = new WrappedSelect({
        element: selectEl,
        classNames: config.classNames,
        template: (data: ChoiceFull): HTMLOptionElement => this._templates.option(data),
        extractPlaceholder: config.placeholder && !this._hasNonChoicePlaceholder,
      });
    }

    this.initialised = false;

    this._store = new Store();
    this._currentValue = '';
    config.searchEnabled = (!this._isTextElement && config.searchEnabled) || this._elementType === SELECT_MULTIPLE_TYPE;
    this._canSearch = config.searchEnabled;
    this._isScrollingOnIe = false;
    this._highlightPosition = 0;
    this._wasTap = true;
    this._placeholderValue = this._generatePlaceholderValue();
    this._baseId = generateId(passedElement, 'choices-');

    /**
     * setting direction in cases where it's explicitly set on passedElement
     * or when calculated direction is different from the document
     */
    this._direction = this.passedElement.dir;

    if (!this._direction) {
      const { direction: elementDirection } = window.getComputedStyle(this.passedElement.element);
      const { direction: documentDirection } = window.getComputedStyle(document.documentElement);
      if (elementDirection !== documentDirection) {
        this._direction = elementDirection;
      }
    }

    this._idNames = {
      itemChoice: 'item-choice',
    };

    this._templates = defaults.templates;
    this._render = this._render.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onFormReset = this._onFormReset.bind(this);
    this._onSelectKey = this._onSelectKey.bind(this);
    this._onEnterKey = this._onEnterKey.bind(this);
    this._onEscapeKey = this._onEscapeKey.bind(this);
    this._onDirectionKey = this._onDirectionKey.bind(this);
    this._onDeleteKey = this._onDeleteKey.bind(this);

    // If element has already been initialised with Choices, fail silently
    if (this.passedElement.isActive) {
      if (!config.silent) {
        console.warn('Trying to initialise Choices on element already initialised', { element });
      }

      this.initialised = true;
      this.initialisedOK = false;

      return;
    }

    // Let's go
    this.init();
    // preserve the selected item list after setup for form reset
    this._initialItems = this._store.items.map((choice) => choice.value);
  }

  init(): void {
    if (this.initialised || this.initialisedOK !== undefined) {
      return;
    }

    this._searcher = getSearcher<ChoiceFull>(this.config);
    this._loadChoices();
    this._createTemplates();
    this._createElements();
    this._createStructure();

    if (
      (this._isTextElement && !this.config.addItems) ||
      this.passedElement.element.hasAttribute('disabled') ||
      !!this.passedElement.element.closest('fieldset:disabled')
    ) {
      this.disable();
    } else {
      this.enable();
      this._addEventListeners();
    }

    // should be triggered **after** disabled state to avoid additional re-draws
    this._initStore();

    this.initialised = true;
    this.initialisedOK = true;

    const { callbackOnInit } = this.config;
    // Run callback if it is a function
    if (callbackOnInit && typeof callbackOnInit === 'function') {
      callbackOnInit.call(this);
    }
  }

  destroy(): void {
    if (!this.initialised) {
      return;
    }

    this._removeEventListeners();
    this.passedElement.reveal();
    this.containerOuter.unwrap(this.passedElement.element);

    this._store._listeners = []; // prevents select/input value being wiped
    this.clearStore();
    this._stopSearch();

    this._templates = Choices.defaults.templates;
    this.initialised = false;
    this.initialisedOK = undefined;
  }

  enable(): this {
    const { passedElement, containerOuter } = this;

    if (passedElement.isDisabled) {
      passedElement.enable();
    }

    if (containerOuter.isDisabled) {
      this._addEventListeners();
      this.input.enable();
      containerOuter.enable();

      this._render();
    }

    return this;
  }

  disable(): this {
    const { passedElement, containerOuter } = this;

    if (!passedElement.isDisabled) {
      passedElement.disable();
    }

    if (!containerOuter.isDisabled) {
      this._removeEventListeners();
      this.input.disable();
      containerOuter.disable();

      this._render();
    }

    return this;
  }

  highlightItem(item: InputChoice, runEvent = true): this {
    if (!item || !item.id) {
      return this;
    }
    const choice = this._store.choices.find((c) => c.id === item.id);
    if (!choice || choice.highlighted) {
      return this;
    }

    this._store.dispatch(highlightItem(choice, true));

    if (runEvent) {
      this.passedElement.triggerEvent(EventType.highlightItem, this._getChoiceForOutput(choice));
    }

    return this;
  }

  unhighlightItem(item: InputChoice, runEvent = true): this {
    if (!item || !item.id) {
      return this;
    }
    const choice = this._store.choices.find((c) => c.id === item.id);
    if (!choice || !choice.highlighted) {
      return this;
    }

    this._store.dispatch(highlightItem(choice, false));

    if (runEvent) {
      this.passedElement.triggerEvent(EventType.highlightItem, this._getChoiceForOutput(choice));
    }

    return this;
  }

  highlightAll(): this {
    this._store.withTxn(() => {
      this._store.items.forEach((item) => this.highlightItem(item));
    });

    return this;
  }

  unhighlightAll(): this {
    this._store.withTxn(() => {
      this._store.items.forEach((item) => this.unhighlightItem(item));
    });

    return this;
  }

  removeActiveItemsByValue(value: string): this {
    this._store.withTxn(() => {
      this._store.items.filter((item) => item.value === value).forEach((item) => this._removeItem(item));
    });

    return this;
  }

  removeActiveItems(excludedId: number): this {
    this._store.withTxn(() => {
      this._store.items.filter(({ id }) => id !== excludedId).forEach((item) => this._removeItem(item));
    });

    return this;
  }

  removeHighlightedItems(runEvent = false): this {
    this._store.withTxn(() => {
      this._store.highlightedActiveItems.forEach((item) => {
        this._removeItem(item);
        // If this action was performed by the user
        // trigger the event
        if (runEvent) {
          this._triggerChange(item.value);
        }
      });
    });

    return this;
  }

  showDropdown(preventInputFocus?: boolean): this {
    if (this.dropdown.isActive) {
      return this;
    }

    requestAnimationFrame(() => {
      this.dropdown.show();
      this.containerOuter.open(this.dropdown.distanceFromTopWindow);

      if (!preventInputFocus && this._canSearch) {
        this.input.focus();
      }

      this.passedElement.triggerEvent(EventType.showDropdown);
    });

    return this;
  }

  hideDropdown(preventInputBlur?: boolean): this {
    if (!this.dropdown.isActive) {
      return this;
    }

    requestAnimationFrame(() => {
      this.dropdown.hide();
      this.containerOuter.close();

      if (!preventInputBlur && this._canSearch) {
        this.input.removeActiveDescendant();
        this.input.blur();
      }

      this.passedElement.triggerEvent(EventType.hideDropdown);
    });

    return this;
  }

  getValue(valueOnly = false): string[] | EventChoice[] | EventChoice | string {
    const values = this._store.items.reduce<any[]>((selectedItems, item) => {
      const itemValue = valueOnly ? item.value : this._getChoiceForOutput(item);
      selectedItems.push(itemValue);

      return selectedItems;
    }, []);

    return this._isSelectOneElement || this.config.singleModeForMultiSelect ? values[0] : values;
  }

  setValue(items: string[] | InputChoice[]): this {
    if (!this.initialisedOK) {
      this._warnChoicesInitFailed('setValue');

      return this;
    }

    this._store.withTxn(() => {
      items.forEach((value: string | InputChoice) => {
        if (value) {
          this._addChoice(mapInputToChoice(value, false));
        }
      });
    });

    // @todo integrate with Store
    this._searcher.reset();

    return this;
  }

  setChoiceByValue(value: string | string[]): this {
    if (!this.initialisedOK) {
      this._warnChoicesInitFailed('setChoiceByValue');

      return this;
    }
    if (this._isTextElement) {
      return this;
    }
    this._store.withTxn(() => {
      // If only one value has been passed, convert to array
      const choiceValue = Array.isArray(value) ? value : [value];

      // Loop through each value and
      choiceValue.forEach((val) => this._findAndSelectChoiceByValue(val));
    });

    // @todo integrate with Store
    this._searcher.reset();

    return this;
  }

  /**
   * Set choices of select input via an array of objects (or function that returns array of object or promise of it),
   * a value field name and a label field name.
   * This behaves the same as passing items via the choices option but can be called after initialising Choices.
   * This can also be used to add groups of choices (see example 2); Optionally pass a true `replaceChoices` value to remove any existing choices.
   * Optionally pass a `customProperties` object to add additional data to your choices (useful when searching/filtering etc).
   *
   * **Input types affected:** select-one, select-multiple
   *
   * @example
   * ```js
   * const example = new Choices(element);
   *
   * example.setChoices([
   *   {value: 'One', label: 'Label One', disabled: true},
   *   {value: 'Two', label: 'Label Two', selected: true},
   *   {value: 'Three', label: 'Label Three'},
   * ], 'value', 'label', false);
   * ```
   *
   * @example
   * ```js
   * const example = new Choices(element);
   *
   * example.setChoices(async () => {
   *   try {
   *      const items = await fetch('/items');
   *      return items.json()
   *   } catch(err) {
   *      console.error(err)
   *   }
   * });
   * ```
   *
   * @example
   * ```js
   * const example = new Choices(element);
   *
   * example.setChoices([{
   *   label: 'Group one',
   *   id: 1,
   *   disabled: false,
   *   choices: [
   *     {value: 'Child One', label: 'Child One', selected: true},
   *     {value: 'Child Two', label: 'Child Two',  disabled: true},
   *     {value: 'Child Three', label: 'Child Three'},
   *   ]
   * },
   * {
   *   label: 'Group two',
   *   id: 2,
   *   disabled: false,
   *   choices: [
   *     {value: 'Child Four', label: 'Child Four', disabled: true},
   *     {value: 'Child Five', label: 'Child Five'},
   *     {value: 'Child Six', label: 'Child Six', customProperties: {
   *       description: 'Custom description about child six',
   *       random: 'Another random custom property'
   *     }},
   *   ]
   * }], 'value', 'label', false);
   * ```
   */
  setChoices(
    choicesArrayOrFetcher:
      | (InputChoice | InputGroup)[]
      | ((instance: Choices) => (InputChoice | InputGroup)[] | Promise<(InputChoice | InputGroup)[]>) = [],
    value: string | null = 'value',
    label = 'label',
    replaceChoices = false,
  ): this | Promise<this> {
    if (!this.initialisedOK) {
      this._warnChoicesInitFailed('setChoices');

      return this;
    }
    if (!this._isSelectElement) {
      throw new TypeError(`setChoices can't be used with INPUT based Choices`);
    }

    if (typeof value !== 'string' || !value) {
      throw new TypeError(`value parameter must be a name of 'value' field in passed objects`);
    }

    // Clear choices if needed
    if (replaceChoices) {
      this.clearChoices();
    }

    if (typeof choicesArrayOrFetcher === 'function') {
      // it's a choices fetcher function
      const fetcher = choicesArrayOrFetcher(this);

      if (typeof Promise === 'function' && fetcher instanceof Promise) {
        // that's a promise
        // eslint-disable-next-line no-promise-executor-return
        return new Promise((resolve) => requestAnimationFrame(resolve))
          .then(() => this._handleLoadingState(true))
          .then(() => fetcher)
          .then((data: InputChoice[]) => this.setChoices(data, value, label, replaceChoices))
          .catch((err) => {
            if (!this.config.silent) {
              console.error(err);
            }
          })
          .then(() => this._handleLoadingState(false))
          .then(() => this);
      }

      // function returned something else than promise, let's check if it's an array of choices
      if (!Array.isArray(fetcher)) {
        throw new TypeError(
          `.setChoices first argument function must return either array of choices or Promise, got: ${typeof fetcher}`,
        );
      }

      // recursion with results, it's sync and choices were cleared already
      return this.setChoices(fetcher, value, label, false);
    }

    if (!Array.isArray(choicesArrayOrFetcher)) {
      throw new TypeError(
        `.setChoices must be called either with array of choices with a function resulting into Promise of array of choices`,
      );
    }

    this.containerOuter.removeLoadingState();

    this._store.withTxn(() => {
      const isDefaultValue = value === 'value';
      const isDefaultLabel = label === 'label';

      choicesArrayOrFetcher.forEach((groupOrChoice: InputGroup | InputChoice) => {
        if ('choices' in groupOrChoice) {
          let group = groupOrChoice;
          if (!isDefaultLabel) {
            group = {
              ...group,
              label: group[label],
            } as InputGroup;
          }

          this._addGroup(mapInputToChoice(group, true));
        } else {
          let choice = groupOrChoice;
          if (!isDefaultLabel || !isDefaultValue) {
            choice = {
              ...choice,
              value: choice[value],
              label: choice[label],
            } as InputChoice;
          }
          this._addChoice(mapInputToChoice(choice, false));
        }
      });
    });

    // @todo integrate with Store
    this._searcher.reset();

    return this;
  }

  refresh(withEvents: boolean = false, selectFirstOption: boolean = false, deselectAll: boolean = false): this {
    if (!this._isSelectElement) {
      if (!this.config.silent) {
        console.warn('refresh method can only be used on choices backed by a <select> element');
      }

      return this;
    }

    this._store.withTxn(() => {
      const choicesFromOptions = (this.passedElement as WrappedSelect).optionsAsChoices();

      const { items } = this._store;
      // Build the list of items which require preserving
      const existingItems = {};
      if (!deselectAll) {
        items.forEach((choice) => {
          if (choice.id && choice.active && choice.selected && !choice.disabled) {
            existingItems[choice.value] = true;
          }
        });
      }

      choicesFromOptions.forEach((groupOrChoice) => {
        if ('choices' in groupOrChoice) {
          return;
        }

        const choice = groupOrChoice;
        if (deselectAll) {
          choice.selected = false;
        } else if (existingItems[choice.value]) {
          choice.selected = true;
        }
      });

      this.clearStore();
      /* @todo only generate add events for the added options instead of all
      if (withEvents) {
        items.forEach((choice) => {
          if (existingItems[choice.value]) {
            this.passedElement.triggerEvent(
              EventType.removeItem,
              this._getChoiceForEvent(choice),
            );
          }
        });
      }
      */

      // load new choices & items
      this._addPredefinedChoices(choicesFromOptions, selectFirstOption, withEvents);

      // re-do search if required
      if (this._isSearching) {
        this._searchChoices(this.input.value);
      }
    });

    return this;
  }

  removeChoice(value: string): this {
    const choice = this._store.choices.find((c) => c.value === value);
    if (!choice) {
      return this;
    }
    this._store.dispatch(removeChoice(choice));
    // @todo integrate with Store
    this._searcher.reset();

    if (choice.selected) {
      this.passedElement.triggerEvent(EventType.removeItem, this._getChoiceForOutput(choice));
    }

    return this;
  }

  clearChoices(): this {
    this.passedElement.element.innerHTML = '';
    this._store.dispatch(clearChoices());
    // @todo integrate with Store
    this._searcher.reset();

    return this;
  }

  clearStore(): this {
    this._store.reset();
    this._lastAddedChoiceId = 0;
    this._lastAddedGroupId = 0;
    // @todo integrate with Store
    this._searcher.reset();

    return this;
  }

  clearInput(): this {
    const shouldSetInputWidth = !this._isSelectOneElement;
    this.input.clear(shouldSetInputWidth);
    this._clearNotice();

    if (this._isSearching) {
      this._stopSearch();
    }

    return this;
  }

  _validateConfig(): void {
    const { config } = this;
    const invalidConfigOptions = diff(config, DEFAULT_CONFIG);
    if (invalidConfigOptions.length) {
      console.warn('Unknown config option(s) passed', invalidConfigOptions.join(', '));
    }

    if (config.allowHTML && config.allowHtmlUserInput) {
      if (config.addItems) {
        console.warn(
          'Warning: allowHTML/allowHtmlUserInput/addItems all being true is strongly not recommended and may lead to XSS attacks',
        );
      }
      if (config.addChoices) {
        console.warn(
          'Warning: allowHTML/allowHtmlUserInput/addChoices all being true is strongly not recommended and may lead to XSS attacks',
        );
      }
    }
  }

  _render(changes: StateChangeSet = { choices: true, groups: true, items: true }): void {
    if (this._store.inTxn()) {
      return;
    }

    if (changes.choices || changes.groups) {
      this._renderChoices();
    }

    if (changes.items) {
      this._renderItems();
    }
  }

  _renderChoices(): void {
    const { config } = this;
    const { activeGroups, activeChoices } = this._store;
    let choiceListFragment = document.createDocumentFragment();

    this.choiceList.clear();

    if (config.resetScrollPosition) {
      requestAnimationFrame(() => this.choiceList.scrollToTop());
    }

    // If we have grouped options
    if (activeGroups.length >= 1 && !this._isSearching) {
      if (!this._hasNonChoicePlaceholder) {
        // If we have a placeholder choice along with groups
        const activePlaceholders = activeChoices.filter(
          (activeChoice) => activeChoice.placeholder && activeChoice.groupId === -1,
        );
        if (activePlaceholders.length >= 1) {
          choiceListFragment = this._createChoicesFragment(activePlaceholders, choiceListFragment);
        }
      }
      choiceListFragment = this._createGroupsFragment(activeGroups, activeChoices, choiceListFragment);
    } else if (activeChoices.length >= 1) {
      choiceListFragment = this._createChoicesFragment(activeChoices, choiceListFragment);
    }

    const noChoices = choiceListFragment.childNodes.length === 0;
    const notice = this._notice;
    if (noChoices) {
      if (!notice) {
        this._notice = {
          text: resolveStringFunction(config.noChoicesText),
          type: NoticeTypes.noChoices,
        };
      }
    } else if (notice && notice.type === NoticeTypes.noChoices) {
      this._notice = undefined;
    }

    this._renderNotice();

    if (!noChoices) {
      this.choiceList.append(choiceListFragment);
      this._highlightChoice();
    }
  }

  _renderItems(): void {
    const items = this._store.items || [];
    this.itemList.clear();

    // Create a fragment to store our list items
    // (so we don't have to update the DOM for each item)
    const itemListFragment = this._createItemsFragment(items);

    // If we have items to add, append them
    if (itemListFragment.childNodes.length !== 0) {
      this.itemList.append(itemListFragment);
    }
  }

  _createGroupsFragment(
    groups: GroupFull[],
    choices: ChoiceFull[],
    fragment: DocumentFragment = document.createDocumentFragment(),
  ): DocumentFragment {
    const { config } = this;
    const getGroupChoices = (group: GroupFull): ChoiceFull[] =>
      choices.filter((choice) => {
        if (this._isSelectOneElement) {
          return choice.groupId === group.id;
        }

        return choice.groupId === group.id && (config.renderSelectedChoices === 'always' || !choice.selected);
      });

    // If sorting is enabled, filter groups
    if (config.shouldSort) {
      groups.sort(config.sorter);
    }

    // Add Choices without group first, regardless of sort, otherwise they won't be distinguishable
    // from the last group
    const choicesWithoutGroup = choices.filter((c) => c.groupId === 0);
    if (choicesWithoutGroup.length > 0) {
      this._createChoicesFragment(choicesWithoutGroup, fragment, false);
    }

    groups.forEach((group) => {
      const groupChoices = getGroupChoices(group);
      if (groupChoices.length >= 1) {
        const dropdownGroup = this._templates.choiceGroup(this.config, group);
        fragment.appendChild(dropdownGroup);
        this._createChoicesFragment(groupChoices, fragment, true);
      }
    });

    return fragment;
  }

  _createChoicesFragment(
    choices: ChoiceFull[],
    fragment: DocumentFragment = document.createDocumentFragment(),
    withinGroup = false,
  ): DocumentFragment {
    // Create a fragment to store our list items (so we don't have to update the DOM for each item)
    const { config } = this;
    const { renderSelectedChoices, searchResultLimit, renderChoiceLimit } = config;
    const groupLookup: string[] = [];
    const appendGroupInSearch = config.appendGroupInSearch && this._isSearching;
    if (appendGroupInSearch) {
      this._store.groups.forEach((group) => {
        groupLookup[group.id] = group.label;
      });
    }

    const appendChoice = (choice: ChoiceFull): void => {
      const shouldRender = renderSelectedChoices === 'auto' ? this._isSelectOneElement || !choice.selected : true;

      if (shouldRender) {
        const dropdownItem = this._templates.choice(config, choice, config.itemSelectText);
        if (appendGroupInSearch && choice.groupId > 0) {
          const groupName: string | undefined = groupLookup[choice.groupId];
          if (groupName) {
            dropdownItem.innerHTML += ` (${groupName})`;
          }
        }
        fragment.appendChild(dropdownItem);
      }
    };

    let rendererableChoices = choices;

    if (renderSelectedChoices === 'auto' && !this._isSelectOneElement) {
      rendererableChoices = choices.filter((choice) => !choice.selected);
    }

    if (this._isSelectElement) {
      const backingOptions = choices.filter((choice) => !choice.element);
      if (backingOptions.length !== 0) {
        (this.passedElement as WrappedSelect).addOptions(backingOptions);
      }
    }

    const placeholderChoices: ChoiceFull[] = [];
    let normalChoices: ChoiceFull[] = [];
    if (this._hasNonChoicePlaceholder) {
      normalChoices = rendererableChoices;
    } else {
      // Split array into placeholders and "normal" choices
      rendererableChoices.forEach((choice) => {
        if (choice.placeholder) {
          placeholderChoices.push(choice);
        } else {
          normalChoices.push(choice);
        }
      });
    }

    if (this._isSearching) {
      // sortByRank is used to ensure stable sorting, as scores are non-unique
      // this additionally ensures fuseOptions.sortFn is not ignored
      normalChoices.sort(sortByRank);
    } else if (config.shouldSort) {
      normalChoices.sort(config.sorter);
    }

    let choiceLimit = rendererableChoices.length;

    const sortedChoices =
      this._isSelectOneElement && placeholderChoices.length !== 0
        ? [...placeholderChoices, ...normalChoices]
        : normalChoices;

    if (this._isSearching) {
      choiceLimit = searchResultLimit;
    } else if (renderChoiceLimit && renderChoiceLimit > 0 && !withinGroup) {
      choiceLimit = renderChoiceLimit;
    }

    // Add each choice to dropdown within range
    for (let i = 0; i < choiceLimit; i += 1) {
      if (sortedChoices[i]) {
        appendChoice(sortedChoices[i]);
      }
    }

    return fragment;
  }

  _createItemsFragment(
    items: InputChoice[],
    fragment: DocumentFragment = document.createDocumentFragment(),
  ): DocumentFragment {
    // Create fragment to add elements to
    const { config } = this;
    const { shouldSortItems, sorter, removeItemButton, delimiter } = config;

    // If sorting is enabled, filter items
    if (shouldSortItems && !this._isSelectOneElement) {
      items.sort(sorter);
    }

    if (this._isTextElement) {
      // Update the value of the hidden input
      this.passedElement.value = items.map(({ value }) => value).join(delimiter);
    }

    const addItemToFragment = (item: ChoiceFull): void => {
      // Create new list element
      const listItem = this._templates.item(config, item, removeItemButton);
      // Append it to list
      fragment.appendChild(listItem);
    };

    // Add each list item to list
    items.forEach(addItemToFragment);

    if (this._isSelectOneElement && this._hasNonChoicePlaceholder && items.length === 0) {
      addItemToFragment(
        mapInputToChoice<InputChoice>(
          {
            selected: true,
            value: '',
            label: this.config.placeholderValue || '',
            active: true,
            placeholder: true,
          },
          false,
        ),
      );
    }

    return fragment;
  }

  _displayNotice(
    text: StringUntrusted | StringPreEscaped | string,
    type: NoticeType,
    openDropdown: boolean = true,
  ): void {
    const oldNotice = this._notice;
    if (
      oldNotice &&
      ((oldNotice.type === type && oldNotice.text === text) ||
        (oldNotice.type === NoticeTypes.addChoice &&
          (type === NoticeTypes.noResults || type === NoticeTypes.noChoices)))
    ) {
      if (openDropdown) {
        this.showDropdown(true);
      }

      return;
    }

    this._clearNotice();

    this._notice = text
      ? {
          text,
          type,
        }
      : undefined;

    this._renderNotice();

    if (openDropdown && text) {
      this.showDropdown(true);
    }
  }

  _clearNotice(): void {
    if (!this._notice) {
      return;
    }

    const noticeElement = this.choiceList.element.querySelector(getClassNamesSelector(this.config.classNames.notice));
    if (noticeElement) {
      noticeElement.remove();
    }

    this._notice = undefined;
  }

  _renderNotice(): void {
    const noticeConf = this._notice;
    if (noticeConf) {
      const notice = this._templates.notice(this.config, noticeConf.text, noticeConf.type);
      this.choiceList.prepend(notice);
    }
  }

  _getChoiceForOutput(choice?: ChoiceFull, keyCode?: number): EventChoice | undefined {
    if (!choice) {
      return undefined;
    }

    const group = choice.groupId > 0 ? this._store.getGroupById(choice.groupId) : null;

    return {
      id: choice.id,
      highlighted: choice.highlighted,
      labelClass: choice.labelClass,
      labelDescription: choice.labelDescription,
      customProperties: choice.customProperties,
      disabled: choice.disabled,
      active: choice.active,
      label: choice.label,
      placeholder: choice.placeholder,
      value: choice.value,
      groupValue: group && group.label ? group.label : undefined,
      element: choice.element,
      keyCode,
    };
  }

  _triggerChange(value): void {
    if (value === undefined || value === null) {
      return;
    }

    this.passedElement.triggerEvent(EventType.change, {
      value,
    });
  }

  _handleButtonAction(element?: HTMLElement): void {
    const { items } = this._store;
    if (items.length === 0 || !this.config.removeItems || !this.config.removeItemButton) {
      return;
    }

    const id = element && parseDataSetId(element.parentNode as HTMLElement);
    const itemToRemove = id && items.find((item) => item.id === id);
    if (!itemToRemove) {
      return;
    }

    // Remove item associated with button
    this._removeItem(itemToRemove);
    this._triggerChange(itemToRemove.value);

    if (this._isSelectOneElement && !this._hasNonChoicePlaceholder) {
      const placeholderChoice = this._store.choices.reverse().find((choice) => !choice.disabled && choice.placeholder);
      if (placeholderChoice) {
        this._addItem(placeholderChoice);
        if (placeholderChoice.value) {
          this._triggerChange(placeholderChoice.value);
        }
      }
    }
  }

  _handleItemAction(element?: HTMLElement, hasShiftKey = false): void {
    const { items } = this._store;
    if (items.length === 0 || !this.config.removeItems || this._isSelectOneElement) {
      return;
    }

    const id = parseDataSetId(element);
    if (!id) {
      return;
    }

    // We only want to select one item with a click
    // so we deselect any items that aren't the target
    // unless shift is being pressed
    items.forEach((item) => {
      if (item.id === id && !item.highlighted) {
        this.highlightItem(item);
      } else if (!hasShiftKey && item.highlighted) {
        this.unhighlightItem(item);
      }
    });

    // Focus input as without focus, a user cannot do anything with a
    // highlighted item
    this.input.focus();
  }

  _handleChoiceAction(element?: HTMLElement): boolean {
    // If we are clicking on an option
    const id = parseDataSetId(element);
    const choice = id && this._store.getChoiceById(id);
    if (!choice || choice.disabled) {
      return false;
    }

    const hasActiveDropdown = this.dropdown.isActive;

    if (!choice.selected) {
      const canAddItem = this._canAddItem(choice.value);
      if (!canAddItem.response) {
        return false;
      }

      this._store.withTxn(() => {
        this._addItem(choice, true, true);

        this.clearInput();
        this.unhighlightAll();
      });

      this._triggerChange(choice.value);
    }

    // We want to close the dropdown if we are dealing with a single select box
    if (hasActiveDropdown && this.config.closeDropdownOnSelect) {
      this.hideDropdown(true);
      this.containerOuter.element.focus();
    }

    return true;
  }

  _handleBackspace(items: ChoiceFull[]): void {
    const { config } = this;
    if (!config.removeItems || items.length === 0) {
      return;
    }

    const lastItem = items[items.length - 1];
    const hasHighlightedItems = items.some((item) => item.highlighted);

    // If editing the last item is allowed and there are not other selected items,
    // we can edit the item value. Otherwise if we can remove items, remove all selected items
    if (config.editItems && !hasHighlightedItems && lastItem) {
      this.input.value = lastItem.value;
      this.input.setWidth();
      this._removeItem(lastItem);
      this._triggerChange(lastItem.value);
    } else {
      if (!hasHighlightedItems) {
        // Highlight last item if none already highlighted
        this.highlightItem(lastItem, false);
      }
      this.removeHighlightedItems(true);
    }
  }

  _loadChoices(): void {
    const { config } = this;
    if (this._isTextElement) {
      // Assign preset items from passed object first
      this._presetChoices = config.items.map((e: InputChoice | string) => mapInputToChoice(e, false));
      // Add any values passed from attribute
      const { value } = this.passedElement;
      if (value) {
        const elementItems: ChoiceFull[] = value
          .split(config.delimiter)
          .map((e: InputChoice | string) => mapInputToChoice(e, false));
        this._presetChoices = this._presetChoices.concat(elementItems);
      }
      this._presetChoices.forEach((choice: ChoiceFull) => {
        choice.selected = true;
      });
    } else if (this._isSelectElement) {
      // Assign preset choices from passed object
      this._presetChoices = config.choices.map((e: InputChoice) => mapInputToChoice(e, true));
      // Create array of choices from option elements
      const choicesFromOptions = (this.passedElement as WrappedSelect).optionsAsChoices();
      if (choicesFromOptions) {
        this._presetChoices.push(...choicesFromOptions);
      }
    }
  }

  _handleLoadingState(setLoading = true): void {
    const { config } = this;
    let placeholderItem: HTMLElement | null = this.itemList.element.querySelector(
      getClassNamesSelector(config.classNames.placeholder),
    );

    if (setLoading) {
      this.disable();
      this.containerOuter.addLoadingState();

      if (this._isSelectOneElement) {
        if (!placeholderItem) {
          placeholderItem = this._templates.placeholder(config, config.loadingText);

          if (placeholderItem) {
            this.itemList.append(placeholderItem);
          }
        } else {
          placeholderItem.innerHTML = config.loadingText;
        }
      } else {
        this.input.placeholder = config.loadingText;
      }
    } else {
      this.enable();
      this.containerOuter.removeLoadingState();

      if (this._isSelectOneElement) {
        if (placeholderItem) {
          placeholderItem.innerHTML = this._placeholderValue || '';
        }
      } else {
        this.input.placeholder = this._placeholderValue || '';
      }
    }
  }

  _handleSearch(value?: string): void {
    if (!this.input.isFocussed) {
      return;
    }

    const { choices } = this._store;
    const { searchFloor, searchChoices } = this.config;
    const hasUnactiveChoices = choices.some((option) => !option.active);

    // Check that we have a value to search and the input was an alphanumeric character
    if (value !== null && typeof value !== 'undefined' && value.length >= searchFloor) {
      const resultCount = searchChoices ? this._searchChoices(value) : 0;
      if (resultCount !== null) {
        // Trigger search event
        this.passedElement.triggerEvent(EventType.search, {
          value,
          resultCount,
        });
      }
    } else if (hasUnactiveChoices) {
      this._stopSearch();
    }
  }

  _canAddItem(value: string): Notice {
    const { config } = this;
    let canAddItem = true;
    let notice = '';
    const { items } = this._store;

    if (config.maxItemCount > 0 && config.maxItemCount <= items.length) {
      // If there is a max entry limit and we have reached that limit
      // don't update
      if (!config.singleModeForMultiSelect) {
        canAddItem = false;
        notice =
          typeof config.maxItemText === 'function' ? config.maxItemText(config.maxItemCount) : config.maxItemText;
      }
    }

    if (value === '') {
      return {
        response: canAddItem,
        notice,
      };
    }

    if (
      canAddItem &&
      this._canAddUserChoices &&
      typeof config.addItemFilter === 'function' &&
      !config.addItemFilter(value)
    ) {
      canAddItem = false;
      notice = resolveNoticeFunction(config.customAddItemText, value);
    }

    if (canAddItem) {
      const foundChoice = this._store.items.find((choice) => config.valueComparer(choice.value, value));
      if (this._isSelectElement) {
        // for exact matches, do not prompt to add it as a custom choice
        if (foundChoice) {
          return {
            response: true,
            notice: '',
          };
        }
      } else if (this._isTextElement && !config.duplicateItemsAllowed) {
        if (foundChoice) {
          canAddItem = false;
          notice = resolveNoticeFunction(config.uniqueItemText, value);
        }
      }
    }

    if (canAddItem) {
      notice = resolveNoticeFunction(config.addItemText, value);
    }

    return {
      response: canAddItem,
      notice: notice ? { trusted: notice } : '',
    };
  }

  _searchChoices(value: string): number | null {
    const newValue = value.trim().replace(/\s{2,}/, ' ');

    // signal input didn't change search
    if (newValue.length === 0 || newValue === this._currentValue) {
      return null;
    }

    const searcher = this._searcher;
    if (searcher.isEmptyIndex()) {
      searcher.index(this._store.searchableChoices);
    }
    // If new value matches the desired length and is not the same as the current value with a space
    const results = searcher.search(newValue);

    this._currentValue = newValue;
    this._highlightPosition = 0;
    this._isSearching = true;

    const notice = this._notice;
    const noticeType = notice && notice.type;
    if (noticeType !== NoticeTypes.addChoice) {
      if (results.length === 0) {
        this._displayNotice(resolveStringFunction(this.config.noResultsText), NoticeTypes.noResults);
      } else if (noticeType === NoticeTypes.noResults) {
        this._clearNotice();
      }
    }

    this._store.dispatch(filterChoices(results));

    return results.length;
  }

  _stopSearch(): void {
    const wasSearching = this._isSearching;
    this._currentValue = '';
    this._isSearching = false;
    if (wasSearching) {
      this._store.dispatch(activateChoices(true));
    }
  }

  _addEventListeners(): void {
    const documentElement = this._docRoot;
    const outerElement = this.containerOuter.element;
    const inputElement = this.input.element;

    // capture events - can cancel event processing or propagation
    documentElement.addEventListener('touchend', this._onTouchEnd, true);
    outerElement.addEventListener('keydown', this._onKeyDown, true);
    outerElement.addEventListener('mousedown', this._onMouseDown, true);

    // passive events - doesn't call `preventDefault` or `stopPropagation`
    documentElement.addEventListener('click', this._onClick, { passive: true });
    documentElement.addEventListener('touchmove', this._onTouchMove, {
      passive: true,
    });
    this.dropdown.element.addEventListener('mouseover', this._onMouseOver, {
      passive: true,
    });

    if (this._isSelectOneElement) {
      outerElement.addEventListener('focus', this._onFocus, {
        passive: true,
      });
      outerElement.addEventListener('blur', this._onBlur, {
        passive: true,
      });
    }

    inputElement.addEventListener('keyup', this._onKeyUp, {
      passive: true,
    });
    inputElement.addEventListener('input', this._onInput, {
      passive: true,
    });

    inputElement.addEventListener('focus', this._onFocus, {
      passive: true,
    });
    inputElement.addEventListener('blur', this._onBlur, {
      passive: true,
    });

    if (inputElement.form) {
      inputElement.form.addEventListener('reset', this._onFormReset, {
        passive: true,
      });
    }

    this.input.addEventListeners();
  }

  _removeEventListeners(): void {
    const documentElement = this._docRoot;
    const outerElement = this.containerOuter.element;
    const inputElement = this.input.element;

    documentElement.removeEventListener('touchend', this._onTouchEnd, true);
    outerElement.removeEventListener('keydown', this._onKeyDown, true);
    outerElement.removeEventListener('mousedown', this._onMouseDown, true);

    documentElement.removeEventListener('click', this._onClick);
    documentElement.removeEventListener('touchmove', this._onTouchMove);
    this.dropdown.element.removeEventListener('mouseover', this._onMouseOver);

    if (this._isSelectOneElement) {
      outerElement.removeEventListener('focus', this._onFocus);
      outerElement.removeEventListener('blur', this._onBlur);
    }

    inputElement.removeEventListener('keyup', this._onKeyUp);
    inputElement.removeEventListener('input', this._onInput);
    inputElement.removeEventListener('focus', this._onFocus);
    inputElement.removeEventListener('blur', this._onBlur);

    if (inputElement.form) {
      inputElement.form.removeEventListener('reset', this._onFormReset);
    }

    this.input.removeEventListeners();
  }

  _onKeyDown(event: KeyboardEvent): void {
    const { keyCode } = event;
    const { items } = this._store;
    const hasFocusedInput = this.input.isFocussed;
    const hasActiveDropdown = this.dropdown.isActive;
    const hasItems = this.itemList.element.hasChildNodes();
    /*
    See:
    https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
    https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
    https://en.wikipedia.org/wiki/UTF-16#Code_points_from_U+010000_to_U+10FFFF - UTF-16 surrogate pairs
    https://stackoverflow.com/a/70866532 - "Unidentified" for mobile
    http://www.unicode.org/versions/Unicode5.2.0/ch16.pdf#G19635 - U+FFFF is reserved (Section 16.7)

    Logic: when a key event is sent, `event.key` represents its printable value _or_ one
    of a large list of special values indicating meta keys/functionality. In addition,
    key events for compose functionality contain a value of `Dead` when mid-composition.

    I can't quite verify it, but non-English IMEs may also be able to generate key codes
    for code points in the surrogate-pair range, which could potentially be seen as having
    key.length > 1. Since `Fn` is one of the special keys, we can't distinguish by that
    alone.

    Here, key.length === 1 means we know for sure the input was printable and not a special
    `key` value. When the length is greater than 1, it could be either a printable surrogate
    pair or a special `key` value. We can tell the difference by checking if the _character
    code_ value (not code point!) is in the "surrogate pair" range or not.

    We don't use .codePointAt because an invalid code point would return 65535, which wouldn't
    pass the >= 0x10000 check we would otherwise use.

    > ...The Unicode Standard sets aside 66 noncharacter code points. The last two code points
    > of each plane are noncharacters: U+FFFE and U+FFFF on the BMP...
    */
    const wasPrintableChar =
      event.key.length === 1 ||
      (event.key.length === 2 && event.key.charCodeAt(0) >= 0xd800) ||
      event.key === 'Unidentified';

    if (!this._isTextElement && !hasActiveDropdown) {
      this.showDropdown();

      if (!this.input.isFocussed && wasPrintableChar) {
        /*
          We update the input value with the pressed key as
          the input was not focussed at the time of key press
          therefore does not have the value of the key.
        */
        this.input.value += event.key;
      }
    }

    switch (keyCode) {
      case KeyCodeMap.A_KEY:
        return this._onSelectKey(event, hasItems);
      case KeyCodeMap.ENTER_KEY:
        return this._onEnterKey(event, hasActiveDropdown);
      case KeyCodeMap.ESC_KEY:
        return this._onEscapeKey(event, hasActiveDropdown);
      case KeyCodeMap.UP_KEY:
      case KeyCodeMap.PAGE_UP_KEY:
      case KeyCodeMap.DOWN_KEY:
      case KeyCodeMap.PAGE_DOWN_KEY:
        return this._onDirectionKey(event, hasActiveDropdown);
      case KeyCodeMap.DELETE_KEY:
      case KeyCodeMap.BACK_KEY:
        return this._onDeleteKey(event, items, hasFocusedInput);
      default:
    }
  }

  _onKeyUp(/* event: KeyboardEvent */): void {
    this._canSearch = this.config.searchEnabled;
  }

  _onInput(/* event: InputEvent */): void {
    const { value } = this.input;
    if (!value) {
      if (this._isTextElement) {
        this.hideDropdown(true);
      } else {
        this._stopSearch();
      }

      this._clearNotice();

      return;
    }

    if (this._canSearch) {
      // do the search even if the entered text can not be added
      this._handleSearch(value);
    }

    if (!this._canAddUserChoices) {
      return;
    }

    // determine if a notice needs to be displayed for why a search result can't be added
    const canAddItem = this._canAddItem(value);
    this._displayNotice(canAddItem.notice, 'add-choice');
    if (this._isSelectElement) {
      this._highlightPosition = 0; // reset to select the notice and/or exact match
      this._highlightChoice();
    }
  }

  _onSelectKey(event: KeyboardEvent, hasItems: boolean): void {
    const { ctrlKey, metaKey } = event;
    const hasCtrlDownKeyPressed = ctrlKey || metaKey;

    // If CTRL + A or CMD + A have been pressed and there are items to select
    if (hasCtrlDownKeyPressed && hasItems) {
      this._canSearch = false;

      const shouldHightlightAll =
        this.config.removeItems && !this.input.value && this.input.element === document.activeElement;

      if (shouldHightlightAll) {
        this.highlightAll();
      }
    }
  }

  _onEnterKey(event: KeyboardEvent, hasActiveDropdown: boolean): void {
    const { config } = this;
    const { value } = this.input;
    const target = event.target as HTMLElement | null;
    const targetWasRemoveButton = target && target.hasAttribute('data-button');
    event.preventDefault();

    if (targetWasRemoveButton) {
      this._handleButtonAction(target);

      return;
    }

    if (!hasActiveDropdown) {
      if (this._isSelectElement || this._notice) {
        this.showDropdown();
      }

      return;
    }

    const highlightedChoice: HTMLElement | null = this.dropdown.element.querySelector(
      getClassNamesSelector(config.classNames.highlightedState),
    );

    if (highlightedChoice && this._handleChoiceAction(highlightedChoice)) {
      return;
    }

    if (!target || value === '') {
      this.hideDropdown(true);

      return;
    }

    const canAdd: Notice = this._canAddItem(value);
    if (!canAdd.response) {
      return;
    }

    let addedItem = false;
    this._store.withTxn(() => {
      addedItem = this._findAndSelectChoiceByValue(value, true);
      if (!addedItem) {
        if (!this._canAddUserChoices) {
          return;
        }

        const sanitisedValue = sanitise(value);
        const userValue =
          config.allowHtmlUserInput || sanitisedValue === value ? value : { escaped: sanitisedValue, raw: value };
        this._addChoice(
          mapInputToChoice(
            {
              value: userValue,
              label: userValue,
              selected: true,
            } as InputChoice,
            false,
          ),
          true,
          true,
        );
        addedItem = true;
      }

      this.clearInput();
      this.unhighlightAll();
    });

    if (!addedItem) {
      return;
    }

    this._triggerChange(value);

    if (config.closeDropdownOnSelect) {
      this.hideDropdown(true);
    }
  }

  _onEscapeKey(event: KeyboardEvent, hasActiveDropdown: boolean): void {
    if (hasActiveDropdown) {
      event.stopPropagation();
      this.hideDropdown(true);
      this.containerOuter.element.focus();
    }
  }

  _onDirectionKey(event: KeyboardEvent, hasActiveDropdown: boolean): void {
    const { keyCode, metaKey } = event;

    // If up or down key is pressed, traverse through options
    if (hasActiveDropdown || this._isSelectOneElement) {
      this.showDropdown();
      this._canSearch = false;

      const directionInt = keyCode === KeyCodeMap.DOWN_KEY || keyCode === KeyCodeMap.PAGE_DOWN_KEY ? 1 : -1;
      const skipKey = metaKey || keyCode === KeyCodeMap.PAGE_DOWN_KEY || keyCode === KeyCodeMap.PAGE_UP_KEY;
      const selectableChoiceIdentifier = '[data-choice-selectable]';

      let nextEl;
      if (skipKey) {
        if (directionInt > 0) {
          nextEl = this.dropdown.element.querySelector(`${selectableChoiceIdentifier}:last-of-type`);
        } else {
          nextEl = this.dropdown.element.querySelector(selectableChoiceIdentifier);
        }
      } else {
        const currentEl = this.dropdown.element.querySelector(
          getClassNamesSelector(this.config.classNames.highlightedState),
        );
        if (currentEl) {
          nextEl = getAdjacentEl(currentEl, selectableChoiceIdentifier, directionInt);
        } else {
          nextEl = this.dropdown.element.querySelector(selectableChoiceIdentifier);
        }
      }

      if (nextEl) {
        // We prevent default to stop the cursor moving
        // when pressing the arrow
        if (!isScrolledIntoView(nextEl, this.choiceList.element, directionInt)) {
          this.choiceList.scrollToChildElement(nextEl, directionInt);
        }
        this._highlightChoice(nextEl);
      }

      // Prevent default to maintain cursor position whilst
      // traversing dropdown options
      event.preventDefault();
    }
  }

  _onDeleteKey(event: KeyboardEvent, items: ChoiceFull[], hasFocusedInput: boolean): void {
    const { target } = event;
    // If backspace or delete key is pressed and the input has no value
    if (!this._isSelectOneElement && !(target as HTMLInputElement).value && hasFocusedInput) {
      this._handleBackspace(items);
      event.preventDefault();
    }
  }

  _onTouchMove(): void {
    if (this._wasTap) {
      this._wasTap = false;
    }
  }

  _onTouchEnd(event: TouchEvent): void {
    const { target } = event || (event as TouchEvent).touches[0];
    const touchWasWithinContainer = this._wasTap && this.containerOuter.element.contains(target as Node);

    if (touchWasWithinContainer) {
      const containerWasExactTarget = target === this.containerOuter.element || target === this.containerInner.element;

      if (containerWasExactTarget) {
        if (this._isTextElement) {
          this.input.focus();
        } else if (this._isSelectMultipleElement) {
          this.showDropdown();
        }
      }

      // Prevents focus event firing
      event.stopPropagation();
    }

    this._wasTap = true;
  }

  /**
   * Handles mousedown event in capture mode for containetOuter.element
   */
  _onMouseDown(event: MouseEvent): void {
    const { target } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    // If we have our mouse down on the scrollbar and are on IE11...
    if (IS_IE11 && this.choiceList.element.contains(target)) {
      // check if click was on a scrollbar area
      const firstChoice = this.choiceList.element.firstElementChild as HTMLElement;

      this._isScrollingOnIe =
        this._direction === 'ltr' ? event.offsetX >= firstChoice.offsetWidth : event.offsetX < firstChoice.offsetLeft;
    }

    if (target === this.input.element) {
      return;
    }

    const item = target.closest('[data-button],[data-item],[data-choice]');
    if (item instanceof HTMLElement) {
      const hasShiftKey = event.shiftKey;
      const { dataset } = item;

      if ('button' in dataset) {
        this._handleButtonAction(item);
      } else if ('item' in dataset) {
        this._handleItemAction(item, hasShiftKey);
      } else if ('choice' in dataset) {
        this._handleChoiceAction(item);
      }
    }

    event.preventDefault();
  }

  /**
   * Handles mouseover event over this.dropdown
   * @param {MouseEvent} event
   */
  _onMouseOver({ target }: Pick<MouseEvent, 'target'>): void {
    if (target instanceof HTMLElement && 'choice' in target.dataset) {
      this._highlightChoice(target);
    }
  }

  _onClick({ target }: Pick<MouseEvent, 'target'>): void {
    const { containerOuter } = this;
    const clickWasWithinContainer = containerOuter.element.contains(target as Node);

    if (clickWasWithinContainer) {
      if (!this.dropdown.isActive && !this.containerOuter.isDisabled) {
        if (this._isTextElement) {
          if (document.activeElement !== this.input.element) {
            this.input.focus();
          }
        } else {
          this.showDropdown();
          containerOuter.element.focus();
        }
      } else if (
        this._isSelectOneElement &&
        target !== this.input.element &&
        !this.dropdown.element.contains(target as Node)
      ) {
        this.hideDropdown();
      }
    } else {
      const hasHighlightedItems = this._store.highlightedActiveItems.length > 0;

      if (hasHighlightedItems) {
        this.unhighlightAll();
      }

      containerOuter.removeFocusState();
      this.hideDropdown(true);
    }
  }

  _onFocus({ target }: Pick<FocusEvent, 'target'>): void {
    const { containerOuter } = this;
    const focusWasWithinContainer = target && containerOuter.element.contains(target as Node);

    if (!focusWasWithinContainer) {
      return;
    }
    const targetIsInput = target === this.input.element;

    const focusActions = {
      [TEXT_TYPE]: (): void => {
        if (targetIsInput) {
          containerOuter.addFocusState();
        }
      },
      [SELECT_ONE_TYPE]: (): void => {
        containerOuter.addFocusState();
        if (targetIsInput) {
          this.showDropdown(true);
        }
      },
      [SELECT_MULTIPLE_TYPE]: (): void => {
        if (targetIsInput) {
          this.showDropdown(true);
          // If element is a select box, the focused element is the container and the dropdown
          // isn't already open, focus and show dropdown
          containerOuter.addFocusState();
        }
      },
    };

    focusActions[this._elementType]();
  }

  _onBlur({ target }: Pick<FocusEvent, 'target'>): void {
    const { containerOuter } = this;
    const blurWasWithinContainer = target && containerOuter.element.contains(target as Node);

    if (blurWasWithinContainer && !this._isScrollingOnIe) {
      const { activeChoices } = this._store;
      const hasHighlightedItems = activeChoices.some((item) => item.highlighted);
      const targetIsInput = target === this.input.element;
      const blurActions = {
        [TEXT_TYPE]: (): void => {
          if (targetIsInput) {
            containerOuter.removeFocusState();
            if (hasHighlightedItems) {
              this.unhighlightAll();
            }
            this.hideDropdown(true);
          }
        },
        [SELECT_ONE_TYPE]: (): void => {
          containerOuter.removeFocusState();
          if (targetIsInput || (target === containerOuter.element && !this._canSearch)) {
            this.hideDropdown(true);
          }
        },
        [SELECT_MULTIPLE_TYPE]: (): void => {
          if (targetIsInput) {
            containerOuter.removeFocusState();
            this.hideDropdown(true);
            if (hasHighlightedItems) {
              this.unhighlightAll();
            }
          }
        },
      };

      blurActions[this._elementType]();
    } else {
      // On IE11, clicking the scollbar blurs our input and thus
      // closes the dropdown. To stop this, we refocus our input
      // if we know we are on IE *and* are scrolling.
      this._isScrollingOnIe = false;
      this.input.element.focus();
    }
  }

  _onFormReset(): void {
    this._store.withTxn(() => {
      this.clearInput();
      this.hideDropdown();
      this.refresh(false, false, true);

      if (this._initialItems.length !== 0) {
        this.setChoiceByValue(this._initialItems);
      }
    });
  }

  _highlightChoice(el: HTMLElement | null = null): void {
    const { highlightedState } = this.config.classNames;
    const choices: HTMLElement[] = Array.from(this.dropdown.element.querySelectorAll('[data-choice-selectable]'));

    if (!choices.length) {
      return;
    }

    let passedEl = el;
    const highlightedChoices = Array.from(
      this.dropdown.element.querySelectorAll(getClassNamesSelector(highlightedState)),
    );

    // Remove any highlighted choices
    highlightedChoices.forEach((choice) => {
      choice.classList.remove(...getClassNames(highlightedState));
      choice.setAttribute('aria-selected', 'false');
    });

    if (passedEl) {
      this._highlightPosition = choices.indexOf(passedEl);
    } else {
      // Highlight choice based on last known highlight location
      if (choices.length > this._highlightPosition) {
        // If we have an option to highlight
        passedEl = choices[this._highlightPosition];
      } else {
        // Otherwise highlight the option before
        passedEl = choices[choices.length - 1];
      }

      if (!passedEl) {
        passedEl = choices[0];
      }
    }

    passedEl.classList.add(...getClassNames(highlightedState));
    passedEl.setAttribute('aria-selected', 'true');
    this.passedElement.triggerEvent(EventType.highlightChoice, {
      el: passedEl,
    });

    if (this.dropdown.isActive) {
      // IE11 ignores aria-label and blocks virtual keyboard
      // if aria-activedescendant is set without a dropdown
      this.input.setActiveDescendant(passedEl.id);
      this.containerOuter.setActiveDescendant(passedEl.id);
    }
  }

  _addItem(item: ChoiceFull, withEvents: boolean = true, userTriggered = false): void {
    const { id } = item;
    if (id === 0) {
      throw new TypeError('item.id must be set before _addItem is called for a choice/item');
    }

    if (this.config.singleModeForMultiSelect || this._isSelectOneElement) {
      this.removeActiveItems(id);
    }

    this._store.dispatch(addItem(item));

    if (withEvents) {
      this.passedElement.triggerEvent(EventType.addItem, this._getChoiceForOutput(item));

      if (userTriggered) {
        this.passedElement.triggerEvent(EventType.choice, this._getChoiceForOutput(item));
      }
    }
  }

  _removeItem(item: ChoiceFull): void {
    const { id } = item;
    if (!id) {
      return;
    }

    this._store.dispatch(removeItem(item));

    this.passedElement.triggerEvent(EventType.removeItem, this._getChoiceForOutput(item));
  }

  _addChoice(choice: ChoiceFull, withEvents: boolean = true, userTriggered = false): void {
    if (choice.id !== 0) {
      throw new TypeError('Can not re-add a choice which has already been added');
    }

    // Generate unique id, in-place update is required so chaining _addItem works as expected
    this._lastAddedChoiceId++;
    choice.id = this._lastAddedChoiceId;
    choice.elementId = `${this._baseId}-${this._idNames.itemChoice}-${choice.id}`;

    const { prependValue, appendValue } = this.config;
    if (prependValue) {
      choice.value = prependValue + choice.value;
    }
    if (appendValue) {
      choice.value += appendValue.toString();
    }
    if ((prependValue || appendValue) && choice.element) {
      (choice.element as HTMLOptionElement).value = choice.value;
    }

    this._store.dispatch(addChoice(choice));

    if (choice.selected) {
      this._addItem(choice, withEvents, userTriggered);
    }
  }

  _addGroup(group: GroupFull, withEvents: boolean = true): void {
    if (group.id !== 0) {
      throw new TypeError('Can not re-add a group which has already been added');
    }

    this._store.dispatch(addGroup(group));

    if (!group.choices) {
      return;
    }

    // add unique id for the group(s), and do not store the full list of choices in this group
    const g = group;
    this._lastAddedGroupId++;
    g.id = this._lastAddedGroupId;
    const { id, choices } = group;
    g.choices = [];

    choices.forEach((item: ChoiceFull) => {
      item.groupId = id;
      if (group.disabled) {
        item.disabled = true;
      }

      this._addChoice(item, withEvents);
    });
  }

  _createTemplates(): void {
    const { callbackOnCreateTemplates } = this.config;
    let userTemplates = {};

    if (callbackOnCreateTemplates && typeof callbackOnCreateTemplates === 'function') {
      userTemplates = callbackOnCreateTemplates.call(this, strToEl, escapeForTemplate);
    }

    const templating = {};
    Object.keys(this._templates).forEach((name) => {
      if (name in userTemplates) {
        templating[name] = userTemplates[name].bind(this);
      } else {
        templating[name] = this._templates[name].bind(this);
      }
    });

    this._templates = templating as Templates;
  }

  _createElements(): void {
    const templating = this._templates;
    const { config } = this;
    const { position, classNames } = config;
    const elementType = this._elementType;

    this.containerOuter = new Container({
      element: templating.containerOuter(
        config,
        this._direction,
        this._isSelectElement,
        this._isSelectOneElement,
        config.searchEnabled,
        elementType,
        config.labelId,
      ),
      classNames,
      type: elementType,
      position,
    });

    this.containerInner = new Container({
      element: templating.containerInner(config),
      classNames,
      type: elementType,
      position,
    });

    this.input = new Input({
      element: templating.input(config, this._placeholderValue),
      classNames,
      type: elementType,
      preventPaste: !config.paste,
    });

    this.choiceList = new List({
      element: templating.choiceList(config, this._isSelectOneElement),
    });

    this.itemList = new List({
      element: templating.itemList(config, this._isSelectOneElement),
    });

    this.dropdown = new Dropdown({
      element: templating.dropdown(config),
      classNames,
      type: elementType,
    });
  }

  _createStructure(): void {
    const { containerInner, containerOuter, passedElement, dropdown, input } = this;

    // Hide original element
    passedElement.conceal();
    // Wrap input in container preserving DOM ordering
    containerInner.wrap(passedElement.element);
    // Wrapper inner container with outer container
    containerOuter.wrap(containerInner.element);

    if (this._isSelectOneElement) {
      input.placeholder = this.config.searchPlaceholderValue || '';
    } else {
      if (this._placeholderValue) {
        input.placeholder = this._placeholderValue;
      }
      input.setWidth();
    }

    containerOuter.element.appendChild(containerInner.element);
    containerOuter.element.appendChild(dropdown.element);
    containerInner.element.appendChild(this.itemList.element);
    dropdown.element.appendChild(this.choiceList.element);

    if (!this._isSelectOneElement) {
      containerInner.element.appendChild(input.element);
    } else if (this.config.searchEnabled) {
      dropdown.element.insertBefore(input.element, dropdown.element.firstChild);
    }

    this._highlightPosition = 0;
    this._isSearching = false;
  }

  _initStore(): void {
    this._store.subscribe(this._render);

    this._store.withTxn(() => {
      this._addPredefinedChoices(
        this._presetChoices,
        this._isSelectOneElement && !this._hasNonChoicePlaceholder,
        false,
      );
    });

    if (this._isSelectOneElement && this._hasNonChoicePlaceholder) {
      this._render({ choices: false, groups: false, items: true });
    }
  }

  _addPredefinedChoices(
    choices: (ChoiceFull | GroupFull)[],
    selectFirstOption: boolean = false,
    withEvents: boolean = true,
  ): void {
    if (selectFirstOption) {
      /**
       * If there is a selected choice already or the choice is not the first in
       * the array, add each choice normally.
       *
       * Otherwise we pre-select the first enabled choice in the array ("select-one" only)
       */
      const noSelectedChoices = choices.findIndex((choice: ChoiceFull) => choice.selected) === -1;
      if (noSelectedChoices) {
        choices.some((choice) => {
          if (choice.disabled || 'choices' in choice) {
            return false;
          }

          choice.selected = true;

          return true;
        });
      }
    }

    choices.forEach((item) => {
      if ('choices' in item) {
        if (this._isSelectElement) {
          this._addGroup(item, withEvents);
        }
      } else {
        this._addChoice(item, withEvents);
      }
    });
  }

  _findAndSelectChoiceByValue(value: string, userTriggered: boolean = false): boolean {
    const { choices } = this._store;
    // Check 'value' property exists and the choice isn't already selected
    const foundChoice = choices.find((choice) => this.config.valueComparer(choice.value, value));

    if (foundChoice && !foundChoice.disabled && !foundChoice.selected) {
      this._addItem(foundChoice, true, userTriggered);

      return true;
    }

    return false;
  }

  _generatePlaceholderValue(): string | null {
    const { config } = this;
    if (!config.placeholder) {
      return null;
    }

    if (this._hasNonChoicePlaceholder) {
      return config.placeholderValue;
    }

    if (this._isSelectElement) {
      const { placeholderOption } = this.passedElement as WrappedSelect;

      return placeholderOption ? placeholderOption.text : null;
    }

    return null;
  }

  _warnChoicesInitFailed(caller: string): void {
    if (this.config.silent) {
      return;
    }
    if (!this.initialised) {
      throw new TypeError(`${caller} called on a non-initialised instance of Choices`);
    } else if (!this.initialisedOK) {
      throw new TypeError(`${caller} called for an element which has multiple instances of Choices initialised on it`);
    }
  }
}

export default Choices;
