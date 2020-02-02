/* eslint-disable functional/no-expression-statement */

import * as fc from "fast-check";
import * as abeasFile from "../src/abeas";

// default testSize, the larger it is, the longer it takes as it defines the max size of arrays and tuples 
const testSize: number = 100;

function arbRequest(mustNotEmpty: boolean = false): fc.Arbitrary<[string, number, number, number]> {
  return mustNotEmpty ? fc.nat(testSize).chain(length => fc.tuple(fc.string(1, length + 1), fc.integer(), fc.integer(), fc.integer())) : fc.tuple(fc.string(), fc.integer(), fc.integer(), fc.integer());
}

function arbCombination(mustSingleName: boolean = false): fc.Arbitrary<[string[], number]> {
  return mustSingleName ? fc.tuple(fc.array(fc.string(), 1, 1), fc.integer()) : fc.nat(testSize).chain( length => fc.tuple(fc.array(fc.string(), 2, length + 2), fc.integer()));
}

test("Should return an object with a name, start, duration and earning key equal to the params", () => {
  fc.assert(
    // given a string and three numbers
    fc.property(
      arbRequest(),
      rawRequest => {
        // when I convert them to a request object
        const result: abeasFile.Request = abeasFile.customerRequest(
          rawRequest[0],
          rawRequest[1],
          rawRequest[2],
          rawRequest[3]
        );
        // then I expect all the relevant keys to be equal to params
        expect(result.name).toBe(rawRequest[0]);
        expect(result.start).toBe(rawRequest[1]);
        expect(result.duration).toBe(rawRequest[2]);
        expect(result.earning).toBe(rawRequest[3]);
      }
    )
  );
});

test("Should return an object with names, totalEarning key equal to the params", () => {
  fc.assert(
    // given an array of strings and a number
    fc.property(
      arbCombination(),
      servingCombinations => {
        // when I convert them to a combination object
        const result: abeasFile.Combination = abeasFile.serviceCombination(
          servingCombinations[0],
          servingCombinations[1]
        );
        // then I expect all the relevant keys to be equal to params
        expect(result.names).toStrictEqual(servingCombinations[0]);
        expect(result.totalEarning).toBe(servingCombinations[1]);
      }
    )
  );
});

test("Should return all the requests that can be run after the specified value of a request list", () => {
  fc.assert(
    fc.property(
      fc.array(arbRequest(), testSize, testSize),
      fc.nat(testSize - 1),
      (incomingRequests, valueIndex) => {
        // given an array of requests
        const requestList: readonly abeasFile.Request[] = incomingRequests.map(
          function(request) {
            return abeasFile.customerRequest(
              request[0],
              request[1],
              request[2],
              request[3]
            );
          }
        );
        // and a value from that array
        const value: abeasFile.Request = requestList[valueIndex];
        // when I calculate all entries eligible to be run after value
        const result: readonly abeasFile.Request[] = abeasFile.suitableEntries(
          requestList,
          value
        );
        // then I expect the returned array to be shorter than the remaining portion of the array after value index
        expect(result.length).toBeLessThanOrEqual(
          requestList.length - valueIndex
        );
        // then I expect start time of every member of the array to be greater than given value's start time and duration combined together
        result.map(function(resultValue) {
          expect(resultValue.start).toBeGreaterThan(
            value.start + value.duration
          );
        });
      }
    )
  );
});

test("Should return false as the provided list is not empty", () => {
    fc.assert(
      fc.property(
        fc.array(arbRequest(true), 1, testSize),
        incomingRequests => {
          // given an array of requests that is not empty
          const requestList: readonly abeasFile.Request[] = incomingRequests.map(
            function(request) {
              return abeasFile.customerRequest(
                request[0],
                request[1],
                request[2],
                request[3]
              );
            }
          );
          // when I calculate if the array is empty
          const resultList: boolean = abeasFile.emptyEntries(requestList);
          // then I expect it to be false
          expect(resultList).toBe(false);
        }
      )
    );
});

test("Should return true as the provided list (any) is empty", () => {
  // given an empty array
  const emptyList: ArrayLike<unknown> = [];
  // when I calculate if the array is empty
  const resultEmpty: boolean = abeasFile.emptyEntries(emptyList);
  // then I expect it to be true
  expect(resultEmpty).toBe(true);
});

