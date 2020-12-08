/*
Solution file for abeas flights problem
http://codingdojo.org/kata/Lags/
*/

/**
 * This defines a customer request type for a flight
 */
export type Request = {
  /** name of the person/company requesting a flight */
  readonly name: string;
  /** start time for the flight */
  readonly start: number;
  /** total time required for the flight to be completed */
  readonly duration: number;
  /** earnings from that flight */
  readonly earning: number;
};

/**
 * This defines a combination of flights that can be run after one another and total earnings from them
 */
export type Combination = {
  /** names of the persons/companies requesting a flight */
  readonly names: readonly string[];
  /** total money earned from this sequence of trips */
  readonly totalEarning: number;
};

/**
 * This creates a customer request in a structured format
 * @param iniName the name of the entity making the request
 * @param iniStart start time for the flight
 * @param iniDuration total duration of the flight
 * @param iniEarning earning from that flight
 */
export function customerRequest(
  iniName: string,
  iniStart: number,
  iniDuration: number,
  iniEarning: number
): Request {
  return {
    name: iniName,
    start: iniStart,
    duration: iniDuration,
    earning: iniEarning,
  };
}

/**
 * This creates a combination of flights that be run subsequently
 * @param iniNames names of the flights that can be served subsequently
 * @param iniTotal total earnings from those flights
 */
export function serviceCombination(
  iniNames: readonly string[],
  iniTotal: number
): Combination {
  return { names: iniNames, totalEarning: iniTotal };
}

/**
 * Throws an error according to the passed message
 * @param message the error message to be thrown
 */
// eslint-disable-next-line functional/no-return-void
export function throwError(message: string): never {
  throw new Error(message); // eslint-disable-line functional/no-throw-statement
}

/**
 * finds the entries whose start time is greater than the given value's start time and duration combined (i.e. can be run after given value)
 * @param passedEntries the list of entries from which suitable entries will be identified
 * @param value the request from which serving should begin
 */
export function suitableEntries(
  passedEntries: readonly Request[],
  value: Request
): readonly Request[] {
  return passedEntries
    .slice(passedEntries.indexOf(value))
    .filter((entry) => entry.start > value.start + value.duration);
}

/**
 * checks if the passed array is empty
 * @param passedEntries the list of entries whose emptiness will be determined
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emptyEntries(passedEntries: ArrayLike<unknown>): boolean {
  return !(passedEntries !== "undefined" && passedEntries.length > 0)
    ? true
    : false;
}

/**
 * processes the array to find all possible entry combinations that can be served subsequently
 * @param passedEntries the list of entries from which probable entries are going to be identified
 * @param curName the name of the current entry whose subsequent entries are being tested
 */
export function probableChildEntries(
  passedEntries: readonly Request[],
  curName: string
): Combination {
  /**
   *calls getEarnings to get the total earning and list of customers for the list
   */
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const childEarnings: Combination = mostProfitable(passedEntries);
  return serviceCombination(
    childEarnings.names.concat(curName),
    childEarnings.totalEarning
  );
}

/**
 * picks out the current customer name, earnings from a request and returns them in a list
 * @param passedValue the request to be processed
 */
export function curValue(passedValue: Request): Combination {
  return serviceCombination([passedValue.name], passedValue.earning);
}

/**
 * returns combination with earnings updated based on all the earnings of the requests in the combination
 * @param passedSequence the sequence of customers being served
 * @param curEarning earning from the current request
 */
export function probableCombinations(
  passedSequence: Combination,
  curEarning: number
): Combination {
  return passedSequence.names.length === 2
    ? serviceCombination(passedSequence.names, passedSequence.totalEarning)
    : serviceCombination(
        passedSequence.names,
        curEarning + passedSequence.totalEarning
      );
}

/**
 * returns the highest earning combination
 * @param passedCombinations the list of combinations in which customers can be served
 */
export function highestEarningCombination(
  passedCombinations: readonly Combination[]
): Combination {
  return passedCombinations.slice().sort(function(a, b) {
    return b.totalEarning - a.totalEarning;
  })[0];
}

/**
 * calculates all the possible combinations to serve and returns the one with the highest earnings
 * @param entries a list of customer requests
 */
export function mostProfitable(entries: readonly Request[]): Combination {
  /* gets all the possible sequences in which customers can be serverd */
  const earnings = entries.map(function(value: Request): Combination {
    /* finds all the entries eligible to be run after the passed entry */
    const eligibleEntries = suitableEntries(entries, value);
    /* gets the highest earning sequence with passed entry as the first order */
    const sequence: Combination = emptyEntries(eligibleEntries)
      ? curValue(value)
      : probableChildEntries(eligibleEntries, value.name);
    /* returns the list of customers and combined earning for sequence */
    return probableCombinations(sequence, value.earning);
  });
  /* returns the highest earning for the current list of combinations */
  return highestEarningCombination(earnings);
}

/**
 * converts numeric strings into numbers and checks for validity (4 columns with column 2-4 numeric)
 * has side effect if an error is encountered here
 * @param entries a 2D list of strings with raw customer requests
 */
export function cleanData(
  entries: readonly (readonly string[])[]
): readonly Request[] {
  // eslint-disable-next-line functional/no-expression-statement
  emptyEntries(entries) && throwError("Expected four columns, got empty input");
  return entries.map(function(value: readonly string[]) {
    // eslint-disable-next-line functional/no-expression-statement
    emptyEntries(value) && throwError("Expected four columns, got empty input");
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
      member
        ? isNaN(+member) &&
          throwError(
            member +
              " is not a number at row: " +
              entries.indexOf(value) +
              " column: " +
              value.indexOf(member)
          )
        : throwError(
            member +
              " is not a number, actually Empty string at row: " +
              entries.indexOf(value) +
              " column: " +
              value.indexOf(member)
          );
      return +member;
    });
    return customerRequest(
      value[0],
      cleanedValue[0],
      cleanedValue[1],
      cleanedValue[2]
    );
  });
}

/**
 * main function of this file, calculates the most profitable flight plan from raw requests
 * @param givenEntries a list of raw customer requests as unprocessed 2D string array
 */
export function acceptedRequests(
  givenEntries: readonly (readonly string[])[]
): Combination {
  const chosenSequence = mostProfitable(cleanData(givenEntries));
  return serviceCombination(
    chosenSequence.names.slice().reverse(),
    chosenSequence.totalEarning
  );
}
