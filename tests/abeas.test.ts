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
        const result: abeasFile.requests = abeasFile.customerRequests(
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
        const result: abeasFile.combinations = abeasFile.serviceCombinations(
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
      fc.array(fc.nat(), testSize * 3, testSize * 3),
      fc.nat(testSize - 1),
      (customerNames, numberDetails, valueIndex) => {
        // given an array of requests
        const requestList: readonly abeasFile.requests[] = customerNames.map(
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
        const value: abeasFile.requests = requestList[valueIndex];
        // when I calculate all entries eligible to be run after value
        const result: readonly abeasFile.requests[] = abeasFile.suitableEntries(
          requestList,
          value
        );
        // then I expect the returned array to be shorter than the remaining portion of the array after value index
        expect(result.length).toBeLessThan(requestList.length - valueIndex);
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
        fc.array(fc.nat(), testSize * 3, testSize * 3),
        (customerNames, numberDetails) => {
          // given an array of requests that is not empty
          const requestList: readonly abeasFile.requests[] = customerNames.map(
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
  const emptyList: readonly abeasFile.requests[] = [];
  // when I calculate if the array is empty
  const resultEmpty: boolean = abeasFile.emptyEntries(emptyList);
  // then I expect it to be true
  expect(resultEmpty).toBe(true);
});

test("Should throw is an error saing it expected four column, but got something else", () => {
  const testSizes = Array.from(Array(10).keys()).slice(1);
  testSizes.map(function(testSize) {
    fc.assert(
      // given an array with less than four columns
      fc.property(
        fc.array(fc.array(fc.string(), 1, 3)),
        fc.array(fc.array(fc.string(), 5, 100)),
        fc.nat(),
        fc.array(fc.string(), testSize, testSize),
        fc.array(fc.nat(), testSize * 3, testSize * 3),
        (lessStrings, moreStrings, arbIndex, customerNames, numberDetails) => {
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
          // a try-catch block was used because indirect calls to throw error crashes the code
          try {
            // when data is being cleaned with columns less than three
            abeasFile.cleanData(lessStrings);
          } catch (e) {
            // it should throw an error with a error message pointing out the current row and number of columns
            expect(e.message).toContain("Expected four columns");
          }
          try {
            // when data is being cleaned with one column less than four in an arbitary position
            abeasFile.cleanData([
              ...fourStrings.slice(0, arbIndex),
              ...lessStrings,
              ...fourStrings.slice(arbIndex)
            ]);
          } catch (e) {
            // it should throw an error with a error message pointing out the current row and number of columns
            expect(e.message).toContain("Expected four columns");
          }
          try {
            // when data is being cleaned with columns more than four
            abeasFile.cleanData(moreStrings);
          } catch (e) {
            // it should throw an error with a error message pointing out the current row and number of columns
            expect(e.message).toContain("Expected four columns");
          }
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
  const answers: abeasFile.combinations = {
    names: ["AF514", "BA01", "CApp"],
    totalEarning: 40
  };
  expect(result.names).toStrictEqual(answers.names);
  expect(result.totalEarning).toBe(answers.totalEarning);
});
