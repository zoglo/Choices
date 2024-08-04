import { expect } from 'chai';
import items, { defaultState } from './items';
import { RemoveItemAction } from '../actions/items';
import { cloneObject } from '../lib/utils';
import { ChoiceFull } from '../interfaces/choice-full';
import { ActionType } from '../interfaces';

describe('reducers/items', () => {
  it('should return same state when no action matches', () => {
    expect(items(defaultState, {} as any)).to.equal(defaultState);
  });

  describe('when items do not exist', () => {
    describe('ADD_ITEM', () => {
      const choice: ChoiceFull = {
        value: 'Item one',
        label: 'Item one',
        id: 1234,
        groupId: 1,
        score: 0,
        customProperties: {
          property: 'value',
        },
        placeholder: true,
        active: true,
        disabled: false,
        selected: false,
        highlighted: false,
      };

      describe('passing expected values', () => {
        let actualResponse: ChoiceFull[];

        beforeEach(() => {
          actualResponse = items(undefined, {
            type: ActionType.ADD_ITEM,
            item: cloneObject(choice),
          });
        });

        it('adds item', () => {
          const expectedResponse = [choice];

          expect(actualResponse).to.eql(expectedResponse);
        });

        it('unhighlights all highlighted items', () => {
          actualResponse.forEach((item) => {
            expect(item.highlighted).to.equal(false);
          });
        });
      });

      describe('fallback values', () => {
        describe('passing no placeholder value', () => {
          const item = Object.assign(cloneObject(choice), {
            placeholder: false,
          });
          it('adds item with placeholder set to false', () => {
            const expectedResponse = [item];

            const actualResponse = items(undefined, {
              type: ActionType.ADD_ITEM,
              item: cloneObject(item),
            });

            expect(actualResponse).to.eql(expectedResponse);
          });
        });
      });
    });
  });

  describe('when items exist', () => {
    let state: ChoiceFull[];

    beforeEach(() => {
      state = [
        {
          id: 1,
          groupId: -1,
          score: 0,
          value: 'Item one',
          label: 'Item one',
          active: false,
          highlighted: false,
          customProperties: {},
          placeholder: false,
          disabled: false,
          selected: false,
        },
        {
          id: 2,
          groupId: -1,
          score: 0,
          value: 'Item one',
          label: 'Item one',
          active: true,
          highlighted: false,
          customProperties: {},
          placeholder: false,
          disabled: false,
          selected: false,
        },
      ];
    });

    describe('REMOVE_ITEM', () => {
      it('sets an item to be inactive based on passed ID', () => {
        const clonedState = state.slice(0);
        const id = 2;
        const expectedResponse = [
          {
            ...state[0],
          },
          {
            ...state[1],
            active: false,
          },
        ] as ChoiceFull[];

        const actualResponse = items(clonedState, {
          type: ActionType.REMOVE_ITEM,
          item: {
            id,
          },
        } as RemoveItemAction);

        expect(actualResponse).to.eql(expectedResponse);
      });
    });

    describe('HIGHLIGHT_ITEM', () => {
      it('sets an item to be inactive based on passed ID', () => {
        const clonedState = state.slice(0);
        const id = 2;
        const expectedResponse = [
          {
            ...state[0],
          },
          {
            ...state[1],
            highlighted: true,
          },
        ] as ChoiceFull[];

        const actualResponse = items(clonedState, {
          type: ActionType.HIGHLIGHT_ITEM,
          id,
          highlighted: true,
        });

        expect(actualResponse).to.eql(expectedResponse);
      });
    });
  });
});
