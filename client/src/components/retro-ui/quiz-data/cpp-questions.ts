import { Question } from './questions-interface';

export const cppQuestions: Question[] = [
  // Output questions
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 5;\n  int y = 3;\n  cout << x + y * 2;\n  return 0;\n}`,
    options: ['8', '11', '16', 'Error'],
    correctAnswer: 1,
    explanation: 'The expression evaluates to 5 + (3 * 2) = 5 + 6 = 11. Multiplication has higher precedence than addition.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nstring greet(string name) {\n  return "Hello, " + name + "!";\n}\n\nint main() {\n  string result = greet("Gizbo");\n  cout << result;\n  return 0;\n}`,
    options: ['Hello, Gizbo!', 'Hello, name!', 'Hello, "Gizbo"!', 'Error'],
    correctAnswer: 1,
    explanation: 'The function returns a string where name is replaced with the argument "Gizbo".'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<int> numbers = {1, 2, 3, 4, 5};\n  vector<int> result;\n  \n  for(int n : numbers) {\n    if(n % 2 == 0) {\n      result.push_back(n * 2);\n    }\n  }\n  \n  cout << "[";\n  for(int i = 0; i < result.size(); i++) {\n    cout << result[i];\n    if(i < result.size() - 1) cout << ", ";\n  }\n  cout << "]";\n  \n  return 0;\n}`,
    options: ['[2, 4, 6, 8, 10]', '[2, 6, 10]', '[4, 8]', '[2, 4, 6, 8]'],
    correctAnswer: 3,
    explanation: 'The loop filters even numbers (2, 4) and then multiplies them by 2, resulting in [4, 8].'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nint recursiveSum(int n) {\n  if(n <= 1) return n;\n  return n + recursiveSum(n-1);\n}\n\nint main() {\n  cout << recursiveSum(5);\n  return 0;\n}`,
    options: ['5', '10', '15', '120'],
    correctAnswer: 3,
    explanation: 'The recursive function calculates 5 + 4 + 3 + 2 + 1 = 15.'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\nint modify(int y) {\n  y = y + 5;\n  return y;\n}\n\nint main() {\n  int x = 10;\n  int y;\n  \n  if(x > 5) {\n    y = x + 2;\n  } else if(x < 5) {\n    y = x - 2;\n  } else {\n    y = x * 2;\n  }\n  \n  int z = modify(y);\n  cout << y;\n  return 0;\n}`,
    options: ['10', '12', '17', 'Error'],
    correctAnswer: 2,
    explanation: 'x is 10, so y becomes 12. The function modify creates a new local variable y, which doesn\'t affect the outer y. So cout << y shows 12.'
  },

  // Error questions
  {
    id: 6,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\ndouble calculateAverage(vector<int> numbers) {\n  int total = 0;\n  for(int num : numbers) {\n    total += num;\n  }\n  return total / count;\n}\n\nint main() {\n  vector<int> nums = {1, 2, 3, 4, 5};\n  double avg = calculateAverage(nums);\n  cout << avg << endl;\n  return 0;\n}`,
    correctAnswer: 9,
    explanation: 'The variable "count" is used but never defined. It should be numbers.size() instead.'
  },
  {
    id: 7,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<string> fruits = {"apple", "banana", "cherry"};\n  cout << fruits[3] << endl;\n  return 0;\n}`,
    correctAnswer: 6,
    explanation: 'Vector indices start at 0, so a vector with 3 elements has indices 0, 1, and 2. Trying to access index 3 results in an out-of-range error.'
  },
  {
    id: 8,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> processItems(vector<string> items) {\n  vector<int> result;\n  for(int i = 0; i < items.size(); i++) {\n    if(items[i] > 10) {\n      result.push_back(stoi(items[i]));\n    }\n  }\n  return result;\n}\n\nint main() {\n  vector<string> numbers = {"5", "15", "20", "25"};\n  vector<int> filtered = processItems(numbers);\n  return 0;\n}`,
    correctAnswer: 9,
    explanation: 'The function tries to compare a string with the integer 10, which causes an error because these types can\'t be compared with >.'
  },
  {
    id: 9,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Pet {\nprivate:\n  string name;\n  string species;\n  \npublic:\n  Pet(string n, string s) : name(n), species(s) {}\n  \n  string speak() {\n    if(species == "dog") {\n      return "Woof!";\n    } else if(species == "cat") {\n      return "Meow!";\n    }\n    return "...";\n  }\n};\n\nint main() {\n  Pet pet1("Fluffy", "cat");\n  cout << pet1.speak;\n  return 0;\n}`,
    correctAnswer: 26,
    explanation: 'The code doesn\'t call the speak method - it should be pet1.speak() with parentheses. Without the parentheses, it tries to access a member variable that doesn\'t exist.'
  },
  {
    id: 10,
    type: 'error',
    difficulty: 'Hard',
    code: `#include <iostream>\n#include <functional>\nusing namespace std;\n\nfunction<int()> outerFunction() {\n  int counter = 0;\n  \n  auto innerFunction = [=]() mutable {\n    counter += 1;\n    return counter;\n  };\n  \n  return innerFunction;\n}\n\nint main() {\n  auto counterFunc = outerFunction();\n  cout << counterFunc() << endl;\n  return 0;\n}`,
    correctAnswer: 8,
    explanation: 'The lambda captures counter by value ([=]), which means it gets a copy. To modify the original, it should capture by reference ([&]).'
  },

  // Fix questions
  {
    id: 11,
    type: 'fix',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint multiply(int a, int b) {\n  return a * B;\n}\n\nint main() {\n  int result = multiply(3, 4);\n  cout << result;\n  return 0;\n}`,
    lineToFix: 5,
    correctAnswer: 'return a * b;',
    explanation: 'In C++, variable names are case-sensitive. The parameter is named "b" but the code tries to use "B", which doesn\'t exist.'
  },
  {
    id: 12,
    type: 'fix',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nbool isEven(int number) {\n  if(number % 2 = 0) {\n    return true;\n  } else {\n    return false;\n  }\n}\n\nint main() {\n  cout << isEven(4);\n  return 0;\n}`,
    lineToFix: 5,
    correctAnswer: 'if(number % 2 == 0) {',
    explanation: 'The equality check should use == (comparison operator), not = (assignment operator).'
  },
  {
    id: 13,
    type: 'fix',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint findMax(vector<int> numbers) {\n  int maxValue = numbers[0];\n  for(int number : numbers) {\n    if(number > maxValue)\n      maxValue = number;\n  }\n  return maxValue\n}\n\nint main() {\n  vector<int> nums = {5, 9, 2, 7, 1};\n  cout << findMax(nums);\n  return 0;\n}`,
    lineToFix: 11,
    correctAnswer: 'return maxValue;',
    explanation: 'The return statement is missing a semicolon at the end.'
  },
  {
    id: 14,
    type: 'fix',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint countVowels(string text) {\n  int count = 0;\n  string vowels = "aeiouAEIOU";\n  \n  for(char c : text) {\n    if(vowels.find(c) != string::npos) {\n      count++;\n    }\n  }\n  \n  return count;\n}\n\nint main(\n  string text = "Hello World";\n  cout << countVowels(text);\n  return 0;\n}`,
    lineToFix: 17,
    correctAnswer: 'int main() {',
    explanation: 'The main function declaration is missing a closing parenthesis and opening brace.'
  },
  {
    id: 15,
    type: 'fix',
    difficulty: 'Hard',
    code: `#include <iostream>\n#include <cmath>\nusing namespace std;\n\nclass Circle {\nprivate:\n  double radius;\n  \npublic:\n  Circle(double r) : radius(r) {}\n  \n  double area() {\n    return M_PI * radius * radius;\n  }\n  \n  double circumference() const {\n    return 2 * M_PI * r;\n  }\n};\n\nint main() {\n  Circle c(5.0);\n  cout << "Area: " << c.area() << endl;\n  cout << "Circumference: " << c.circumference() << endl;\n  return 0;\n}`,
    lineToFix: 17,
    correctAnswer: 'return 2 * M_PI * radius;',
    explanation: 'The method uses the variable "r" which doesn\'t exist. It should use the class member "radius".'
  }
];
