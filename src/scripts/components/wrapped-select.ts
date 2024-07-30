import { parseCustomProperties } from '../lib/utils';
import { ClassNames } from '../interfaces/class-names';
import WrappedElement from './wrapped-element';
import { isHTMLOptgroup, isHTMLOption } from '../lib/htmlElementGuards';
import { GroupFull } from '../interfaces/group-full';
import { ChoiceFull } from '../interfaces/choice-full';

export default class WrappedSelect extends WrappedElement {
  element: HTMLSelectElement;

  classNames: ClassNames;

  template: (data: object) => HTMLOptionElement;

  constructor({
    element,
    classNames,
    template,
  }: {
    element: HTMLSelectElement;
    classNames: ClassNames;
    template: (data: object) => HTMLOptionElement;
  }) {
    super({ element, classNames });
    this.template = template;
  }

  get placeholderOption(): HTMLOptionElement | null {
    return (
      this.element.querySelector('option[value=""]') ||
      // Backward compatibility layer for the non-standard placeholder attribute supported in older versions.
      this.element.querySelector('option[placeholder]')
    );
  }

  get optionGroups(): Element[] {
    return Array.from(this.element.getElementsByTagName('OPTGROUP'));
  }

  get options(): HTMLOptionElement[] {
    return Array.from(this.element.options);
  }

  set options(options: ChoiceFull[]) {
    const fragment = document.createDocumentFragment();
    const addOptionToFragment = (data: ChoiceFull): void => {
      // Create a standard select option
      const option = data.element ? data.element : this.template(data);
      // Append it to fragment
      fragment.appendChild(option);
    };

    // Add each list item to list
    options.forEach((optionData: ChoiceFull) =>
      addOptionToFragment(optionData),
    );

    this.appendDocFragment(fragment);
  }

  optionsAsChoices(): (ChoiceFull | GroupFull)[] {
    const choices: (ChoiceFull | GroupFull)[] = [];

    this.element
      .querySelectorAll(':scope > option, :scope > optgroup')
      .forEach((e) => {
        if (isHTMLOption(e)) {
          choices.push(this._optionToChoice(e as HTMLOptionElement));
        } else if (isHTMLOptgroup(e)) {
          choices.push(this._optgroupToChoice(e as HTMLOptGroupElement));
        }
        // There should only be those two in a <select> and we wouldn't care about others anyways
        // todo: hr as empty optgroup
      });

    return choices;
  }

  appendDocFragment(fragment: DocumentFragment): void {
    this.element.innerHTML = '';
    this.element.appendChild(fragment);
  }

  // eslint-disable-next-line class-methods-use-this
  _optionToChoice(option: HTMLOptionElement): ChoiceFull {
    const result: ChoiceFull = {
      id: 0,
      groupId: 0,
      value: option.value,
      label: option.innerHTML,
      element: option,
      active: true,
      selected: option.selected,
      disabled: option.disabled,
      highlighted: false,
      placeholder: option.value === '' || option.hasAttribute('placeholder'),
      labelClass:
        typeof option.dataset.labelClass !== 'undefined'
          ? option.dataset.labelClass.split(' ')
          : undefined,
      labelDescription:
        typeof option.dataset.labelDescription !== 'undefined'
          ? option.dataset.labelDescription
          : undefined,
      customProperties: parseCustomProperties(option.dataset.customProperties)
    };

    return result as ChoiceFull;
  }

  _optgroupToChoice(optgroup: HTMLOptGroupElement): GroupFull {
    const options = optgroup.querySelectorAll('option');
    const choices = Array.from(options).map((option) =>
      this._optionToChoice(option),
    );

    const result: GroupFull = {
      id: 0,
      label: optgroup.label || '',
      element: optgroup,
      active: choices.length !== 0,
      disabled: optgroup.disabled,
      choices,
    };

    return result as GroupFull;
  }
}
