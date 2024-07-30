import { Choice } from './choice';
import { Group } from './group';

export interface State {
  choices: Choice[];
  groups: Group[];
  items: Choice[];
  loading: boolean;
}
