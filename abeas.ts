//ABEAS flights problem

import * as fs from 'fs';

/*
function calculateMoney(starting: number, entries: string[][]){
    entries.map(function(entry) {
        return calculateNext(entries.slice(entries.indexOf(entry)+1), entry, starting);
    });
}

function calculateNext(remainingEntries: string[][], entry: string[], starting:number){
    remainingEntries.map(function(remainingEntry){
        let a = (+remainingEntries[1] > (+entry[1] + +entry[2])) && ((+remainingEntries[3] + +entry[3]) > starting) ? +remainingEntries[3] + +entry[3] : 0;
        console.log(a);
    })
}
*/

function calculateMoney(valueFirst: string[], eligibleEntriesNow: string[][]): number[]{
    console.log(eligibleEntriesNow)
    return eligibleEntriesNow.map(function(value: string[]){
        const eligibleEntries = entries.slice(entries.indexOf(value)+1).filter(entry => +entry[1] > (+value[1] + +value[2]));
        const totalMoney = (typeof eligibleEntries !== 'undefined' && eligibleEntries.length > 0) ? calculateMoney(value, eligibleEntries) : 0
        //console.log("first return" + totalMoney);
        
        const a = totalMoney == 0 ? +valueFirst[3] + +eligibleEntriesNow.sort(function(a: string[],b: string[]) { return +a[3] - +b[3]} )[0][3] : 0
        //console.log(a);
        return a
        //console.log(eligibleEntriesNow.sort(function(a: string[],b: string[]) { return +a[3] - +b[3]} )[0][3]);
    });
    //return a;
}

const entries = fs.readFileSync('testCases.txt','utf8').split("\n").map(function(row){return row.split(" ");});

const revenue = entries.map(function(value){
    const eligibleEntries = entries.slice(entries.indexOf(value)+1).filter(entry => +entry[1] > (+value[1] + +value[2]));
    const totalMoney = (typeof eligibleEntries !== 'undefined' && eligibleEntries.length > 0) ? calculateMoney(value, eligibleEntries) : 0
    return totalMoney
});

console.log(revenue)
//console.log(Math.max.apply(null, revenue))
//const a = entries.filter(entry => +entry[1] > 5);
//console.log(eligibleEntries);

//const totalMoney = calculateMoney(0, entries);

//console.log(totalMoney);

//totalMoney == 0 ? console.log(Math.max.apply(null, entries.map(function(value) { return +value[3]; }))): console.log(totalMoney)

