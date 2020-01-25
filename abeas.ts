//ABEAS flights problem

import * as fs from 'fs';

function getEarnings(entries: string[][]): string[]{
    
    const earnings = entries.map(function(value: string[]){
        const eligibleEntries = entries.slice(1).filter(entry => +entry[1] > (+value[1] + +value[2]));
        
        const totalMoney: any = (typeof eligibleEntries !== 'undefined' && eligibleEntries.length > 0) ? [getEarnings(eligibleEntries)[0], 1, getEarnings(eligibleEntries)[1].concat(value[0])] : [+value[3], 0, [value[0]]]
        //console.log(eligibleEntries);
        //console.log(totalMoney);
        return !totalMoney[1] ? [+value[3], [value[0]]] : [+value[3] + +totalMoney[0], totalMoney[2]];
    });
    console.log(earnings);
    return earnings.sort(function(a, b){return b[0]-a[0]})[0];
}

const entries = fs.readFileSync('testCases.txt','utf8').split("\n").map(function(row){return row.split(" ");});

const a = getEarnings(entries);
console.log(a);