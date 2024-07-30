import { Store } from 'redux';
import {
  WrappedInput,
  WrappedSelect,
  Container,
  List,
  Input,
  Dropdown,
} from '../components';
import { InputChoice } from './input-choice';
import { State } from './state';
import templates from '../templates';
// eslint-disable-next-line import/no-cycle
import { Options } from './options';

export interface Choices {
  initialised: boolean;
  config: Options;

  passedElement: WrappedInput | WrappedSelect;

  containerOuter: Container;

  containerInner: Container;

  choiceList: List;

  itemList: List;

  input: Input;

  dropdown: Dropdown;

  _isTextElement: boolean;

  _isSelectOneElement: boolean;

  _isSelectMultipleElement: boolean;

  _isSelectElement: boolean;

  _store: Store;

  _templates: typeof templates;

  _initialState: State;

  _currentState: State;

  _prevState: State;

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

  _presetChoices: InputChoice[];

  _presetItems: (InputChoice | string)[];

  new (
    element: string | Element | HTMLInputElement | HTMLSelectElement,
    userConfig: Partial<Options>,
  );
}
