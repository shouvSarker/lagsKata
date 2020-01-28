import { expect } from 'chai';
import * as fs from 'fs';
import * as abeasFile from '../src/abeas';

const entries = fs.readFileSync('./tests/testCases/testCase1.txt','utf8').split("\n").map(function(row){return row.split(" ");});

describe('abeas', function() {

  it('CustomerRequests', function() {
    const result: abeasFile.requests = abeasFile.customerRequests('AF514', 0, 5, 10);
    const request: abeasFile.requests = 
    {
      name: 'AF514',
      start: 0,
      duration: 5,
      earning: 10
    };
    
    expect(result).to.eql(request);
  });

  it('ServiceCombinations', function() {
    const result: abeasFile.combinations = abeasFile.serviceCombinations(['AF514', 'BF524'], 10);
    const combination: abeasFile.combinations = 
    {
      names: ['AF514', 'BF524'],
      totalEarning: 10
    };
    
    expect(result).to.eql(combination);
  });

  it('SuitableEntries', function() {
    const value: abeasFile.requests = abeasFile.customerRequests('AF514', 4, 5, 10);
    const entryList: readonly abeasFile.requests[] = [abeasFile.customerRequests('AF514', 0, 5, 10), abeasFile.customerRequests('AB514', 4, 5, 10), abeasFile.customerRequests('AC514', 10, 5, 10)];
    const expected: readonly abeasFile.requests[] = [abeasFile.customerRequests('AC514', 10, 5, 10)];
    const result: readonly abeasFile.requests[] = abeasFile.suitableEntries(entryList, value);
    
    expect(result).to.eql(expected);
  });

  it('EmptyEntries', function() {
    const emptyList: readonly abeasFile.requests[] = [];
    const entryList: readonly abeasFile.requests[] = [abeasFile.customerRequests('AF514', 0, 5, 10), abeasFile.customerRequests('AB514', 4, 5, 10), abeasFile.customerRequests('AC514', 10, 5, 10)];
    const resultEmpty: boolean = abeasFile.emptyEntries(emptyList);
    const resultList: boolean = abeasFile.emptyEntries(entryList);
    
    expect(resultEmpty).equal(true);
    expect(resultList).equal(false);
  });

  it('DataCleaning', function() {
    const result = abeasFile.cleanData([['AF514', '0', '5', '10'], ['Ak514', '4','3', '4']]);
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
    expect(result).to.eql(cleaned);
  });

  it('mainFunction', function() {
    const result = abeasFile.acceptedRequests(entries);
    const answers: abeasFile.combinations = { names: [ 'AF514', 'BA01', 'CApp' ], totalEarning: 40 }
    console.log(result);
    expect(result.names).to.eql(answers.names);
    expect(result.totalEarning).equal(answers.totalEarning);
  });

});