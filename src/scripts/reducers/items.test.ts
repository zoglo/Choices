import { expect } from 'chai';
import items, { defaultState } from './items';
import { RemoveItemAction } from '../actions/items';
import { Choice } from '../interfaces';

describe('reducers/items', () => {
  it('should return same state when no action matches', () => {
    expect(items(defaultState, {} as any)).to.equal(defaultState);
  });

  describe('when items do not exist', () => {
    describe('ADD_ITEM', () => {
      const value = 'Item one';
      const label = 'Item one';
      const id = 1234;
      const groupId = 1;
      const customProperties = {
        property: 'value',
      };
      const placeholder = true;
      const keyCode = 10;

      describe('passing expected values', () => {
        let actualResponse: Choice[];

        beforeEach(() => {
          actualResponse = items(undefined, {
            type: 'ADD_ITEM',
            item: {
              value,
              label,
              id,
              groupId,
              customProperties,
              placeholder,
              keyCode,
            },
          });
        });

        it('adds item', () => {
          const expectedResponse = [
            {
              id,
              groupId,
              value,
              label,
              active: true,
              highlighted: false,
              customProperties,
              placeholder,
              keyCode,
            } as Choice,
          ];

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
          it('adds item with placeholder set to false', () => {
            const expectedResponse = [
              {
                id,
                groupId,
                value,
                label,
                active: true,
                highlighted: false,
                customProperties,
                placeholder: false,
                keyCode,
              } as Choice,
            ];

            const actualResponse = items(undefined, {
              type: 'ADD_ITEM',
              item: {
                value,
                label,
                id,
                groupId,
                customProperties,
                placeholder: undefined,
                keyCode,
              } as Choice,
            });

            expect(actualResponse).to.eql(expectedResponse);
          });
        });
      });
    });
  });

  describe('when items exist', () => {
    let state: Choice[];

    beforeEach(() => {
      state = [
        {
          id: 1,
          groupId: -1,
          value: 'Item one',
          label: 'Item one',
          active: false,
          highlighted: false,
          customProperties: null,
          placeholder: false,
        },
        {
          id: 2,
          groupId: -1,
          value: 'Item one',
          label: 'Item one',
          active: true,
          highlighted: false,
          customProperties: null,
          placeholder: false,
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
        ] as Choice[];

        const actualResponse = items(clonedState, {
          type: 'REMOVE_ITEM',
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
        ] as Choice[];

        const actualResponse = items(clonedState, {
          type: 'HIGHLIGHT_ITEM',
          id,
          highlighted: true,
        });

        expect(actualResponse).to.eql(expectedResponse);
      });
    });
  });
});
