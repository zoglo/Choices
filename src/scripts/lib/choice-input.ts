import { Choice, Group } from '../interfaces';

export type ChoiceGroup = {
  id?: string | number;
  label: string;
  active?: boolean;
  disabled?: boolean;
  choices: Choice[];
};

export const mapInputToChoice = (
  value: string | Choice | ChoiceGroup,
  allowGroup: boolean,
): Choice | Group => {
  if (typeof value === 'string') {
    return mapInputToChoice(
      {
        value,
        label: value,
        selected: true,
      } as Choice,
      false,
    );
  }

  if (value.choices) {
    if (!allowGroup) {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup
      throw new TypeError(`optGroup is not allowed`);
    }
    const group = value as ChoiceGroup;
    const choices = group.choices.map((e) =>
      mapInputToChoice(e, false),
    ) as Choice[];

    return {
      id: group.id || Math.floor(new Date().valueOf() * Math.random()),
      value: group.label,
      active: choices.length !== 0,
      disabled: !!group.disabled,
      choices,
    } as Group;
  }

  const choice = value as Choice;
  const coerceBool = (arg: unknown, defaultValue: boolean = true) =>
    typeof arg === 'undefined' ? defaultValue : !!arg;

  return {
    value: choice.value,
    label: choice.label || choice.value,
    active: coerceBool(choice.active),
    selected: coerceBool(choice.selected, false),
    disabled: coerceBool(choice.disabled, false),
    placeholder: coerceBool(choice.placeholder, false),
    labelClass: choice.labelClass,
    labelDescription: choice.labelDescription,
    customProperties: choice.customProperties,
  } as Choice;
};
