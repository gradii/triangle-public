import { QueryList } from '@angular/core';
import { OptionComponent, OptionGroupComponent } from '../src/select';
import {
  defaultFilterOption,
  FilterGroupOptionPipe,
  FilterOptionPipe
} from '../src/select/option.pipe';

// tslint:disable-next-line:no-any
function generateOption(value: any, label: string): OptionComponent {
  const option = new OptionComponent();
  option.value = value;
  option.label = label;
  return option;
}

function generateGroupOption(label: string, value: OptionComponent[]): OptionGroupComponent {
  const optionGroup = new OptionGroupComponent();
  const queryList = new QueryList<OptionComponent>();
  queryList.reset(value);
  optionGroup.listOfOptionComponent = queryList;
  optionGroup.label = label;
  return optionGroup;
}

describe('tri-option pipe', () => {
  describe('FilterOptionPipe', () => {
    let pipe: FilterOptionPipe;
    let listOfOption: OptionComponent[];
    beforeEach(() => {
      pipe = new FilterOptionPipe();
      listOfOption = [];
      for (let i = 0; i < 10; i++) {
        listOfOption.push(generateOption(`value${i}`, `label${i}`));
      }
    });
    it('should return correct value with inputValue', () => {
      const result = pipe.transform(listOfOption, '9', defaultFilterOption, false);
      expect(result[0].label).toBe('label9');
      expect(result.length).toBe(1);
    });
    it('should return correct value with null option', () => {
      const result = pipe.transform([new OptionComponent()], 'a', defaultFilterOption, false);
      expect(result.length).toBe(0);
    });
    it('should return correct value with filterOption', () => {
      const filterOption = (input: string, option: OptionComponent) => {
        if (option && option.label) {
          return option.label.toLowerCase().indexOf(input.toLowerCase().replace('9', '8')) > -1;
        } else {
          return false;
        }
      };
      const result = pipe.transform(listOfOption, '9', filterOption, false);
      expect(result[0].label).toBe('label8');
      expect(result.length).toBe(1);
    });
    it('should return correct value without inputValue', () => {
      const result = pipe.transform(listOfOption, '', defaultFilterOption, false);
      expect(result.length).toBe(10);
    });
    it('should return correct value with serverSearch', () => {
      const result = pipe.transform(listOfOption, 'absd', defaultFilterOption, true);
      expect(result.length).toBe(10);
    });
  });
  describe('FilterGroupOptionPipe', () => {
    let pipe: FilterGroupOptionPipe;
    let listOfGroupOption: OptionGroupComponent[];
    beforeEach(() => {
      pipe = new FilterGroupOptionPipe();
      listOfGroupOption = [
        generateGroupOption('g1', [generateOption('a', 'a'), generateOption('b', 'b')]),
        generateGroupOption('g2', [generateOption('b', 'b'), generateOption('c', 'c')])
      ];
    });
    it('should return correct value with inputValue', () => {
      const result01 = pipe.transform(listOfGroupOption, 'a', defaultFilterOption, false);
      expect(result01[0].label).toBe('g1');
      expect(result01.length).toBe(1);
      const result02 = pipe.transform(listOfGroupOption, 'b', defaultFilterOption, false);
      expect(result02.length).toBe(2);
    });
    it('should return correct value with filterOption', () => {
      const filterOption = (input: string, option: OptionComponent) => {
        if (option && option.label) {
          return option.label.toLowerCase().indexOf(input.toLowerCase().replace('a', 'c')) > -1;
        } else {
          return false;
        }
      };
      const result = pipe.transform(listOfGroupOption, 'a', filterOption, false);
      expect(result[0].label).toBe('g2');
      expect(result.length).toBe(1);
    });
    it('should return correct value without inputValue', () => {
      const result = pipe.transform(listOfGroupOption, '', defaultFilterOption, false);
      expect(result.length).toBe(2);
    });
    it('should return correct value with serverSearch', () => {
      const result = pipe.transform(listOfGroupOption, 'absd', defaultFilterOption, true);
      expect(result.length).toBe(2);
    });
  });
});
