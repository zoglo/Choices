import { expect } from 'chai';
import * as actions from './choices';
import { cloneObject } from '../lib/utils';
import { ChoiceFull } from '../interfaces/choice-full';

describe('actions/choices', () => {
  describe('addChoice action', () => {
    it('returns ADD_CHOICE action', () => {
      const choice: ChoiceFull = {
        highlighted: false,
        value: 'test',
        label: 'test',
        id: 1,
        groupId: 1,
        disabled: false,
        elementId: '1',
        labelClass: 'test',
        labelDescription: 'test',
        customProperties: {
          test: true,
        },
        placeholder: true,
        keyCode: 10,
        active: false,
        selected: false,
      };

      const expectedAction: actions.AddChoiceAction = {
        type: 'ADD_CHOICE',
        choice,
      };

      expect(actions.addChoice(cloneObject(choice))).to.eql(expectedAction);
    });
  });

  describe('filterChoices action', () => {
    it('returns FILTER_CHOICES action', () => {
      const results = Array(10);
      const expectedAction: actions.FilterChoicesAction = {
        type: 'FILTER_CHOICES',
        results,
      };

      expect(actions.filterChoices(results)).to.eql(expectedAction);
    });
  });

  describe('activateChoices action', () => {
    describe('not passing active parameter', () => {
      it('returns ACTIVATE_CHOICES action', () => {
        const expectedAction: actions.ActivateChoicesAction = {
          type: 'ACTIVATE_CHOICES',
          active: true,
        };

        expect(actions.activateChoices()).to.eql(expectedAction);
      });
    });

    describe('passing active parameter', () => {
      it('returns ACTIVATE_CHOICES action', () => {
        const active = true;
        const expectedAction: actions.ActivateChoicesAction = {
          type: 'ACTIVATE_CHOICES',
          active,
        };

        expect(actions.activateChoices(active)).to.eql(expectedAction);
      });
    });
  });

  describe('clearChoices action', () => {
    it('returns CLEAR_CHOICES action', () => {
      const expectedAction: actions.ClearChoicesAction = {
        type: 'CLEAR_CHOICES',
      };

      expect(actions.clearChoices()).to.eql(expectedAction);
    });
  });
});
