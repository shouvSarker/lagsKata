import * as fs from "fs";
import * as fc from "fast-check";
import * as abeasFile from "../src/abeas";

test("Should return an object with a name, start, duration and earning key equal to the params", () => {
  fc.assert(
    // given a string and three numbers
    fc.property(
      fc.string(),
      fc.integer(),
      fc.integer(),
      fc.integer(),
      (customerName, start, duration, earning) => {
        // when I convert them to a request object
        const result: abeasFile.Request = abeasFile.customerRequests(
          customerName,
          start,
          duration,
          earning
        );
        // then I expect all the relevant keys to be equal to params
        expect(result.name).toBe(customerName);
        expect(result.start).toBe(start);
        expect(result.duration).toBe(duration);
        expect(result.earning).toBe(earning);
      }
    )
  );
});

test("Should return an object with names, totalEarning key equal to the params", () => {
  fc.assert(
    // given an array of strings and a number
    fc.property(
      fc.array(fc.string()),
      fc.integer(),
      (customerNames, customerEarning) => {
        // when I convert them to a combination object
        const result: abeasFile.Combination = abeasFile.serviceCombinations(
          customerNames,
          customerEarning
        );
        // then I expect all the relevant keys to be equal to params
        expect(result.names).toStrictEqual(customerNames);
        expect(result.totalEarning).toBe(customerEarning);
      }
    )
  );
});

