//ABEAS flights problem

import * as fs from 'fs';

/* finds the entries whose start time is greater than head's start time and duration combines (i.e. can be run after head) */
function findEntries(passedEntries: requests[], value: requests): requests[]{
    return passedEntries.slice(passedEntries.indexOf(value)).filter(entry => entry.start > (value.start + +value.duration));
}

/* checks if the passed array is empty */
function checkEntries(passedEntries: requests[]): boolean{
    return (typeof passedEntries !== 'undefined' && passedEntries.length > 0) ? true : false;
}

/* processes the array to find all possible entry combinations and returns them in a list with a flag that its children were processed */
function processEntries(passedEntries: requests[], curName: string): combinations{
    /* calls getEarnings to get the total earning and list of customers for the list */
    const childEarnings: combinations = getEarnings(passedEntries);
    return {names: childEarnings.names.concat(curName), totalEarning: childEarnings.totalEarning};
}

/* picks out the current customer name, earnings and returns them in a list with a flag that its children were not processed */
function curValue(passedValue: requests): combinations{
    return {names: [passedValue.name], totalEarning: passedValue.earning};
}

/* returns combination with earnings updated based on the flag */
function findComb(passedSequence: combinations, curEarning: number): combinations{
    return passedSequence.names.length == 1 ? { names: passedSequence.names, totalEarning: passedSequence.totalEarning} : {names: passedSequence.names, totalEarning: curEarning + passedSequence.totalEarning};
}

/* returns the highest earning combination */
function getHighest(combs: combinations[]): combinations{
    return combs.sort(function(a, b){return b.totalEarning-a.totalEarning})[0];
}

/* calculates all the possible combinations to serve and returns the one with the highest earnings */
function getEarnings(entries: requests[]): combinations{
    /* gets all the possible sequences in which customers can be serverd */
    const earnings = entries.map(function(value: requests): combinations{
        /* finds all the entries eligible to be run after head */
        const eligibleEntries = findEntries(entries, value);
        /* gets the highest earning sequence with head as the first order */
        const sequence: combinations = checkEntries(eligibleEntries) ? processEntries(eligibleEntries, value.name) : curValue(value);
        /* returns the list of customers and combined earning for sequence */
        return findComb(sequence, value.earning);
    });
    console.log(earnings);
    /* returns the highest earning for the current list of combinations */
    return getHighest(earnings);
}

interface requests {
    name: string
    start: number
    duration: number
    earning: number
}

interface combinations {
    names: string[]
    totalEarning: number
}

function cleanData(entries: string[][]): requests[]{
    return entries.map(function(value: string[]){
        value.length == 4 ? console.log("There are four columns") : throwError("Expected four columns, got "+value.length+ " at row "+entries.indexOf(value));
        const cleanedValue = value.slice(1).map(function(member: string){
            const dirtyData = isNaN(+member) ? true : false;
            console.log(dirtyData);
            dirtyData ? throwError(member+" is not a number at row: "+entries.indexOf(value)+" column: "+value.indexOf(member)) : console.log("safe this time");
            return +member;
        })
        return {name: value[0], start: cleanedValue[0], duration: cleanedValue[1], earning: cleanedValue[2]};
    })
}

function throwError(message: string): void {
    throw new Error(message);
    
}

const entries = fs.readFileSync('testCases.txt','utf8').split("\n").map(function(row){return row.split(" ");});




console.log(cleanData(entries));

const a = getEarnings(cleanData(entries));
console.log(a.names.slice().reverse());
console.log(a);
