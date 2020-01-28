//import * as fs from 'fs';
import * as abeasFile from '../src/abeas';

//const entries = fs.readFileSync('./tests/testCases/testCase1.txt','utf8').split("\n").map(function(row){return row.split(" ");});

test('CustomerRequests', () => {
  const result: abeasFile.requests = abeasFile.customerRequests('AF514', 0, 5, 10);
  const request: abeasFile.requests = 
  {
    name: 'AF514',
    start: 0,
    duration: 5,
    earning: 10
  };
  
  expect(result).toStrictEqual(request);
});

test('ServiceCombinations', () => {
  const result: abeasFile.combinations = abeasFile.serviceCombinations(['AF514', 'BF524'], 10);
  const combination: abeasFile.combinations = 
  {
    names: ['AF514', 'BF524'],
    totalEarning: 10
  };
  
  expect(result).toStrictEqual(combination);
});

test('SuitableEntries', () => {
  const value: abeasFile.requests = abeasFile.customerRequests('AF514', 4, 5, 10);
  const entryList: readonly abeasFile.requests[] = [abeasFile.customerRequests('AF514', 0, 5, 10), abeasFile.customerRequests('AB514', 4, 5, 10), abeasFile.customerRequests('AC514', 10, 5, 10)];
  const expected: readonly abeasFile.requests[] = [abeasFile.customerRequests('AC514', 10, 5, 10)];
  const result: readonly abeasFile.requests[] = abeasFile.suitableEntries(entryList, value);
  
  expect(result).toStrictEqual(expected);
});

test('EmptyEntries', () => {
  const emptyList: readonly abeasFile.requests[] = [];
  const entryList: readonly abeasFile.requests[] = [abeasFile.customerRequests('AF514', 0, 5, 10), abeasFile.customerRequests('AB514', 4, 5, 10), abeasFile.customerRequests('AC514', 10, 5, 10)];
  const resultEmpty: boolean = abeasFile.emptyEntries(emptyList);
  const resultList: boolean = abeasFile.emptyEntries(entryList);
  
  expect(resultEmpty).toBe(true);
  expect(resultList).toBe(false);
});

test('DataCleaning', () => {
  const result: readonly abeasFile.requests[] = abeasFile.cleanData([['AF514', '0', '5', '10'], ['Ak514', '4','3', '4']]);
  const cleaned: readonly abeasFile.requests[] = [
    {
      name: 'AF514',
      start: 0,
      duration: 5,
      earning: 10
    },
    {
      name: 'Ak514',
      start: 4,
      duration: 3,
      earning: 4
    }
  ];
  expect(result).toStrictEqual(cleaned);
});