test("Should return all the requests that can be run after the specified value of a request list", () => {
  const testSize = 100;
  fc.assert(
    fc.property(
      fc.array(fc.string(), testSize, testSize),
      fc.array(fc.integer(), testSize * 3, testSize * 3),
      fc.nat(testSize - 1),
      (customerNames, numberDetails, valueIndex) => {
        // given an array of requests
        const requestList: readonly abeasFile.Request[] = customerNames.map(
          function(name) {
            const index = customerNames.indexOf(name);
            return abeasFile.customerRequests(
              name,
              numberDetails[3 * index],
              numberDetails[3 * index + 1],
              numberDetails[3 * index + 2]
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
        // then I expect start time of every member of the array to be greater than given value's start time and duration combined
        result.map(function(resultValue) {
          expect(resultValue.start).toBeGreaterThan(
            value.start + value.duration
          );
        });
      }
    )
  );
});

test("Should return false as the provided requests list is not empty", () => {
  const testSizes = Array.from(Array(10).keys()).slice(1);
  testSizes.map(function(testSize) {
    fc.assert(
      fc.property(
        fc.array(fc.string(), testSize, testSize),
        fc.array(fc.integer(), testSize * 3, testSize * 3),
        (customerNames, numberDetails) => {
          // given an array of requests that is not empty
          const requestList: readonly abeasFile.Request[] = customerNames.map(
            function(name) {
              const index = customerNames.indexOf(name);
              return abeasFile.customerRequests(
                name,
                numberDetails[3 * index],
                numberDetails[3 * index + 1],
                numberDetails[3 * index + 2]
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
});

test("Should return false as the provided requests list is empty", () => {
  // given an empty array
  const emptyList: readonly abeasFile.Request[] = [];
  // when I calculate if the array is empty
  const resultEmpty: boolean = abeasFile.emptyEntries(emptyList);
  // then I expect it to be true
  expect(resultEmpty).toBe(true);
});

test("Should return a combination (current value) from a request", () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.array(fc.integer(), 3, 3),
      (customerName, numberDetails) => {
        // given a customer request
        const passedRequest: abeasFile.Request = abeasFile.customerRequests(
          customerName,
          numberDetails[0],
          numberDetails[1],
          numberDetails[2]
        );
        // when I get the cur value
        const curCombination: abeasFile.Combination = abeasFile.curValue(
          passedRequest
        );
        // then I expect the name to be same as customerName
        expect(curCombination.names).toStrictEqual([customerName]);
        // and then I expect the value to be same as the last member of numbers array
        expect(curCombination.totalEarning).toBe(numberDetails[2]);
      }
    )
  );
});

test("Should return a combination unchanged if there is only one name, added with earning if it has multiple names in its array", () => {
  fc.assert(
    fc.property(
      fc.array(fc.string(), 2, 10),
      fc.string(),
      fc.integer(),
      fc.integer(),
      (names, singleName, earning, currentEarning) => {
        // given a combination of names  and total earning
        const passedCombination: abeasFile.Combination = abeasFile.serviceCombinations(
          names,
          earning
        );
        // when I get the current combination
        const curCombination: abeasFile.Combination = abeasFile.probableCombinations(
          passedCombination,
          currentEarning
        );
        // then I expect the names to be same as passed
        expect(curCombination.names).toStrictEqual(passedCombination.names);
        // and then I expect the earning to be added with passed earning
        expect(curCombination.totalEarning).toBe(earning + currentEarning);
        // given a combination of one single name and total earning
        const singleCombination: abeasFile.Combination = abeasFile.serviceCombinations(
          [singleName],
          earning
        );
        // when I get the current combination
        const curSingleCombination: abeasFile.Combination = abeasFile.probableCombinations(
          singleCombination,
          currentEarning
        );
        // then I expect the name to be same as passed
        expect(curSingleCombination.names).toStrictEqual([singleName]);
        // then I expect the earning to remain the same
        expect(curSingleCombination.totalEarning).toBe(earning);
      }
    )
  );
});

test("Should return the top combination whose earning should be greater than or equal to any other earning on the list", () => {
  const testSizes = Array.from(Array(10).keys()).slice(1);
  testSizes.map(function(testSize) {
    fc.assert(
      fc.property(
        fc.array(fc.array(fc.string()), testSize, testSize),
        fc.array(fc.integer(), testSize, testSize),
        fc.nat(testSize - 1),
        (names, earnings, arbIndex) => {
          const passedCombination: readonly abeasFile.Combination[] = names.map(
            function(nameList) {
              const index = names.indexOf(nameList);
              return abeasFile.serviceCombinations(nameList, earnings[index]);
            }
          );
          const topCombination: abeasFile.Combination = abeasFile.highestEarningCombination(
            passedCombination
          );
          expect(topCombination.totalEarning).toBeGreaterThanOrEqual(
            passedCombination[arbIndex].totalEarning
          );
        }
      )
    );
  });
});

test("Should throw is an error saing it expected four column, but got something else or data is not a number in column 2-4", () => {
  const testSizes = Array.from(Array(10).keys()).slice(1);
  testSizes.map(function(testSize) {
    fc.assert(
      // given an array with less than four columns
      fc.property(
        fc.array(fc.array(fc.string(), 1, 3)),
        fc.array(fc.array(fc.string(), 5, 100)),
        fc.nat(testSize - 1),
        fc.array(fc.string(), testSize, testSize),
        fc.array(fc.integer(), testSize * 3, testSize * 3),
        fc.array(fc.string(), testSize * 3, testSize * 3),
        (lessStrings, moreStrings, arbIndex, customerNames, numberDetails, stringDetails) => {
          // creates a list of valid input in a 2D string array
          const fourStrings: readonly (readonly string[])[] = customerNames.map(
            function(name) {
              const index = customerNames.indexOf(name);
              return [
                name,
                String(numberDetails[3 * index]),
                String(numberDetails[3 * index + 1]),
                String(numberDetails[3 * index + 2])
              ];
            }
          );

          const notNumbers: readonly (readonly string[])[] = customerNames.map(
            function(name) {
              const index = customerNames.indexOf(name);
              return [
                name,
                stringDetails[3 * index + 1],
                stringDetails[3 * index + 2],
                stringDetails[3 * index + 3]
              ];
            }
          );

          // when data is being cleaned with second third and fourth columns not having numeric strings
          // it should throw an error saying it is not a number
          expect(() => abeasFile.cleanData(notNumbers)).toThrowError("is not a number");
 
          // when data is being cleaned with columns less than three
          // it should throw an error with a error message pointing out that it expected four columns but got n
          expect(() => abeasFile.cleanData(lessStrings)).toThrowError("Expected four columns, got");
          
          // when data is being cleaned with one column less than four in an arbitary position
          const randomThree = [
            ...fourStrings.slice(0, arbIndex),
            [customerNames[0], stringDetails[0], customerNames[0]],
            ...fourStrings.slice(arbIndex)
          ];
          // it should throw an error with a error message pointing out it expected four columns but got n
          expect(() => abeasFile.cleanData(randomThree)).toThrowError("Expected four columns");

          // when data is being cleaned with columns more than four
          // it should throw an error with a error message pointing out that it expected four columns but got n
          expect(() => abeasFile.cleanData(moreStrings)).toThrowError("Expected four columns, got");
        }
      )
    );
  });
});

test("MainFunction", () => {
  const entries = fs
    .readFileSync("./tests/testCases/testCase1.txt", "utf8")
    .split("\n")
    .map(function(row) {
      return row.split(" ");
    });
  const result = abeasFile.acceptedRequests(entries);
  const answers: abeasFile.Combination = {
    names: ["AF514", "BA01", "CApp"],
    totalEarning: 40
  };
  expect(result.names).toStrictEqual(answers.names);
  expect(result.totalEarning).toBe(answers.totalEarning);
});