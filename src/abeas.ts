/*
Solution file for abeas flights problem
http://codingdojo.org/kata/Lags/
*/

export type requests = {
  readonly name: string;
  readonly start: number;
  readonly duration: number;
  readonly earning: number;
};

export type combinations = {
  readonly names: readonly string[];
  readonly totalEarning: number;
};

export function customerRequests(
  iniName: string,
  iniStart: number,
  iniDuration: number,
  iniEarning: number
): requests {
  return {
    name: iniName,
    start: iniStart,
    duration: iniDuration,
    earning: iniEarning
  };
}

export function serviceCombinations(
  iniNames: readonly string[],
  iniTotal: number
): combinations {
  return { names: iniNames, totalEarning: iniTotal };
}

// eslint-disable-next-line functional/no-return-void
function throwError(message: string): void {
  throw new Error(message); // eslint-disable-line functional/no-throw-statement
}

/* finds the entries whose start time is greater than the given value's start time and duration combined (i.e. can be run after given value) */
export function suitableEntries(
  passedEntries: readonly requests[],
  value: requests
): readonly requests[] {
  return passedEntries
    .slice(passedEntries.indexOf(value))
    .filter(entry => entry.start > value.start + value.duration);
}

/* checks if the passed array is empty */
export function emptyEntries(passedEntries: readonly requests[]): boolean {
  return passedEntries.length <= 0 ? true : false;
}

/* processes the array to find all possible entry combinations that can be served subsequently */
function probableChildEntries(
  passedEntries: readonly requests[],
  curName: string
): combinations {
  /* calls getEarnings to get the total earning and list of customers for the list */
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const childEarnings: combinations = mostProfitable(passedEntries);
  return serviceCombinations(
    childEarnings.names.concat(curName),
    childEarnings.totalEarning
  );
}

/* picks out the current customer name, earnings and returns them in a list with a flag that its children were not processed */
export function curValue(passedValue: requests): combinations {
  return serviceCombinations([passedValue.name], passedValue.earning);
}

/* returns combination with earnings updated based on all the earnings of the requests in the combination */
export function probableCombinations(
  passedSequence: combinations,
  curEarning: number
): combinations {
  return passedSequence.names.length === 1
    ? serviceCombinations(passedSequence.names, passedSequence.totalEarning)
    : serviceCombinations(
        passedSequence.names,
        curEarning + passedSequence.totalEarning
      );
}

/* returns the highest earning combination */
export function highestEarningCombination(
  passedCombinations: readonly combinations[]
): combinations {
  return passedCombinations.slice().sort(function(a, b) {
    return b.totalEarning - a.totalEarning;
  })[0];
}

/* calculates all the possible combinations to serve and returns the one with the highest earnings */
export function mostProfitable(entries: readonly requests[]): combinations {
  /* gets all the possible sequences in which customers can be serverd */
  const earnings = entries.map(function(value: requests): combinations {
    /* finds all the entries eligible to be run after the passed entry */
    const eligibleEntries = suitableEntries(entries, value);
    /* gets the highest earning sequence with passed entry as the first order */
    const sequence: combinations = emptyEntries(eligibleEntries)
      ? curValue(value)
      : probableChildEntries(eligibleEntries, value.name);
    /* returns the list of customers and combined earning for sequence */
    return probableCombinations(sequence, value.earning);
  });
  /* returns the highest earning for the current list of combinations */
  return highestEarningCombination(earnings);
}

/*
 * converts numeric strings into numbers and checks for validity (4 columns with column 2-4 numeric)
 * has side effect if an error is encountered here
 */
export function cleanData(
  entries: readonly (readonly string[])[]
): readonly requests[] {
  return entries.map(function(value: readonly string[]) {
    // eslint-disable-next-line functional/no-expression-statement
    value.length !== 4 &&
      throwError(
        "Expected four columns, got " +
          value.length +
          " at row " +
          entries.indexOf(value)
      );
    const cleanedValue = value.slice(1).map(function(member: string) {
      // eslint-disable-next-line functional/no-expression-statement
      isNaN(parseInt(member)) &&
        throwError(
          member +
            " is not a number at row: " +
            entries.indexOf(value) +
            " column: " +
            value.indexOf(member)
        );
      return parseInt(member);
    });
    return customerRequests(
      value[0],
      cleanedValue[0],
      cleanedValue[1],
      cleanedValue[2]
    );
  });
}

/* holy grail of this file, calculates the most profitable flight plan from raw requests */
export function acceptedRequests(
  givenEntries: readonly (readonly string[])[]
): combinations {
  const chosenSequence = mostProfitable(cleanData(givenEntries));
  return serviceCombinations(
    chosenSequence.names.slice().reverse(),
    chosenSequence.totalEarning
  );
}
