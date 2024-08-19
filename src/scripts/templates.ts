/**
 * Helpers to create HTML elements used by Choices
 * Can be overridden by providing `callbackOnCreateTemplates` option.
 * `Choices.defaults.templates` allows access to the default template methods from `callbackOnCreateTemplates`
 */

import { ChoiceFull, CustomProperties } from './interfaces/choice-full';
import { GroupFull } from './interfaces/group-full';
import { PassedElementType } from './interfaces/passed-element-type';
import { StringPreEscaped } from './interfaces/string-pre-escaped';
import { getClassNames, unwrapStringForRaw, resolveNoticeFunction, escapeForTemplate } from './lib/utils';
import { NoticeType, NoticeTypes, TemplateOptions, Templates as TemplatesInterface } from './interfaces/templates';

const isEmptyObject = (obj: object): boolean => {
  // eslint-disable-next-line no-restricted-syntax
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true;
};

const assignCustomProperties = (el: HTMLElement, customProperties?: CustomProperties): void => {
  if (!customProperties) {
    return;
  }
  const { dataset } = el;

  if (typeof customProperties === 'string') {
    dataset.customProperties = customProperties;
  } else if (typeof customProperties === 'object' && !isEmptyObject(customProperties)) {
    dataset.customProperties = JSON.stringify(customProperties);
  }
};

const addAriaLabel = (docRoot: HTMLElement | ShadowRoot, id: string | undefined, element: HTMLElement): void => {
  const label = id && docRoot.querySelector<HTMLElement>(`label[for='${id}']`);
  const text = label && (label as HTMLElement).innerText;
  if (text) {
    element.setAttribute('aria-label', text);
  }
};

