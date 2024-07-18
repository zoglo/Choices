/**
 * Helpers to create HTML elements used by Choices
 * Can be overridden by providing `callbackOnCreateTemplates` option
 */

import { Choice } from './interfaces/choice';
import { Group } from './interfaces/group';
import { Item } from './interfaces/item';
import { PassedElementType } from './interfaces/passed-element-type';
import { getClassNames } from './lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateOptions = Record<'classNames' | 'allowHTML', any>;

const templates = {
  containerOuter(
    { classNames: { containerOuter } }: TemplateOptions,
    dir: HTMLElement['dir'],
    isSelectElement: boolean,
    isSelectOneElement: boolean,
    searchEnabled: boolean,
    passedElementType: PassedElementType,
    labelId: string,
  ): HTMLDivElement {
    const div = Object.assign(document.createElement('div'), {
      className: getClassNames(containerOuter).join(' '),
    });

    div.dataset.type = passedElementType;

    if (dir) {
      div.dir = dir;
    }

    if (isSelectOneElement) {
      div.tabIndex = 0;
    }

    if (isSelectElement) {
      div.setAttribute('role', searchEnabled ? 'combobox' : 'listbox');
      if (searchEnabled) {
        div.setAttribute('aria-autocomplete', 'list');
      }
    }

    div.setAttribute('aria-haspopup', 'true');
    div.setAttribute('aria-expanded', 'false');
    if (labelId) {
      div.setAttribute('aria-labelledby', labelId);
    }

    return div;
  },

  containerInner({
    classNames: { containerInner },
  }: TemplateOptions): HTMLDivElement {
    return Object.assign(document.createElement('div'), {
      className: getClassNames(containerInner).join(' '),
    });
  },

  itemList(
    { classNames: { list, listSingle, listItems } }: TemplateOptions,
    isSelectOneElement: boolean,
  ): HTMLDivElement {
    return Object.assign(document.createElement('div'), {
      className: `${getClassNames(list).join(' ')} ${
        isSelectOneElement
          ? getClassNames(listSingle).join(' ')
          : getClassNames(listItems).join(' ')
      }`,
    });
  },

  placeholder(
    { allowHTML, classNames: { placeholder } }: TemplateOptions,
    value: string,
  ): HTMLDivElement {
    return Object.assign(document.createElement('div'), {
      className: getClassNames(placeholder).join(' '),
      [allowHTML ? 'innerHTML' : 'innerText']: value,
    });
  },

  item(
    {
      allowHTML,
      removeItemButtonAlignLeft,
      classNames: {
        item,
        button,
        highlightedState,
        itemSelectable,
        placeholder,
      },
    }: TemplateOptions,
    {
      id,
      value,
      label,
      labelClass,
      labelDescription,
      customProperties,
      active,
      disabled,
      highlighted,
      placeholder: isPlaceholder,
    }: Item,
    removeItemButton: boolean,
  ): HTMLDivElement {
    const div = Object.assign(document.createElement('div'), {
      className: getClassNames(item).join(' '),
    });

    if (typeof labelClass === 'string' || Array.isArray(labelClass)) {
      const spanLabel = Object.assign(document.createElement('span'), {
        [allowHTML ? 'innerHTML' : 'innerText']: label,
        className: getClassNames(labelClass).join(' '),
      });
      div.appendChild(spanLabel);
    } else if (allowHTML) {
      div.innerHTML = label;
    } else {
      div.innerText = label;
    }

    Object.assign(div.dataset, {
      item: '',
      id,
      value,
      labelClass,
      labelDescription,
      customProperties,
    });

    if (active) {
      div.setAttribute('aria-selected', 'true');
    }

    if (disabled) {
      div.setAttribute('aria-disabled', 'true');
    }

    if (isPlaceholder) {
      div.classList.add(...getClassNames(placeholder));
    }

    div.classList.add(
      ...(highlighted
        ? getClassNames(highlightedState)
        : getClassNames(itemSelectable)),
    );

    if (removeItemButton) {
      if (disabled) {
        div.classList.remove(...getClassNames(itemSelectable));
      }
      div.dataset.deletable = '';

      let REMOVE_ITEM_ICON =
        typeof this.config.removeItemIconText === 'function'
          ? this.config.removeItemIconText(value)
          : this.config.removeItemIconText;
      let REMOVE_ITEM_LABEL =
        typeof this.config.removeItemLabelText === 'function'
          ? this.config.removeItemLabelText(value)
          : this.config.removeItemLabelText;
      const removeButton = Object.assign(document.createElement('button'), {
        type: 'button',
        className: getClassNames(button).join(' '),
        [allowHTML ? 'innerHTML' : 'innerText']: REMOVE_ITEM_ICON,
      });
      removeButton.setAttribute(
        'aria-label',
        REMOVE_ITEM_LABEL,
      );
      removeButton.dataset.button = '';
      if (removeItemButtonAlignLeft) {
        div.insertAdjacentElement('afterbegin', removeButton);
      } else {
        div.appendChild(removeButton);
      }
    }

    return div;
  },

  choiceList(
    { classNames: { list } }: TemplateOptions,
    isSelectOneElement: boolean,
  ): HTMLDivElement {
    const div = Object.assign(document.createElement('div'), {
      className: getClassNames(list).join(' '),
    });

    if (!isSelectOneElement) {
      div.setAttribute('aria-multiselectable', 'true');
    }
    div.setAttribute('role', 'listbox');

    return div;
  },

  choiceGroup(
    {
      allowHTML,
      classNames: { group, groupHeading, itemDisabled },
    }: TemplateOptions,
    { id, value, disabled }: Group,
  ): HTMLDivElement {
    const div = Object.assign(document.createElement('div'), {
      className: `${getClassNames(group).join(' ')} ${
        disabled ? getClassNames(itemDisabled).join(' ') : ''
      }`,
    });

    div.setAttribute('role', 'group');

    Object.assign(div.dataset, {
      group: '',
      id,
      value,
    });

    if (disabled) {
      div.setAttribute('aria-disabled', 'true');
    }

    div.appendChild(
      Object.assign(document.createElement('div'), {
        className: getClassNames(groupHeading).join(' '),
        [allowHTML ? 'innerHTML' : 'innerText']: value,
      }),
    );

    return div;
  },

  choice(
    {
      allowHTML,
      classNames: {
        item,
        itemChoice,
        itemSelectable,
        selectedState,
        itemDisabled,
        description,
        placeholder,
      },
    }: TemplateOptions,
    {
      id,
      value,
      label,
      groupId,
      elementId,
      labelClass,
      labelDescription,
      disabled: isDisabled,
      selected: isSelected,
      placeholder: isPlaceholder,
    }: Choice,
    selectText: string,
  ): HTMLDivElement {
    const div = Object.assign(document.createElement('div'), {
      id: elementId,
      className: `${getClassNames(item).join(' ')} ${getClassNames(
        itemChoice,
      ).join(' ')}`,
    });

    const descId = `${elementId}-description`;

    if (typeof labelClass === 'string' || Array.isArray(labelClass)) {
      const spanLabel = Object.assign(document.createElement('span'), {
        [allowHTML ? 'innerHTML' : 'innerText']: label,
        className: getClassNames(labelClass).join(' '),
      });
      spanLabel.setAttribute('aria-describedby', descId);
      div.appendChild(spanLabel);
    } else if (allowHTML) {
      div.innerHTML = label;
      div.setAttribute('aria-describedby', descId);
    } else {
      div.innerText = label;
      div.setAttribute('aria-describedby', descId);
    }

    if (typeof labelDescription === 'string') {
      const spanDesc = Object.assign(document.createElement('span'), {
        [allowHTML ? 'innerHTML' : 'innerText']: labelDescription,
        id: descId,
      });
      spanDesc.classList.add(...getClassNames(description));
      div.appendChild(spanDesc);
    }

    if (isSelected) {
      div.classList.add(...getClassNames(selectedState));
    }

    if (isPlaceholder) {
      div.classList.add(...getClassNames(placeholder));
    }

    div.setAttribute('role', groupId && groupId > 0 ? 'treeitem' : 'option');

    Object.assign(div.dataset, {
      choice: '',
      id,
      value,
      labelClass,
      labelDescription,
      selectText,
    });

    if (isDisabled) {
      div.classList.add(...getClassNames(itemDisabled));
      div.dataset.choiceDisabled = '';
      div.setAttribute('aria-disabled', 'true');
    } else {
      div.classList.add(...getClassNames(itemSelectable));
      div.dataset.choiceSelectable = '';
    }

    return div;
  },

  input(
    { classNames: { input, inputCloned } }: TemplateOptions,
    placeholderValue: string,
  ): HTMLInputElement {
    const inp = Object.assign(document.createElement('input'), {
      type: 'search',
      name: 'search_terms',
      className: `${getClassNames(input).join(' ')} ${getClassNames(
        inputCloned,
      ).join(' ')}`,
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: false,
    });

    inp.setAttribute('role', 'textbox');
    inp.setAttribute('aria-autocomplete', 'list');
    inp.setAttribute('aria-label', placeholderValue);

    return inp;
  },

  dropdown({
    classNames: { list, listDropdown },
  }: TemplateOptions): HTMLDivElement {
    const div = document.createElement('div');

    div.classList.add(...getClassNames(list));
    div.classList.add(...getClassNames(listDropdown));
    div.setAttribute('aria-expanded', 'false');

    return div;
  },

  notice(
    {
      allowHTML,
      classNames: { item, itemChoice, noResults, noChoices },
    }: TemplateOptions,
    innerText: string,
    type: 'no-choices' | 'no-results' | '' = '',
  ): HTMLDivElement {
    const classes = [...getClassNames(item), ...getClassNames(itemChoice)];

    if (type === 'no-choices') {
      classes.push(noChoices);
    } else if (type === 'no-results') {
      classes.push(noResults);
    }

    return Object.assign(document.createElement('div'), {
      [allowHTML ? 'innerHTML' : 'innerText']: innerText,
      className: classes.join(' '),
    });
  },

  option({
    label,
    value,
    labelClass,
    labelDescription,
    customProperties,
    active,
    disabled,
  }: Item): HTMLOptionElement {
    const opt = new Option(label, value, false, active);
    if (typeof labelClass !== 'undefined') {
      opt.dataset.labelClass = getClassNames(labelClass).join(' ');
    }
    if (typeof labelClass !== 'undefined') {
      opt.dataset.labelDescription = labelDescription;
    }

    if (customProperties) {
      for (var prop in customProperties) {
        if (Object.prototype.hasOwnProperty.call(customProperties, prop)) {
          opt.dataset.customProperties = JSON.stringify(customProperties);
          break;
        }
      }
    }

    opt.disabled = !!disabled;

    return opt;
  },
};

export default templates;
