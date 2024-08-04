/**
 * Helpers to create HTML elements used by Choices
 * Can be overridden by providing `callbackOnCreateTemplates` option.
 * `Choices.defaults.templates` allows access to the default template methods from `callbackOnCreateTemplates`
 */
import { ChoiceFull } from './interfaces/choice-full';
import { GroupFull } from './interfaces/group-full';
import { PassedElementType } from './interfaces/passed-element-type';
import { StringPreEscaped } from './interfaces/string-pre-escaped';
import { StringUntrusted } from './interfaces/string-untrusted';
import { Options } from './interfaces/options';
type TemplateOptions = Pick<Options, 'classNames' | 'allowHTML' | 'removeItemButtonAlignLeft'>;
export declare const escapeForTemplate: (allowHTML: boolean, s: StringUntrusted | StringPreEscaped | string) => string;
declare const templates: {
    containerOuter({ classNames: { containerOuter } }: TemplateOptions, dir: HTMLElement["dir"], isSelectElement: boolean, isSelectOneElement: boolean, searchEnabled: boolean, passedElementType: PassedElementType, labelId: string): HTMLDivElement;
    containerInner({ classNames: { containerInner }, }: TemplateOptions): HTMLDivElement;
    itemList({ classNames: { list, listSingle, listItems } }: TemplateOptions, isSelectOneElement: boolean): HTMLDivElement;
    placeholder({ allowHTML, classNames: { placeholder } }: TemplateOptions, value: StringPreEscaped | string): HTMLDivElement;
    item({ allowHTML, removeItemButtonAlignLeft, classNames: { item, button, highlightedState, itemSelectable, placeholder, }, }: TemplateOptions, { id, value, label, labelClass, labelDescription, customProperties, active, disabled, highlighted, placeholder: isPlaceholder, }: ChoiceFull, removeItemButton: boolean): HTMLDivElement;
    choiceList({ classNames: { list } }: TemplateOptions, isSelectOneElement: boolean): HTMLDivElement;
    choiceGroup({ allowHTML, classNames: { group, groupHeading, itemDisabled }, }: TemplateOptions, { id, label, disabled }: GroupFull): HTMLDivElement;
    choice({ allowHTML, classNames: { item, itemChoice, itemSelectable, selectedState, itemDisabled, description, placeholder, }, }: TemplateOptions, { id, value, label, groupId, elementId, labelClass, labelDescription, disabled: isDisabled, selected: isSelected, placeholder: isPlaceholder, }: ChoiceFull, selectText: string): HTMLDivElement;
    input({ classNames: { input, inputCloned } }: TemplateOptions, placeholderValue: string | null): HTMLInputElement;
    dropdown({ classNames: { list, listDropdown }, }: TemplateOptions): HTMLDivElement;
    notice({ allowHTML, classNames: { item, itemChoice, addChoice, noResults, noChoices }, }: TemplateOptions, innerText: StringUntrusted | StringPreEscaped | string, type?: "no-choices" | "no-results" | "add-choice" | ""): HTMLDivElement;
    option({ label, value, labelClass, labelDescription, customProperties, active, disabled, }: ChoiceFull): HTMLOptionElement;
};
export default templates;
//# sourceMappingURL=templates.d.ts.map