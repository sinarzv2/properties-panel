import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  changeInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import NumberField, { isEdited } from 'src/components/entries/NumberField';

import {
  DescriptionContext
} from 'src/context';

insertCoreStyles();

const noop = () => {};


describe('<NumberField>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createNumberField({ container });

    // then
    expect(domQuery('.bio-properties-panel-numberfield', result.container)).to.exist;
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createNumberField({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 20);

    // then
    expect(updateSpy).to.have.been.calledWith(20);
  });


  it('should update (floating point number)', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createNumberField({ container, setValue: updateSpy, step: 'any' });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 20.5);

    // then
    expect(updateSpy).to.have.been.calledWith(20.5);
  });


  it('should update (undefined)', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createNumberField({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, '');

    // then
    expect(updateSpy).to.have.been.calledWith(undefined);
  });


  it('should NOT update on invalid', function() {

    // given
    const updateSpy = sinon.spy();

    const step = '3';

    const result = createNumberField({ container, setValue: updateSpy, step });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 20);

    // then
    expect(updateSpy).to.not.have.been.called;
  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createNumberField({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createNumberField({ container, getValue: () => 20 });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createNumberField({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      changeInput(input, 20);

      // then
      expect(isEdited(input)).to.be.true;
    });

  });


  describe('disabled', function() {

    it('should render enabled per default', function() {

      // given
      const result = createNumberField({ container });

      // then
      const input = domQuery('.bio-properties-panel-input', result.container);
      expect(input.disabled).to.be.false;
    });


    it('should render enabled if set', function() {

      // given
      const result = createNumberField({
        container,
        disabled: false
      });

      // then
      const input = domQuery('.bio-properties-panel-input', result.container);
      expect(input.disabled).to.be.false;
    });


    it('should render disabled if set', function() {

      // given
      const result = createNumberField({
        container,
        disabled: true
      });

      // then
      const input = domQuery('.bio-properties-panel-input', result.container);
      expect(input.disabled).to.be.true;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createNumberField({
        container,
        id: 'noDescriptionNumberField'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionNumberField"] .bio-properties-panel-description',
        result.container);
      expect(description).not.to.exist;
    });


    it('should render with description if set per props', function() {

      // given
      const result = createNumberField({
        container,
        id: 'descriptionNumberField',
        label: 'someLabel',
        description: 'my description'
      });

      // then
      const description = domQuery('[data-entry-id="descriptionNumberField"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('my description');
    });


    it('should render with description if set per context', function() {

      // given
      const descriptionConfig = { descriptionNumberField: (element) => 'myContextDesc' };

      const result = createNumberField({
        container,
        id: 'descriptionNumberField',
        label: 'someLabel',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionNumberField"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myContextDesc');
    });


    it('should render description set per props over context', function() {

      // given
      const descriptionConfig = { descriptionNumberField: (element) => 'myContextDesc' };

      const result = createNumberField({
        container,
        id: 'descriptionNumberField',
        label: 'someLabel',
        description: 'myExplicitDescription',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionNumberField"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myExplicitDescription');
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createNumberField({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createNumberField(options = {}) {
  const {
    element,
    debounce = fn => fn,
    description,
    disabled,
    getValue = noop,
    id,
    label,
    max,
    min,
    setValue = noop,
    step,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container
  } = options;

  const context = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return render(
    <DescriptionContext.Provider value={ context }>
      <NumberField
        element={ element }
        debounce={ debounce }
        description={ description }
        disabled={ disabled }
        getValue={ getValue }
        id={ id }
        label={ label }
        max={ max }
        min={ min }
        setValue={ setValue }
        step={ step } />
    </DescriptionContext.Provider>,
    {
      container
    }
  );
}
