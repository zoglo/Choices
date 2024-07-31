import { StringUntrusted } from './string-untrusted';
export interface InputChoice {
    id?: number;
    highlighted?: boolean;
    labelClass?: string | Array<string>;
    labelDescription?: string;
    customProperties?: Record<string, any> | null;
    disabled?: boolean;
    active?: boolean;
    keyCode?: number;
    label: StringUntrusted | string;
    placeholder?: boolean;
    selected?: boolean;
    value: any;
}
//# sourceMappingURL=input-choice.d.ts.map