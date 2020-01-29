import * as fs from 'fs';
import * as fc from 'fast-check';
import * as abeasFile from '../src/abeas';

test('Should return an object with a name, start, duration and earning key equal to the params', () => {
  fc.assert(
    // given a string and three numbers
    fc.property(fc.string(), fc.integer(), fc.integer(), fc.integer(), (customerName, start, duration, earning) => {
      // when I convert them to a request object
      const result: abeasFile.requests = abeasFile.customerRequests(customerName, start, duration, earning);
      // then I expect all the relevant keys to be equal to params
      expect(result.name).toBe(customerName);
      expect(result.start).toBe(start);
      expect(result.duration).toBe(duration);
      expect(result.earning).toBe(earning);
    }
    )
  );
});

test('Should return an object with names, totalEarning key equal to the params', () => {
  fc.assert(
    // given an array of strings and a number
    fc.property(fc.array(fc.string()), fc.integer(), (customerNames, customerEarning) => {
      // when I convert them to a combination object
      const result: abeasFile.combinations = abeasFile.serviceCombinations(customerNames, customerEarning);
      // then I expect all the relevant keys to be equal to params
      expect(result.names).toStrictEqual(customerNames);
      expect(result.totalEarning).toBe(customerEarning);
    }
    )
  );
});

test('Should return all the requests that can be run after the specified value of a request list', () => {
  const testSize = 100;
  fc.assert(
    fc.property(fc.array(fc.string(), testSize, testSize), fc.array(fc.nat(), testSize*3, testSize*3), fc.nat(testSize - 1), (customerNames, numberDetails, valueIndex) => {
      // given an array of requests
      const requestList: abeasFile.requests[] = customerNames.map(function(name){
        const index = customerNames.indexOf(name);
        return abeasFile.customerRequests(name, numberDetails[3*index], numberDetails[3*index+1], numberDetails[3*index+2]);
      })
      // and a value from that array
      const value: abeasFile.requests = requestList[valueIndex];
      console.log(value);
      // when I calculate all entries eligible to be run after value
      const result: readonly abeasFile.requests[] = abeasFile.suitableEntries(requestList, value);
      // then I expect the returned array to be shorter than the remaining portion of the array after value index
      expect(result.length).toBeLessThan(requestList.length - valueIndex);
      // then I expect start time of every member of the array to be greater than given value's start time and duration combined
      result.map(function(resultValue){
        expect(resultValue.start).toBeGreaterThan(value.start + value.duration);
      });
    }
    )
  );
});

//TODO

test('Should return all the requests that can be run after head of a request list', () => {
  const value: abeasFile.requests = abeasFile.customerRequests('AF514', 4, 5, 10);
  const entryList: readonly abeasFile.requests[] = [abeasFile.customerRequests('AF514', 0, 5, 10), abeasFile.customerRequests('AB514', 4, 5, 10), abeasFile.customerRequests('AC514', 10, 5, 10)];
  const expected: readonly abeasFile.requests[] = [abeasFile.customerRequests('AC514', 10, 5, 10)];
  const result: readonly abeasFile.requests[] = abeasFile.suitableEntries(entryList, value);
  
  expect(result).toStrictEqual(expected);
});

test('Should return if the provided requests list is empty', () => {
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

test('MainFunction', () => {
  const entries = fs.readFileSync('./tests/testCases/testCase1.txt','utf8').split("\n").map(function(row){return row.split(" ");});
  const result = abeasFile.acceptedRequests(entries);
  const answers: abeasFile.combinations = { names: [ 'AF514', 'BA01', 'CApp' ], totalEarning: 40 }
  expect(result.names).toStrictEqual(answers.names);
  expect(result.totalEarning).toBe(answers.totalEarning);
});