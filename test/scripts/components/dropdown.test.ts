import { expect } from 'chai';
import sinon from 'sinon';
import { DEFAULT_CLASSNAMES } from '../../../src';
import Dropdown from '../../../src/scripts/components/dropdown';

describe('components/dropdown', () => {
  let instance;
  let choicesElement;

  beforeEach(() => {
    choicesElement = document.createElement('div');
    document.body.appendChild(choicesElement);
    instance = new Dropdown({
      element: choicesElement,
      type: 'text',
      classNames: DEFAULT_CLASSNAMES,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    instance = null;
  });

  describe('constructor', () => {
    it('assigns choices element to instance', () => {
      expect(instance.element).to.deep.equal(choicesElement);
    });

    it('assigns classnames to instance', () => {
      expect(instance.classNames).to.deep.equal(DEFAULT_CLASSNAMES);
    });
  });

  describe('distanceFromTopWindow', () => {
    let top;
    let dimensions;
    let getBoundingClientRectStub;

    beforeEach(() => {
      top = 100;
      dimensions = {
        bottom: 121,
        height: 0,
        left: 0,
        right: 0,
        top,
        width: 0,
      };

      getBoundingClientRectStub = sinon
        .stub(instance.element, 'getBoundingClientRect')
        .returns(dimensions);
    });

    afterEach(() => {
      getBoundingClientRectStub.restore();
    });

    it('determines how far the top of our element is from the top of the viewport', () => {
      const expectedResponse = dimensions.bottom;
      const actualResponse = instance.distanceFromTopWindow;
      expect(actualResponse).to.equal(expectedResponse);
    });
  });

  describe('show', () => {
    let actualResponse;

    beforeEach(() => {
      actualResponse = instance.show();
    });

    afterEach(() => {
      instance.hide();
    });

    it('adds active class', () => {
      expect(
        instance.element.classList.contains(DEFAULT_CLASSNAMES.activeState),
      ).to.equal(true);
    });

    it('sets expanded attribute', () => {
      expect(instance.element.getAttribute('aria-expanded')).to.equal('true');
    });

    it('sets isActive instance flag', () => {
      expect(instance.isActive).to.equal(true);
    });

    it('returns instance', () => {
      expect(actualResponse).to.deep.equal(instance);
    });
  });

  describe('hide', () => {
    let actualResponse;

    beforeEach(() => {
      actualResponse = instance.hide();
    });

    afterEach(() => {
      instance.show();
    });

    it('adds active class', () => {
      expect(
        instance.element.classList.contains(DEFAULT_CLASSNAMES.activeState),
      ).to.equal(false);
    });

    it('sets expanded attribute', () => {
      expect(instance.element.getAttribute('aria-expanded')).to.equal('false');
    });

    it('sets isActive instance flag', () => {
      expect(instance.isActive).to.equal(false);
    });

    it('returns instance', () => {
      expect(actualResponse).to.deep.equal(instance);
    });
  });
});
