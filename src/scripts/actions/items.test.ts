import { expect } from 'chai';
import * as actions from './items';
import { cloneObject } from '../lib/utils';
import { ChoiceFull } from '../interfaces/choice-full';
import { ActionType } from '../interfaces';

describe('actions/items', () => {
  describe('addItem action', () => {
    it('returns ADD_ITEM action', () => {
      const item: ChoiceFull = {
        highlighted: false,
        active: false,
        disabled: false,
        selected: false,
        value: 'test',
        label: 'test',
        id: 1,
        groupId: 1,
        score: 0,
        customProperties: { test: true },
        placeholder: true,
      };

      const expectedAction: actions.AddItemAction = {
        type: ActionType.ADD_ITEM,
        item,
      };

      expect(actions.addItem(cloneObject(item))).to.eql(expectedAction);
    });
  });

  describe('removeItem action', () => {
    it('returns REMOVE_ITEM action', () => {
      const item: ChoiceFull = {
        highlighted: false,
        active: false,
        disabled: false,
        selected: false,
        value: 'test',
        label: 'test',
        id: 1,
        groupId: 1,
        score: 0,
        customProperties: { test: true },
        placeholder: true,
      };

      const expectedAction: actions.RemoveItemAction = {
        type: ActionType.REMOVE_ITEM,
        item,
      };

      expect(actions.removeItem(cloneObject(item))).to.eql(expectedAction);
    });
  });

  describe('highlightItem action', () => {
    it('returns HIGHLIGHT_ITEM action', () => {
      const id = 1;
      const highlighted = true;

      const expectedAction: actions.HighlightItemAction = {
        type: ActionType.HIGHLIGHT_ITEM,
        id,
        highlighted,
      };

      expect(actions.highlightItem(id, highlighted)).to.eql(expectedAction);
    });
  });
});
