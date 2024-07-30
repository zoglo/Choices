import { StringUntrusted } from './string-untrusted';
export interface Choice {
    id?: number;
    labelClass?: string | Array<string>;
    labelDescription?: string;
    customProperties?: Record<string, any>;
    disabled?: boolean;
    active?: boolean;
    elementId?: number;
    groupId?: number;
    keyCode?: number;
    label: StringUntrusted | string;
    placeholder?: boolean;
    selected?: boolean;
    value: any;
    score?: number;
    choices?: Choice[];
}
//# sourceMappingURL=choice.d.ts.map