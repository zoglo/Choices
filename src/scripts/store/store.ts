/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, Store as IStore, AnyAction } from 'redux';
import { State } from '../interfaces/state';
import rootReducer from '../reducers/index';
import { setIsLoading } from '../actions/misc';
import { ChoiceFull } from '../interfaces/choice-full';
import { GroupFull } from '../interfaces/group-full';

export default class Store {
  _store: IStore;

  constructor() {
    this._store = createStore(
      rootReducer,
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
    );
  }

  /**
   * Subscribe store to function call (wrapped Redux method)
   */
  subscribe(onChange: () => void): void {
    this._store.subscribe(onChange);
  }

  /**
   * Dispatch event to store (wrapped Redux method)
   */
  dispatch(action: AnyAction): void {
    this._store.dispatch(action);
  }

  startDeferRendering(): void {
    this._store.dispatch(setIsLoading(true));
  }

  stopDeferRendering(): void {
    this._store.dispatch(setIsLoading(false));
  }

  withDeferRendering(func: () => void): void {
    this.startDeferRendering();
    try {
      func();
    } finally {
      this.stopDeferRendering();
    }
  }

  /**
   * Get store object (wrapping Redux method)
   */
  get state(): State {
    return this._store.getState();
  }

  /**
   * Get items from store
   */
  get items(): ChoiceFull[] {
    return this.state.items;
  }

  /**
   * Get active items from store
   */
  get activeItems(): ChoiceFull[] {
    return this.items.filter((item) => item.active);
  }

  /**
   * Get highlighted items from store
   */
  get highlightedActiveItems(): ChoiceFull[] {
    return this.items.filter((item) => item.active && item.highlighted);
  }

  /**
   * Get choices from store
   */
  get choices(): ChoiceFull[] {
    return this.state.choices;
  }

  /**
   * Get active choices from store
   */
  get activeChoices(): ChoiceFull[] {
    return this.choices.filter((choice) => choice.active);
  }

  /**
   * Get selectable choices from store
   */
  get selectableChoices(): ChoiceFull[] {
    return this.choices.filter((choice) => !choice.disabled);
  }

  /**
   * Get choices that can be searched (excluding placeholders)
   */
  get searchableChoices(): ChoiceFull[] {
    return this.selectableChoices.filter((choice) => !choice.placeholder);
  }

  /**
   * Get placeholder choice from store
   */
  get placeholderChoice(): ChoiceFull | undefined {
    return [...this.choices].reverse().find((choice) => choice.placeholder);
  }

  /**
   * Get groups from store
   */
  get groups(): GroupFull[] {
    return this.state.groups;
  }

  /**
   * Get active groups from store
   */
  get activeGroups(): GroupFull[] {
    const { groups, choices } = this;

    return groups.filter((group) => {
      const isActive = group.active && !group.disabled;
      const hasActiveOptions = choices.some(
        (choice) => choice.active && !choice.disabled,
      );

      return isActive && hasActiveOptions;
    }, []);
  }

  /**
   * Get loading state from store
   */
  isLoading(): boolean {
    return this.state.loading > 0;
  }

  /**
   * Get single choice by it's ID
   */
  getChoiceById(id: number): ChoiceFull | undefined {
    return this.activeChoices.find((choice) => choice.id === id);
  }

  /**
   * Get group by group id
   */
  getGroupById(id: number): GroupFull | undefined {
    return this.groups.find((group) => group.id === id);
  }
}