test("Should return true as the provided list (2D String) is empty", () => {
  // given an empty strings array of arrays
  const emptyString: string[][] = [];
  // when I calculate if it is empty
  const stringEmpty: boolean = abeasFile.emptyEntries(emptyString);
  // then I expect it to be true
  expect(stringEmpty).toBe(true);
});

test("Should return true as the provided list (request) is empty", () => {
  // given an empty requests array
  const emptyRequests: abeasFile.Request[] = [];
  // when I calculate if the array is empty
  const requestEmpty: boolean = abeasFile.emptyEntries(emptyRequests);
  // then I expect it to be true
  expect(requestEmpty).toBe(true);
});

test("Should return a combination (current value) from a request", () => {
  fc.assert(
    fc.property(
      arbRequest(),
      incomingRequest => {
        // given a customer request
        const passedRequest: abeasFile.Request = abeasFile.customerRequest(
          incomingRequest[0],
          incomingRequest[1],
          incomingRequest[2],
          incomingRequest[3]
        );
        // when I get the cur value
        const curCombination: abeasFile.Combination = abeasFile.curValue(
          passedRequest
        );
        // then I expect the name to be same as customerName
        expect(curCombination.names).toStrictEqual([incomingRequest[0]]);
        // and then I expect the value to be same as the last member of numbers array
        expect(curCombination.totalEarning).toBe(incomingRequest[3]);
      }
    )
  );
});

test("Should return a combination unchanged if there is only one name, added with earning if it has multiple names in its array", () => {
  fc.assert(
    fc.property(
      arbCombination(),
      arbCombination(true),
      fc.integer(),
      (anyNameCombination, singleNameCombination, currentEarning) => {
        // given a combination of names  and total earning
        const passedCombination: abeasFile.Combination = abeasFile.serviceCombination(
          anyNameCombination[0],
          anyNameCombination[1]
        );
        // when I get the current combination
        const curCombination: abeasFile.Combination = abeasFile.probableCombinations(
          passedCombination,
          currentEarning
        );
        // then I expect the names to be same as passed
        expect(curCombination.names).toStrictEqual(passedCombination.names);
        // and then I expect the earning to be added with passed earning
        expect(curCombination.totalEarning).toBe(anyNameCombination[1] + currentEarning);
        // given a combination of one single name and total earning
        const singleCombination: abeasFile.Combination = abeasFile.serviceCombination(
          singleNameCombination[0],
          singleNameCombination[1]
        );
        // when I get the current combination
        const curSingleCombination: abeasFile.Combination = abeasFile.probableCombinations(
          singleCombination,
          currentEarning
        );
        // then I expect the name to be same as passed
        expect(curSingleCombination.names).toStrictEqual(singleNameCombination[0]);
        // then I expect the earning to remain the same
        expect(curSingleCombination.totalEarning).toBe(singleNameCombination[1]);
      }
    )
  );
});

test("Should return the top combination whose earning should be greater than or equal to any other earning on the list", () => {
  // given an array of numbers 1 to 10 to loop through
  const arrayLoops = Array.from(Array(testSize).keys()).slice(1);
  arrayLoops.map(function(arrayLoop) {
    fc.assert(
      fc.property(
        // given an array of arbitary combinations
        fc.array(arbCombination(), arrayLoop, arrayLoop),
        // given a valid index of that combination
        fc.nat(arrayLoop - 1),
        (incomingCombinations, arbIndex) => {
          const passedCombination: readonly abeasFile.Combination[] = incomingCombinations.map(
            function(incomingCombination) {
              return abeasFile.serviceCombination(incomingCombination[0], incomingCombination[1]);
            }
          );
          // when I calculate the top combination
          const topCombination: abeasFile.Combination = abeasFile.highestEarningCombination(
            passedCombination
          );
          // then the total earning should be greater than or equal to any individual earning
          expect(topCombination.totalEarning).toBeGreaterThanOrEqual(
            passedCombination[arbIndex].totalEarning
          );
        }
      )
    );
  });
});

