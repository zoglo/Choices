import { parseCustomProperties } from '../lib/utils';
import { ClassNames } from '../interfaces/class-names';
import WrappedElement from './wrapped-element';
import { isHTMLOptgroup, isHTMLOption } from '../lib/htmlElementGuards';
import { GroupFull } from '../interfaces/group-full';
import { ChoiceFull } from '../interfaces/choice-full';
import { stringToHtmlClass } from '../lib/choice-input';

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

  addOptions(choices: ChoiceFull[]) {
    choices.forEach((obj) => {
      const choice = obj;
      if (choice.element) {
        return;
      }

      const option = this.template(choice);
      this.element.appendChild(option);
      choice.element = option;
    });
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
          ? stringToHtmlClass(option.dataset.labelClass)
          : undefined,
      labelDescription:
        typeof option.dataset.labelDescription !== 'undefined'
          ? option.dataset.labelDescription
          : undefined,
      customProperties: parseCustomProperties(option.dataset.customProperties),
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
