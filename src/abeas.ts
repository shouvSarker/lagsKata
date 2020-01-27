/*
Solution file for abeas flights problem
http://codingdojo.org/kata/Lags/
*/

export type requests = {
    name: string
    start: number
    duration: number
    earning: number
}

export type combinations = {
    names: string[]
    totalEarning: number
}

export function customerRequests(iniName: string, iniStart: number, iniDuration: number, iniEarning: number){
    return {name: iniName, start: iniStart, duration: iniDuration, earning: iniEarning};
}

export function serviceCombinations(iniNames: string[], iniTotal: number){
    return {names: iniNames, totalEarning: iniTotal};
}

function throwError(message: string): void {
    throw new Error(message); 
}

/* finds the entries whose start time is greater than head's start time and duration combined (i.e. can be run after head) */
export function suitableEntries(passedEntries: requests[], value: requests): requests[]{
    return passedEntries.slice(passedEntries.indexOf(value)).filter(entry => entry.start > (value.start + +value.duration));
}

/* checks if the passed array is empty */
export function emptyEntries(passedEntries: requests[]): boolean{
    return !(typeof passedEntries !== 'undefined' && passedEntries.length > 0) ? true : false;
}

/* processes the array to find all possible entry combinations that can be served subsequently */
function probableChildEntries(passedEntries: requests[], curName: string): combinations{
    /* calls getEarnings to get the total earning and list of customers for the list */
    const childEarnings: combinations = mostProfitable(passedEntries);
    return serviceCombinations(childEarnings.names.concat(curName), childEarnings.totalEarning);
}

/* picks out the current customer name, earnings and returns them in a list with a flag that its children were not processed */
function curValue(passedValue: requests): combinations{
    return serviceCombinations([passedValue.name], passedValue.earning);
}

/* returns combination with earnings updated based on all the earnings of the requests in the combination */
function probableCombinations(passedSequence: combinations, curEarning: number): combinations{
    return passedSequence.names.length == 1 ? serviceCombinations(passedSequence.names, passedSequence.totalEarning) : serviceCombinations(passedSequence.names, curEarning + passedSequence.totalEarning);
}

/* returns the highest earning combination */
function highestEarningCombination(combs: combinations[]): combinations{
    return combs.sort(function(a, b){return b.totalEarning-a.totalEarning})[0];
}

/* calculates all the possible combinations to serve and returns the one with the highest earnings */
function mostProfitable(entries: requests[]): combinations{
    /* gets all the possible sequences in which customers can be serverd */
    const earnings = entries.map(function(value: requests): combinations{
        /* finds all the entries eligible to be run after head */
        const eligibleEntries = suitableEntries(entries, value);
        /* gets the highest earning sequence with head as the first order */
        const sequence: combinations = emptyEntries(eligibleEntries) ? curValue(value) : probableChildEntries(eligibleEntries, value.name);
        /* returns the list of customers and combined earning for sequence */
        return probableCombinations(sequence, value.earning);
    });
    /* returns the highest earning for the current list of combinations */
    return highestEarningCombination(earnings);
}

/* converts numeric strings into numbers and checks for validity (4 columns with column 2-4 numeric) */
export function cleanData(entries: string[][]): requests[]{
    return entries.map(function(value: string[]){
        value.length !== 4 && throwError("Expected four columns, got "+value.length+ " at row "+entries.indexOf(value));
        const cleanedValue = value.slice(1).map(function(member: string){
            const dirtyData = isNaN(+member) ? true : false;
            dirtyData && throwError(member+" is not a number at row: "+entries.indexOf(value)+" column: "+value.indexOf(member));
            return +member;
        })
        return customerRequests(value[0], cleanedValue[0], cleanedValue[1], cleanedValue[2]);
    })
}

/* holy grail of this file, calculates the most profitable flight plan from raw requests */
export function acceptedRequests(givenEntries: string[][]): combinations{
    const chosenSequence = mostProfitable(cleanData(givenEntries));
    return serviceCombinations(chosenSequence.names.slice().reverse(), chosenSequence.totalEarning);
}