const templates: TemplatesInterface = {
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
      } else if (!labelId) {
        addAriaLabel(this._docRoot, this.passedElement.element.id, div);
      }

      div.setAttribute('aria-haspopup', 'true');
      div.setAttribute('aria-expanded', 'false');
    }

    if (labelId) {
      div.setAttribute('aria-labelledby', labelId);
    }

    return div;
  },

  containerInner({ classNames: { containerInner } }: TemplateOptions): HTMLDivElement {
    return Object.assign(document.createElement('div'), {
      className: getClassNames(containerInner).join(' '),
    });
  },

  itemList(
    { searchEnabled, classNames: { list, listSingle, listItems } }: TemplateOptions,
    isSelectOneElement: boolean,
  ): HTMLDivElement {
    const div = Object.assign(document.createElement('div'), {
      className: `${getClassNames(list).join(' ')} ${isSelectOneElement ? getClassNames(listSingle).join(' ') : getClassNames(listItems).join(' ')}`,
    });

    if (this._isSelectElement && searchEnabled) {
      div.setAttribute('role', 'listbox');
    }

    return div;
  },

  placeholder(
    { allowHTML, classNames: { placeholder } }: TemplateOptions,
    value: StringPreEscaped | string,
  ): HTMLDivElement {
    return Object.assign(document.createElement('div'), {
      className: getClassNames(placeholder).join(' '),
      innerHTML: escapeForTemplate(allowHTML, value),
    });
  },

  item(
    {
      allowHTML,
      removeItemButtonAlignLeft,
      removeItemIconText,
      removeItemLabelText,
      classNames: { item, button, highlightedState, itemSelectable, placeholder },
    }: TemplateOptions,
    {
      id,
      value,
      label,
      labelClass,
      labelDescription,
      customProperties,
      disabled,
      highlighted,
      placeholder: isPlaceholder,
    }: ChoiceFull,
    removeItemButton: boolean,
  ): HTMLDivElement {
    const rawValue = unwrapStringForRaw(value);
    const div = Object.assign(document.createElement('div'), {
      className: getClassNames(item).join(' '),
    });

    if (labelClass) {
      const spanLabel = Object.assign(document.createElement('span'), {
        innerHTML: escapeForTemplate(allowHTML, label),
        className: getClassNames(labelClass).join(' '),
      });
      div.appendChild(spanLabel);
    } else {
      div.innerHTML = escapeForTemplate(allowHTML, label);
    }

    const { dataset } = div;
    Object.assign(dataset, {
      item: '',
      id,
      value: rawValue,
    });

    if (labelClass) {
      dataset.labelClass = getClassNames(labelClass).join(' ');
    }
    if (labelDescription) {
      dataset.labelDescription = labelDescription;
    }

    assignCustomProperties(div, customProperties);

    if (disabled || this.containerOuter.isDisabled) {
      div.setAttribute('aria-disabled', 'true');
    }
    if (this._isSelectElement) {
      div.setAttribute('aria-selected', 'true');
      div.setAttribute('role', 'option');
    }

    if (isPlaceholder) {
      div.classList.add(...getClassNames(placeholder));
      dataset.placeholder = '';
    }

    div.classList.add(...(highlighted ? getClassNames(highlightedState) : getClassNames(itemSelectable)));

    if (removeItemButton) {
      if (disabled) {
        div.classList.remove(...getClassNames(itemSelectable));
      }
      dataset.deletable = '';

      const REMOVE_ITEM_ICON = resolveNoticeFunction(removeItemIconText, value);
      const REMOVE_ITEM_LABEL = resolveNoticeFunction(removeItemLabelText, value);
      const removeButton = Object.assign(document.createElement('button'), {
        type: 'button',
        className: getClassNames(button).join(' '),
        innerHTML: REMOVE_ITEM_ICON,
      });
      if (REMOVE_ITEM_LABEL) {
        removeButton.setAttribute('aria-label', REMOVE_ITEM_LABEL);
      }
      removeButton.dataset.button = '';
      if (removeItemButtonAlignLeft) {
        div.insertAdjacentElement('afterbegin', removeButton);
      } else {
        div.appendChild(removeButton);
      }
    }

    return div;
  },

  choiceList({ classNames: { list } }: TemplateOptions, isSelectOneElement: boolean): HTMLDivElement {
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
    { allowHTML, classNames: { group, groupHeading, itemDisabled } }: TemplateOptions,
    { id, label, disabled }: GroupFull,
  ): HTMLDivElement {
    const rawLabel = unwrapStringForRaw(label);
    const div = Object.assign(document.createElement('div'), {
      className: `${getClassNames(group).join(' ')} ${disabled ? getClassNames(itemDisabled).join(' ') : ''}`,
    });

    div.setAttribute('role', 'group');

    Object.assign(div.dataset, {
      group: '',
      id,
      value: rawLabel,
    });

    if (disabled) {
      div.setAttribute('aria-disabled', 'true');
    }

    div.appendChild(
      Object.assign(document.createElement('div'), {
        className: getClassNames(groupHeading).join(' '),
        innerHTML: escapeForTemplate(allowHTML, label),
      }),
    );

    return div;
  },

  choice(
    {
      allowHTML,
      classNames: { item, itemChoice, itemSelectable, selectedState, itemDisabled, description, placeholder },
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
    }: ChoiceFull,
    selectText: string,
  ): HTMLDivElement {
    const rawValue = unwrapStringForRaw(value);
    const div = Object.assign(document.createElement('div'), {
      id: elementId,
      className: `${getClassNames(item).join(' ')} ${getClassNames(itemChoice).join(' ')}`,
    });

    let describedBy: HTMLElement = div;
    if (labelClass) {
      const spanLabel = Object.assign(document.createElement('span'), {
        innerHTML: escapeForTemplate(allowHTML, label),
        className: getClassNames(labelClass).join(' '),
      });
      describedBy = spanLabel;
      div.appendChild(spanLabel);
    } else {
      div.innerHTML = escapeForTemplate(allowHTML, label);
    }

    if (labelDescription) {
      const descId = `${elementId}-description`;
      describedBy.setAttribute('aria-describedby', descId);
      const spanDesc = Object.assign(document.createElement('span'), {
        innerHTML: escapeForTemplate(allowHTML, labelDescription),
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

    const { dataset } = div;
    const showGroupId = groupId && groupId > 0;
    div.setAttribute('role', showGroupId ? 'treeitem' : 'option');
    if (showGroupId) {
      dataset.groupId = `${groupId}`;
    }

    Object.assign(dataset, {
      choice: '',
      id,
      value: rawValue,
      selectText,
    });
    if (labelClass) {
      dataset.labelClass = getClassNames(labelClass).join(' ');
    }
    if (labelDescription) {
      dataset.labelDescription = labelDescription;
    }

    if (isDisabled) {
      div.classList.add(...getClassNames(itemDisabled));
      dataset.choiceDisabled = '';
      div.setAttribute('aria-disabled', 'true');
    } else {
      div.classList.add(...getClassNames(itemSelectable));
      dataset.choiceSelectable = '';
    }

    return div;
  },

  input(
    { classNames: { input, inputCloned }, labelId }: TemplateOptions,
    placeholderValue: string | null,
  ): HTMLInputElement {
    const inp = Object.assign(document.createElement('input'), {
      type: 'search',
      className: `${getClassNames(input).join(' ')} ${getClassNames(inputCloned).join(' ')}`,
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: false,
    });

    inp.setAttribute('role', 'textbox');
    inp.setAttribute('aria-autocomplete', 'list');
    if (placeholderValue) {
      inp.setAttribute('aria-label', placeholderValue);
    }

    if (!labelId) {
      addAriaLabel(this._docRoot, this.passedElement.element.id, inp);
    }

    return inp;
  },

  dropdown({ classNames: { list, listDropdown } }: TemplateOptions): HTMLDivElement {
    const div = document.createElement('div');

    div.classList.add(...getClassNames(list));
    div.classList.add(...getClassNames(listDropdown));
    div.setAttribute('aria-expanded', 'false');

    return div;
  },

  notice(
    { classNames: { item, itemChoice, addChoice, noResults, noChoices, notice: noticeItem } }: TemplateOptions,
    innerText: string,
    type: NoticeType = NoticeTypes.generic,
  ): HTMLDivElement {
    const classes = [...getClassNames(item), ...getClassNames(itemChoice), ...getClassNames(noticeItem)];

    // eslint-disable-next-line default-case
    switch (type) {
      case NoticeTypes.addChoice:
        classes.push(...getClassNames(addChoice));
        break;
      case NoticeTypes.noResults:
        classes.push(...getClassNames(noResults));
        break;
      case NoticeTypes.noChoices:
        classes.push(...getClassNames(noChoices));
        break;
    }

    const notice = Object.assign(document.createElement('div'), {
      innerHTML: innerText,
      className: classes.join(' '),
    });

    if (type === NoticeTypes.addChoice) {
      notice.dataset.choiceSelectable = '';
      notice.dataset.choice = '';
    }

    return notice;
  },

  option(choice: ChoiceFull): HTMLOptionElement {
    // HtmlOptionElement's label value does not support HTML, so the avoid double escaping unwrap the untrusted string.
    const labelValue = unwrapStringForRaw(choice.label);

    const opt = new Option(labelValue, choice.value, false, choice.selected);
    const { labelClass, labelDescription } = choice;
    if (labelClass) {
      opt.dataset.labelClass = getClassNames(labelClass).join(' ');
    }
    if (labelDescription) {
      opt.dataset.labelDescription = labelDescription;
    }

    assignCustomProperties(opt, choice.customProperties);

    opt.disabled = choice.disabled;
    if (choice.selected) {
      opt.setAttribute('selected', '');
    }

    return opt;
  },
};

export default templates;
