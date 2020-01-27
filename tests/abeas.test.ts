import { expect } from 'chai';
import * as fs from 'fs';
import * as abeasFile from '../src/abeas';

const entries = fs.readFileSync('./tests/testCases/testCase1.txt','utf8').split("\n").map(function(row){return row.split(" ");});

describe('abeas', function() {

  it('RequestGeneration', function() {
    const result: abeasFile.requests = abeasFile.generateRequests('AF514', 0, 5, 10);
    const request: abeasFile.requests = 
    {
      name: 'AF514',
      start: 0,
      duration: 5,
      earning: 10
    };
    
    expect(result).to.eql(request);
  });

  it('DataCleaning', function() {
    const result = abeasFile.cleanData([['AF514', '0', '5', '10'], ['Ak514', '4','3', '4']]);
    const cleaned: abeasFile.requests[] = [
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