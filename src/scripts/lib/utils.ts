/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventType } from '../interfaces/event-type';
import { StringUntrusted } from '../interfaces/string-untrusted';
import { StringPreEscaped } from '../interfaces/string-pre-escaped';
import { ChoiceFull } from '../interfaces/choice-full';

export const getRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

export const generateChars = (length: number): string =>
  Array.from({ length }, () => getRandomNumber(0, 36).toString(36)).join('');

export const generateId = (
  element: HTMLInputElement | HTMLSelectElement,
  prefix: string,
): string => {
  let id =
    element.id ||
    (element.name && `${element.name}-${generateChars(2)}`) ||
    generateChars(4);
  id = id.replace(/(:|\.|\[|\]|,)/g, '');
  id = `${prefix}-${id}`;

  return id;
};

export const getType = (obj: any): string =>
  Object.prototype.toString.call(obj).slice(8, -1);

export const isType = (type: string, obj: any): boolean =>
  obj !== undefined && obj !== null && getType(obj) === type;

export const wrap = (
  element: HTMLElement,
  wrapper: HTMLElement = document.createElement('div'),
): HTMLElement => {
  if (element.parentNode) {
    if (element.nextSibling) {
      element.parentNode.insertBefore(wrapper, element.nextSibling);
    } else {
      element.parentNode.appendChild(wrapper);
    }
  }

  return wrapper.appendChild(element);
};

export const getAdjacentEl = (
  startEl: Element,
  selector: string,
  direction = 1,
): Element => {
  const prop = `${direction > 0 ? 'next' : 'previous'}ElementSibling`;

  let sibling = startEl[prop];
  while (sibling) {
    if (sibling.matches(selector)) {
      return sibling;
    }
    sibling = sibling[prop];
  }

  return sibling;
};

export const isScrolledIntoView = (
  element: HTMLElement,
  parent: HTMLElement,
  direction = 1,
): boolean => {
  if (!element) {
    return false;
  }

  let isVisible;

  if (direction > 0) {
    // In view from bottom
    isVisible =
      parent.scrollTop + parent.offsetHeight >=
      element.offsetTop + element.offsetHeight;
  } else {
    // In view from top
    isVisible = element.offsetTop >= parent.scrollTop;
  }

  return isVisible;
};

export const sanitise = <T>(
  value: T | StringUntrusted | StringPreEscaped | string,
): T | string => {
  if (typeof value !== 'string') {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      if ('raw' in value) {
        return sanitise(value.raw);
      }
      if ('trusted' in value) {
        return value.trusted;
      }
    }

    return value;
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/'/g, '&#039;')
    .replace(/"/g, '&quot;');
};

export const strToEl = ((): ((str: string) => Element) => {
  const tmpEl = document.createElement('div');

  return (str): Element => {
    const cleanedInput = str.trim();
    tmpEl.innerHTML = cleanedInput;
    const firldChild = tmpEl.children[0];

    while (tmpEl.firstChild) {
      tmpEl.removeChild(tmpEl.firstChild);
    }

    return firldChild;
  };
})();

export interface RecordToCompare {
  value?: StringUntrusted | string;
  label?: StringUntrusted | string;
}

export const unwrapStringForRaw = (
  s?: StringUntrusted | StringPreEscaped | string,
): string => {
  if (typeof s === 'string') {
    return s;
  }

  if (typeof s === 'object') {
    if ('trusted' in s) {
      return s.trusted;
    }
    if ('raw' in s) {
      return s.raw;
    }
  }

  if (s === null || s === undefined) {
    return '';
  }

  return `${s}`;
};

export const unwrapStringForEscaped = (
  s?: StringUntrusted | StringPreEscaped | string,
): string => {
  if (typeof s === 'string') {
    return s;
  }

  if (typeof s === 'object') {
    if ('escaped' in s) {
      return s.escaped;
    }
    if ('trusted' in s) {
      return s.trusted;
    }
  }

  if (s === null || s === undefined) {
    return '';
  }

  return `${s}`;
};

export const sortByAlpha = (
  { value, label = value }: RecordToCompare,
  { value: value2, label: label2 = value2 }: RecordToCompare,
): number =>
  unwrapStringForRaw(label).localeCompare(unwrapStringForRaw(label2), [], {
    sensitivity: 'base',
    ignorePunctuation: true,
    numeric: true,
  });

export const sortByScore = (
  a: Pick<ChoiceFull, 'score'>,
  b: Pick<ChoiceFull, 'score'>,
): number => {
  const { score: scoreA = 0 } = a;
  const { score: scoreB = 0 } = b;

  return scoreA - scoreB;
};

export const dispatchEvent = (
  element: HTMLElement,
  type: EventType,
  customArgs: object | null = null,
): boolean => {
  const event = new CustomEvent(type, {
    detail: customArgs,
    bubbles: true,
    cancelable: true,
  });

  return element.dispatchEvent(event);
};

export const existsInArray = (
  array: any[],
  value: string,
  key = 'value',
): boolean =>
  array.some((item) => {
    if (typeof value === 'string') {
      return item[key] === value.trim();
    }

    return item[key] === value;
  });

export const cloneObject = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const isEmptyObject = (obj: object | undefined | null): boolean => {
  if (!obj || typeof obj !== 'object') {
    return true;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns an array of keys present on the first but missing on the second object
 */
export const diff = (
  a: Record<string, any>,
  b: Record<string, any>,
): string[] => {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();

  return aKeys.filter((i) => bKeys.indexOf(i) < 0);
};

export const deepExtend = <T extends object>(...args: Partial<T>[]): T => {
  // Variables
  const target = args[0] || {};
  for (let i = 1; i < args.length; i++) {
    const source = args[i];

    Object.keys(source).forEach((key) => {
      const srcValue = target[key];
      const copyValue = source[key];

      if (copyValue && typeof copyValue === 'object') {
        if (Array.isArray(copyValue)) {
          target[key] = srcValue && Array.isArray(srcValue) ? srcValue : [];
        } else {
          target[key] =
            srcValue && typeof srcValue === 'object' ? srcValue : {};
        }

        target[key] = deepExtend<object>(target[key], copyValue);
      } else if (copyValue !== undefined) {
        target[key] = copyValue;
      }
    });
  }

  return target as T;
};

export const getClassNames = (
  ClassNames: Array<string> | string,
): Array<string> => {
  return Array.isArray(ClassNames) ? ClassNames : [ClassNames];
};

export const getClassNamesSelector = (
  option: string | Array<string> | null,
) => {
  if (option && Array.isArray(option)) {
    return option
      .map((item) => {
        return `.${item}`;
      })
      .join(' ');
  }

  return `.${option}`;
};

export const parseCustomProperties = (customProperties): any => {
  if (typeof customProperties !== 'undefined') {
    try {
      return JSON.parse(customProperties);
    } catch (e) {
      return customProperties;
    }
  }

  return {};
};

export const parseDataSetId = (element?: HTMLElement): number | undefined => {
  if (!element) {
    return undefined;
  }

  const { id } = element.dataset;
  if (!id) {
    return undefined;
  }

  return parseInt(id, 10);
};
