import { expect } from 'chai';
import * as actions from '../../../src/scripts/actions/choices';
import { cloneObject } from '../../../src/scripts/lib/utils';
import { ChoiceFull } from '../../../src/scripts/interfaces/choice-full';
import { ActionType } from '../../../src';
import { stringToHtmlClass } from '../../../src/scripts/lib/choice-input';

describe('actions/choices', () => {
  describe('addChoice action', () => {
    it('returns ADD_CHOICE action', () => {
      const choice: ChoiceFull = {
        highlighted: false,
        value: 'test',
        label: 'test',
        id: 1,
        groupId: 1,
        score: 0,
        disabled: false,
        elementId: '1',
        labelClass: stringToHtmlClass('test foo--bar'),
        labelDescription: 'test',
        customProperties: {
          test: true,
        },
        placeholder: true,
        active: false,
        selected: false,
      };

      const expectedAction: actions.AddChoiceAction = {
        type: ActionType.ADD_CHOICE,
        choice,
      };

      expect(actions.addChoice(cloneObject(choice))).to.eql(expectedAction);
    });
  });

  describe('filterChoices action', () => {
    it('returns FILTER_CHOICES action', () => {
      const results = Array(10);
      const expectedAction: actions.FilterChoicesAction = {
        type: ActionType.FILTER_CHOICES,
        results,
      };

      expect(actions.filterChoices(results)).to.eql(expectedAction);
    });
  });

  describe('activateChoices action', () => {
    describe('not passing active parameter', () => {
      it('returns ACTIVATE_CHOICES action', () => {
        const expectedAction: actions.ActivateChoicesAction = {
          type: ActionType.ACTIVATE_CHOICES,
          active: true,
        };

        expect(actions.activateChoices()).to.eql(expectedAction);
      });
    });

    describe('passing active parameter', () => {
      it('returns ACTIVATE_CHOICES action', () => {
        const active = true;
        const expectedAction: actions.ActivateChoicesAction = {
          type: ActionType.ACTIVATE_CHOICES,
          active,
        };

        expect(actions.activateChoices(active)).to.eql(expectedAction);
      });
    });
  });

  describe('clearChoices action', () => {
    it('returns CLEAR_CHOICES action', () => {
      const expectedAction: actions.ClearChoicesAction = {
        type: ActionType.CLEAR_CHOICES,
      };

      expect(actions.clearChoices()).to.eql(expectedAction);
    });
  });
});
