import { Choice } from '../interfaces/choice';
import { parseCustomProperties } from '../lib/utils';
import { ClassNames } from '../interfaces/class-names';
import WrappedElement from './wrapped-element';
import { isHTMLOptgroup, isHTMLOption } from '../lib/htmlElementGuards';
import { Group } from '../interfaces';

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

  set options(options: Choice[]) {
    const fragment = document.createDocumentFragment();
    const addOptionToFragment = (data: Choice): void => {
      // Create a standard select option
      const option = data.element ? data.element : this.template(data);
      // Append it to fragment
      fragment.appendChild(option);
    };

    // Add each list item to list
    options.forEach((optionData: Choice) => addOptionToFragment(optionData));

    this.appendDocFragment(fragment);
  }

  optionsAsChoices(): Partial<Choice>[] {
    const choices: Partial<Choice>[] = [];

    this.element.querySelectorAll(':scope > *').forEach((e) => {
      if (isHTMLOption(e)) {
        choices.push(this._optionToChoice(e as HTMLOptionElement));
      } else if (isHTMLOptgroup(e)) {
        choices.push(this._optgroupToChoice(e as HTMLOptGroupElement));
      }
      // There should only be those two in a <select> and we wouldn't care about others anyways
    });

    return choices;
  }

  appendDocFragment(fragment: DocumentFragment): void {
    this.element.innerHTML = '';
    this.element.appendChild(fragment);
  }

  // eslint-disable-next-line class-methods-use-this
  _optionToChoice(option: HTMLOptionElement): Choice {
    return {
      value: option.value,
      label: option.innerHTML,
      element: option,
      active: true,
      selected: option.selected,
      disabled: option.disabled,
      placeholder: option.value === '' || option.hasAttribute('placeholder'),
      labelClass:
        typeof option.dataset.labelClass !== 'undefined'
          ? option.dataset.labelClass.split(' ')
          : undefined,
      labelDescription:
        typeof option.dataset.labelDescription !== 'undefined'
          ? option.dataset.labelDescription
          : undefined,
      customProperties: parseCustomProperties(option.dataset.customProperties),
    } as Choice;
  }

  _optgroupToChoice(optgroup: HTMLOptGroupElement): Partial<Choice> {
    const options = optgroup.querySelectorAll('option');
    const choices = Array.from(options).map((option) =>
      this._optionToChoice(option),
    );

    return {
      id: Math.floor(new Date().valueOf() * Math.random()),
      value: optgroup.label || '',
      element: optgroup,
      active: choices.length !== 0,
      disabled: optgroup.disabled,
      choices,
    } as Group;
  }
}
