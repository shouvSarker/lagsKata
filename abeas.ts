//ABEAS flights problem

import * as fs from 'fs';

function findEntries(passedEntries: string[][], value: string[]): string[][]{
    return passedEntries.slice(passedEntries.indexOf(value)).filter(entry => +entry[1] > (+value[1] + +value[2]));
}

function checkEntries(passedEntries: string[][]): boolean{
    return (typeof passedEntries !== 'undefined' && passedEntries.length > 0) ? true : false;
}

function processEntries(passedEntries: string[][], curName: string): [string[], number, boolean]{
    const childEarnings: [string[], number] = getEarnings(passedEntries);
    return [childEarnings[0].concat(curName), childEarnings[1], true];
}

function curValue(passedValue: string[]): [string[], number, boolean]{
    return [[passedValue[0]], +passedValue[3], false];
}

function findComb(passedSequence: [string[], number, boolean], curEarning: number): [string[], number]{
    return passedSequence[2] ? [passedSequence[0], curEarning + passedSequence[1]] : [passedSequence[0], passedSequence[1]];
}

function getHighest(combs: [string[], number][]): [string[], number]{
    return combs.sort(function(a, b){return b[1]-a[1]})[0];
}

function getEarnings(entries: string[][]): [string[], number]{
    
    const earnings = entries.map(function(value: string[]): [string[], number]{
        const eligibleEntries = findEntries(entries, value);
        
        const sequence: [string[], number, boolean] = checkEntries(eligibleEntries) ? processEntries(eligibleEntries, value[0]) : curValue(value);

        return findComb(sequence, +value[3]);
    });
    console.log(earnings);
    return getHighest(earnings);
}

const entries = fs.readFileSync('testCases.txt','utf8').split("\n").map(function(row){return row.split(" ");});

const a = getEarnings(entries);
console.log(typeof(a));
console.log(a);