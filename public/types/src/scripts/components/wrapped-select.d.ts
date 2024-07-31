import { ClassNames } from '../interfaces/class-names';
import WrappedElement from './wrapped-element';
import { GroupFull } from '../interfaces/group-full';
import { ChoiceFull } from '../interfaces/choice-full';
export default class WrappedSelect extends WrappedElement {
    element: HTMLSelectElement;
    classNames: ClassNames;
    template: (data: object) => HTMLOptionElement;
    constructor({ element, classNames, template, }: {
        element: HTMLSelectElement;
        classNames: ClassNames;
        template: (data: object) => HTMLOptionElement;
    });
    get placeholderOption(): HTMLOptionElement | null;
    get optionGroups(): Element[];
    get options(): HTMLOptionElement[];
    set options(options: ChoiceFull[]);
    addOptions(choices: ChoiceFull[]): void;
    optionsAsChoices(): (ChoiceFull | GroupFull)[];
    appendDocFragment(fragment: DocumentFragment): void;
    _optionToChoice(option: HTMLOptionElement): ChoiceFull;
    _optgroupToChoice(optgroup: HTMLOptGroupElement): GroupFull;
}
//# sourceMappingURL=wrapped-select.d.ts.map