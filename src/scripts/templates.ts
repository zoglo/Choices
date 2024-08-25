/**
 * Helpers to create HTML elements used by Choices
 * Can be overridden by providing `callbackOnCreateTemplates` option.
 * `Choices.defaults.templates` allows access to the default template methods from `callbackOnCreateTemplates`
 */

import { ChoiceFull } from './interfaces/choice-full';
import { GroupFull } from './interfaces/group-full';
import { PassedElementType } from './interfaces/passed-element-type';
import { StringPreEscaped } from './interfaces/string-pre-escaped';
import { getClassNames, unwrapStringForRaw, resolveNoticeFunction, setElementHtml, escapeForTemplate } from './lib/utils';
import { NoticeType, NoticeTypes, TemplateOptions, Templates as TemplatesInterface } from './interfaces/templates';
import { StringUntrusted } from './interfaces/string-untrusted';

const isEmptyObject = (obj: object): boolean => {
  // eslint-disable-next-line no-restricted-syntax
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true;
};

const assignCustomProperties = (el: HTMLElement, choice: ChoiceFull, withCustomProperties: boolean): void => {
  const { dataset } = el;
  const { customProperties, labelClass, labelDescription } = choice;

  if (labelClass) {
    dataset.labelClass = getClassNames(labelClass).join(' ');
  }

  if (labelDescription) {
    dataset.labelDescription = labelDescription;
  }

  if (withCustomProperties && customProperties) {
    if (typeof customProperties === 'string') {
      dataset.customProperties = customProperties;
    } else if (typeof customProperties === 'object' && !isEmptyObject(customProperties)) {
      dataset.customProperties = JSON.stringify(customProperties);
    }
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
    const div = document.createElement('div');
    div.className = getClassNames(containerOuter).join(' ');

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
    const div = document.createElement('div');
    div.className = getClassNames(containerInner).join(' ');

    return div;
  },

  itemList(
    { searchEnabled, classNames: { list, listSingle, listItems } }: TemplateOptions,
    isSelectOneElement: boolean,
  ): HTMLDivElement {
    const div = document.createElement('div');
    div.className = `${getClassNames(list).join(' ')} ${isSelectOneElement ? getClassNames(listSingle).join(' ') : getClassNames(listItems).join(' ')}`;

    if (this._isSelectElement && searchEnabled) {
      div.setAttribute('role', 'listbox');
    }

    return div;
  },

  placeholder(
    { allowHTML, classNames: { placeholder } }: TemplateOptions,
    value: StringPreEscaped | string,
  ): HTMLDivElement {
    const div = document.createElement('div');
    div.className = getClassNames(placeholder).join(' ');
    setElementHtml(div, allowHTML, value);

    return div;
  },

  item(
    {
      allowHTML,
      removeItemButtonAlignLeft,
      removeItemIconText,
      removeItemLabelText,
      classNames: { item, button, highlightedState, itemSelectable, placeholder },
    }: TemplateOptions,
    choice: ChoiceFull,
    removeItemButton: boolean,
  ): HTMLDivElement {
    const { labelClass, label, disabled, value } = choice;
    const rawValue = unwrapStringForRaw(value);
    const div = document.createElement('div');
    div.className = getClassNames(item).join(' ');

    if (labelClass) {
      const spanLabel = document.createElement('span');
      setElementHtml(spanLabel, allowHTML, label);
      spanLabel.className = getClassNames(labelClass).join(' ');
      div.appendChild(spanLabel);
    } else {
      setElementHtml(div, allowHTML, label);
    }

    const { dataset } = div;
    dataset.item = '';
    dataset.id = choice.id as unknown as string;
    dataset.value = rawValue;

    assignCustomProperties(div, choice, true);

    if (disabled || this.containerOuter.isDisabled) {
      div.setAttribute('aria-disabled', 'true');
    }
    if (this._isSelectElement) {
      div.setAttribute('aria-selected', 'true');
      div.setAttribute('role', 'option');
    }

    if (choice.placeholder) {
      div.classList.add(...getClassNames(placeholder));
      dataset.placeholder = '';
    }

    div.classList.add(...(choice.highlighted ? getClassNames(highlightedState) : getClassNames(itemSelectable)));

    if (removeItemButton) {
      if (disabled) {
        div.classList.remove(...getClassNames(itemSelectable));
      }
      dataset.deletable = '';

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = getClassNames(button).join(' ');
      setElementHtml(removeButton, true, resolveNoticeFunction(removeItemIconText, value));

      const REMOVE_ITEM_LABEL = resolveNoticeFunction(removeItemLabelText, value);
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
    const div = document.createElement('div');
    div.className = getClassNames(list).join(' ');

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
    const div = document.createElement('div');
    div.className = `${getClassNames(group).join(' ')} ${disabled ? getClassNames(itemDisabled).join(' ') : ''}`;

    div.setAttribute('role', 'group');

    const { dataset } = div;
    dataset.group = '';
    dataset.id = id as unknown as string;
    dataset.value = rawLabel;

    if (disabled) {
      div.setAttribute('aria-disabled', 'true');
    }

    const heading = document.createElement('div');
    heading.className = getClassNames(groupHeading).join(' ');
    setElementHtml(heading, allowHTML, label || '');
    div.appendChild(heading);

    return div;
  },

  choice(
    {
      allowHTML,
      classNames: { item, itemChoice, itemSelectable, selectedState, itemDisabled, description, placeholder },
    }: TemplateOptions,
    choice: ChoiceFull,
    selectText: string,
    groupName?: string,
  ): HTMLDivElement {
    // eslint-disable-next-line prefer-destructuring
    let label: string | StringUntrusted | StringPreEscaped = choice.label;
    const { value, elementId, groupId, labelClass, labelDescription } = choice;
    const rawValue = unwrapStringForRaw(value);
    const div = document.createElement('div');
    div.id = elementId as string;
    div.className = `${getClassNames(item).join(' ')} ${getClassNames(itemChoice).join(' ')}`;

    if (groupName && typeof label === 'string') {
      label = escapeForTemplate(allowHTML, label);
      label += ` (${groupName})`;
      label = { trusted: label };
    }

    let describedBy: HTMLElement = div;
    if (labelClass) {
      const spanLabel = document.createElement('span');
      setElementHtml(spanLabel, allowHTML, label);
      spanLabel.className = getClassNames(labelClass).join(' ');
      describedBy = spanLabel;
      div.appendChild(spanLabel);
    } else {
      setElementHtml(div, allowHTML, label);
    }

    if (labelDescription) {
      const descId = `${elementId}-description`;
      describedBy.setAttribute('aria-describedby', descId);
      const spanDesc = document.createElement('span');
      setElementHtml(spanDesc, allowHTML, labelDescription);
      spanDesc.id = descId;
      spanDesc.classList.add(...getClassNames(description));
      div.appendChild(spanDesc);
    }

    if (choice.selected) {
      div.classList.add(...getClassNames(selectedState));
    }

    if (choice.placeholder) {
      div.classList.add(...getClassNames(placeholder));
    }

    const { dataset } = div;
    div.setAttribute('role', groupId ? 'treeitem' : 'option');
    if (groupId) {
      dataset.groupId = `${groupId}`;
    }

    dataset.choice = '';
    dataset.id = choice.id as unknown as string;
    dataset.value = rawValue;
    if (selectText) {
      dataset.selectText = selectText;
    }

    assignCustomProperties(div, choice, false);

    if (choice.disabled) {
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
    const inp = document.createElement('input');
    inp.type = 'search';
    inp.className = `${getClassNames(input).join(' ')} ${getClassNames(inputCloned).join(' ')}`;
    inp.autocomplete = 'off';
    inp.autocapitalize = 'off';
    inp.spellcheck = false;

    inp.setAttribute('role', 'textbox');
    inp.setAttribute('aria-autocomplete', 'list');
    if (placeholderValue) {
      inp.setAttribute('aria-label', placeholderValue);
    } else if (!labelId) {
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
    innerHTML: string,
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

    const notice = document.createElement('div');
    setElementHtml(notice, true, innerHTML);
    notice.className = classes.join(' ');

    if (type === NoticeTypes.addChoice) {
      const { dataset } = notice;
      dataset.choiceSelectable = '';
      dataset.choice = '';
    }

    return notice;
  },

  option(choice: ChoiceFull): HTMLOptionElement {
    // HtmlOptionElement's label value does not support HTML, so the avoid double escaping unwrap the untrusted string.
    const labelValue = unwrapStringForRaw(choice.label);

    const opt = new Option(labelValue, choice.value, false, choice.selected);
    assignCustomProperties(opt, choice, true);

    opt.disabled = choice.disabled;
    if (choice.selected) {
      opt.setAttribute('selected', '');
    }

    return opt;
  },
};

export default templates;
