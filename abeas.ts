//ABEAS flights problem

import * as fs from 'fs';
/*
function calculateMoney(valueFirst: string[], eligibleEntriesNow: string[][]): number{
    console.log(eligibleEntriesNow)
    const earnings = eligibleEntriesNow.map(function(value: string[]){
        const eligibleEntries = entries.slice(entries.indexOf(value)+1).filter(entry => +entry[1] > (+value[1] + +value[2]));
        const totalMoney = (typeof eligibleEntries !== 'undefined' && eligibleEntries.length > 0) ? calculateMoney(value, eligibleEntries) : 0
        
        //this line is garbage
        const a: number = +valueFirst[3] + +eligibleEntriesNow.sort(function(a: string[],b: string[]) { return +a[3] - +b[3]} )[0][3] + totalMoney
        console.log("line 13 "+a);
        console.log(eligibleEntriesNow.sort(function(a: string[],b: string[]) { return +a[3] - +b[3]} ));
        return totalMoney == 0 ? 0 : a
    });
    console.log("line 17 " + earnings.sort()[0]);
    return 5;//earnings.sort()[0];
}
*/
function getEarnings(entries: string[][]): number{
    
    const earnings = entries.map(function(value: string[]){
        const eligibleEntries = entries.slice(1).filter(entry => +entry[1] > (+value[1] + +value[2]));
        
        const totalMoney = (typeof eligibleEntries !== 'undefined' && eligibleEntries.length > 0) ? getEarnings(eligibleEntries) : +value[3]
        console.log(eligibleEntries);
        console.log(totalMoney);
        return totalMoney == +value[3] ? +value[3] : +value[3] + totalMoney;
    });
    console.log(earnings);
    return earnings.sort(function(a, b){return b-a})[0];
}

const entries = fs.readFileSync('testCases.txt','utf8').split("\n").map(function(row){return row.split(" ");});
/*
const a = entries.map(function(value: string[]){
    return value[1];
});
*/
const a = getEarnings(entries);
console.log(a);
/*
const revenue = entries.map(function(value){
    const eligibleEntries = entries.slice(entries.indexOf(value)+1).filter(entry => +entry[1] > (+value[1] + +value[2]));
    const totalMoney = (typeof eligibleEntries !== 'undefined' && eligibleEntries.length > 0) ? calculateMoney(value, eligibleEntries) : 0
    return totalMoney
});

console.log(revenue)
*/