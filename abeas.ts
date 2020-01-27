//ABEAS flights problem

import * as fs from 'fs';

/* finds the entries whose start time is greater than head's start time and duration combines (i.e. can be run after head) */
function findEntries(passedEntries: string[][], value: string[]): string[][]{
    return passedEntries.slice(passedEntries.indexOf(value)).filter(entry => +entry[1] > (+value[1] + +value[2]));
}

/* checks if the passed array is empty */
function checkEntries(passedEntries: string[][]): boolean{
    return (typeof passedEntries !== 'undefined' && passedEntries.length > 0) ? true : false;
}

/* processes the array to find all possible entry combinations and returns them in a list with a flag that its children were processed */
function processEntries(passedEntries: string[][], curName: string): [string[], number, boolean]{
    /* calls getEarnings to get the total earning and list of customers for the list */
    const childEarnings: [string[], number] = getEarnings(passedEntries);
    return [childEarnings[0].concat(curName), childEarnings[1], true];
}

/* picks out the current customer name, earnings and returns them in a list with a flag that its children were not processed */
function curValue(passedValue: string[]): [string[], number, boolean]{
    return [[passedValue[0]], +passedValue[3], false];
}

/* returns combination with earnings updated based on the flag */
function findComb(passedSequence: [string[], number, boolean], curEarning: number): [string[], number]{
    return passedSequence[2] ? [passedSequence[0], curEarning + passedSequence[1]] : [passedSequence[0], passedSequence[1]];
}

/* returns the highest earning combination */
function getHighest(combs: [string[], number][]): [string[], number]{
    return combs.sort(function(a, b){return b[1]-a[1]})[0];
}

/* calculates all the possible combinations to serve and returns the one with the highest earnings */
function getEarnings(entries: string[][]): [string[], number]{
    /* gets all the possible sequences in which customers can be serverd */
    const earnings = entries.map(function(value: string[]): [string[], number]{
        /* finds all the entries eligible to be run after head */
        const eligibleEntries = findEntries(entries, value);
        /* gets the highest earning sequence with head as the first order */
        const sequence: [string[], number, boolean] = checkEntries(eligibleEntries) ? processEntries(eligibleEntries, value[0]) : curValue(value);
        /* returns the list of customers and combined earning for sequence */
        return findComb(sequence, +value[3]);
    });
    console.log(earnings);
    /* returns the highest earning for the current list of combinations */
    return getHighest(earnings);
}

function cleanData(entries: string[][]): [string, number, number, number][]{
    return entries.map(function(value: string[]){
        value.length == 4 ? console.log("There are four columns") : throwError("Expected four columns, got "+value.length+ " at row "+entries.indexOf(value));
        const cleanedValue = value.slice(1).map(function(member: string){
            const dirtyData = isNaN(+member) ? true : false;
            console.log(dirtyData);
            dirtyData ? throwError(member+" is not a number at row: "+entries.indexOf(value)+" column: "+value.indexOf(member)) : console.log("safe this time");
            return +member;
        })
        return [value[0], cleanedValue[0], cleanedValue[1], cleanedValue[2]];
    })
}

function throwError(message: string): void {
    throw new Error(message);
    
}

const entries = fs.readFileSync('testCases.txt','utf8').split("\n").map(function(row){return row.split(" ");});




console.log(cleanData(entries));
/*
const a = getEarnings(entries);
console.log(a[0].slice().reverse());
console.log(a);
*/