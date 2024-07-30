import { expect } from 'chai';
import choices, { defaultState } from './choices';
import { cloneObject } from '../lib/utils';
import { ChoiceFull } from '../interfaces/choice-full';

describe('reducers/choices', () => {
  it('should return same state when no action matches', () => {
    expect(choices(defaultState, {} as any)).to.equal(defaultState);
  });

  describe('when choices do not exist', () => {
    describe('ADD_CHOICE', () => {
      const choice: ChoiceFull = {
        highlighted: false,
        value: 'test',
        label: 'test',
        id: 1,
        elementId: '1',
        groupId: 1,
        active: false,
        disabled: false,
        placeholder: true,
        selected: false,
        customProperties: {
          test: true,
        },
      };

      describe('passing expected values', () => {
        it('adds choice', () => {
          const expectedResponse = [choice];

          const actualResponse = choices(undefined, {
            type: 'ADD_CHOICE',
            choice: cloneObject(choice),
          });

          expect(actualResponse).to.eql(expectedResponse);
        });
      });

      describe('fallback values', () => {
        describe('passing no placeholder value', () => {
          it('adds choice with placeholder set to false', () => {
            const item = Object.assign(cloneObject(choice), {
              placeholder: false,
            });
            const expectedResponse = [item];

            const actualResponse = choices(undefined, {
              type: 'ADD_CHOICE',
              choice: cloneObject(item),
            });

            expect(actualResponse).to.eql(expectedResponse);
          });
        });
      });
    });
  });

  describe('when choices exist', () => {
    let state: ChoiceFull[];

    beforeEach(() => {
      state = [
        {
          id: 1,
          elementId: 'choices-test-1',
          groupId: -1,
          value: 'Choice 1',
          label: 'Choice 1',
          disabled: false,
          selected: false,
          active: false,
          score: 9999,
          customProperties: null,
          placeholder: false,
          highlighted: false,
        },
        {
          id: 2,
          elementId: 'choices-test-2',
          groupId: -1,
          value: 'Choice 2',
          label: 'Choice 2',
          disabled: false,
          selected: true,
          active: false,
          score: 9999,
          customProperties: null,
          placeholder: false,
          highlighted: false,
        },
      ];
    });

    describe('FILTER_CHOICES', () => {
      it('sets active flag based on whether choice is in passed results', () => {
        const id = 1;
        const score = 10;
        const active = true;

        const expectedResponse = {
          ...state[0],
          active,
          score,
        } as ChoiceFull;

        const actualResponse = choices(state, {
          type: 'FILTER_CHOICES',
          results: [
            {
              item: { id } as ChoiceFull,
              score,
            },
          ],
        }).find((choice) => choice.id === id);

        expect(actualResponse).to.eql(expectedResponse);
      });
    });

    describe('ACTIVATE_CHOICES', () => {
      it('sets active flag to passed value', () => {
        const clonedState = state.slice(0);

        const expectedResponse = [
          {
            ...state[0],
            active: true,
          },
          {
            ...state[1],
            active: true,
          },
        ] as ChoiceFull[];

        const actualResponse = choices(clonedState, {
          type: 'ACTIVATE_CHOICES',
          active: true,
        });

        expect(actualResponse).to.eql(expectedResponse);
      });
    });

    describe('CLEAR_CHOICES', () => {
      it('restores to defaultState', () => {
        const clonedState = state.slice(0);
        const expectedResponse = defaultState;
        const actualResponse = choices(clonedState, {
          type: 'CLEAR_CHOICES',
        });

        expect(actualResponse).to.eql(expectedResponse);
      });
    });

    describe('ADD_ITEM', () => {
      describe('when action has a choice id', () => {
        it('disables choice corresponding with id', () => {
          const id = 2;
          const clonedState = state.slice(0);
          const expectedResponse = [
            {
              ...state[0],
            },
            {
              ...state[1],
              selected: true,
            },
          ] as ChoiceFull[];

          const actualResponse = choices(clonedState, {
            type: 'ADD_ITEM',
            item: {
              id,
            } as ChoiceFull,
          });

          expect(actualResponse).to.eql(expectedResponse);
        });
      });

      describe('when action has no choice id', () => {
        it('returns state', () => {
          const clonedState = state.slice(0);
          const actualResponse = choices(clonedState, {
            type: 'ADD_ITEM',
            choiceId: undefined,
          });

          expect(actualResponse).to.equal(clonedState);
        });
      });
    });

    describe('REMOVE_ITEM', () => {
      it('selects choice by passed id', () => {
        const clonedState = state.slice(0);
        const expectedResponse = [
          {
            ...state[0],
          },
          {
            ...state[1],
            selected: false,
          },
        ] as ChoiceFull[];

        const actualResponse = choices(clonedState, {
          type: 'REMOVE_ITEM',
          item: cloneObject(state[2]),
        });

        expect(actualResponse).to.eql(expectedResponse);
      });

      describe('passing no id', () => {
        it('returns state', () => {
          const clonedState = state.slice(0);
          const actualResponse = choices(clonedState, {
            type: 'REMOVE_ITEM',
            id: undefined,
          });

          expect(actualResponse).to.equal(clonedState);
        });
      });
    });
  });
});