test("Should throw is an error saing it expected four column, but got something else or data is not a number in column 2-4", () => {
  fc.assert(
    fc.property(
      // given an array with less than four columns
      fc.array(fc.array(fc.string(), 1, 3)),
      // given an array with greater than four columns
      fc.array(fc.array(fc.string(), 5, testSize)),
      // given an index of that array
      fc.nat(testSize - 1),
      // given an ideal processable array of four columns
      fc.array(arbRequest()),
      // given an array with four stringed columns
      fc.array(fc.array(fc.string(), 4, 4), 1, testSize),
      (
        lessStrings,
        moreStrings,
        arbIndex,
        fourColumns,
        stringFourColumns
      ) => {
        // when I create a list of valid input in a 2D string array
        const fourStrings: readonly (readonly string[])[] = fourColumns.map(
          function(fourColumn) {
            return [
              fourColumn[0],
              String(fourColumn[1]),
              String(fourColumn[2]),
              String(fourColumn[3])
            ];
          }
        );

        // when data is being cleaned with second third and fourth columns not having numeric strings
        // it should throw an error saying it is not a number
        expect(() => abeasFile.cleanData(stringFourColumns)).toThrowError(
          "is not a number"
        );

        // when data is being cleaned with columns less than three
        // it should throw an error with a error message pointing out that it expected four columns but got n
        expect(() => abeasFile.cleanData(lessStrings)).toThrowError(
          "Expected four columns, got"
        );

        // when data is being cleaned with one column less than four in an arbitary position
        const randomThree = [
          ...fourStrings.slice(0, arbIndex),
          ["injection1", "injection2", "injection3"],
          ...fourStrings.slice(arbIndex)
        ];
        // it should throw an error with a error message pointing out it expected four columns but got n
        expect(() => abeasFile.cleanData(randomThree)).toThrowError(
          "Expected four columns"
        );

        // when data is being cleaned with columns more than four
        // it should throw an error with a error message pointing out that it expected four columns but got n
        expect(() => abeasFile.cleanData(moreStrings)).toThrowError(
          "Expected four columns, got"
        );
      }
    )
  );
});

test("Should return the expected (highest earning serving sequence) set of combinations as the final product provided a list of requests as input", () => {
  // given a requests array
  const suppliedRequests: abeasFile.Request[] = [abeasFile.customerRequest('AF514', 0, 5, 10), abeasFile.customerRequest('CO5', 7, 7, 13), abeasFile.customerRequest('BA01', 6, 9, 14)];
  // when I calculate the list of highest earning combinations
  const highestEarning: abeasFile.Combination = abeasFile.mostProfitable(suppliedRequests);
  // then I expect the value to be equal to the expected combination
  const expected: abeasFile.Combination = {
    names: ['BA01', 'AF514'],
    totalEarning: 24
  };
  expect(highestEarning.names).toStrictEqual(expected.names);
  expect(highestEarning.totalEarning).toBe(expected.totalEarning);
})

test("Should return a list of probable most profitable child entries with current name added to the list of strings", () => {
    // given a requests array
    const suppliedRequests: abeasFile.Request[] = [abeasFile.customerRequest('AF514', 0, 5, 10), abeasFile.customerRequest('CO5', 7, 7, 13), abeasFile.customerRequest('BA01', 6, 9, 14)];
    // and a current name
    const name: string = "newName"
    // when I calculate the list of probable child entries
    const probableChildEntries: abeasFile.Combination = abeasFile.probableChildEntries(suppliedRequests, name);
    // then I expect the value to be equal to the expected combination
    const expected: abeasFile.Combination = {
      names: ['BA01', 'AF514', name],
      totalEarning: 24
    };
    expect(probableChildEntries.names).toStrictEqual(expected.names);
    expect(probableChildEntries.totalEarning).toBe(expected.totalEarning);
})

test("Should return the expected (highest earning serving sequence) set of combinations as the final product provided an array of array of strings as input", () => {
  // given an array of arrays of strings
  const entries: string[][] = [['AF514', '0', '5', '10'], ['CO5', '7', '7', '13'], ['AF515', '5', '9', '7'], ['BA01', '6', '9', '14'], ['CApp', '18', '2', '16']]
  // when I calculate the list of accepted request
  const result = abeasFile.acceptedRequests(entries);
  // then it should be equal to the expected combination
  const expected: abeasFile.Combination = {
    names: ["AF514", "BA01", "CApp"],
    totalEarning: 40
  };
  expect(result.names).toStrictEqual(expected.names);
  expect(result.totalEarning).toBe(expected.totalEarning);
});