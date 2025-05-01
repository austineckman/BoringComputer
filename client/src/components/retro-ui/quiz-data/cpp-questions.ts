interface Question {
  id: number;
  type: 'output' | 'error' | 'fix';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  options?: string[];
  correctAnswer: string | number;
  lineToFix?: number;
  explanation: string;
}

export const cppQuestions: Question[] = [
  // Output questions
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>

int main() {
    int x = 5;
    int y = 3;
    std::cout << x + y * 2;
    return 0;
}`,
    options: ['8', '11', '16', 'Error'],
    correctAnswer: '11',
    explanation: 'The expression evaluates to 5 + (3 * 2) = 5 + 6 = 11. Multiplication has higher precedence than addition.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>
#include <string>

std::string greet(std::string name) {
    return "Hello, " + name + "!";
}

int main() {
    std::string result = greet("Gizbo");
    std::cout << result;
    return 0;
}`,
    options: ['Hello, Gizbo!', 'Hello, name!', 'Hello, "Gizbo"!', 'None'],
    correctAnswer: 'Hello, Gizbo!',
    explanation: 'The function concatenates "Hello, " with the name parameter "Gizbo" and "!" to form "Hello, Gizbo!"'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    numbers.pop_back();
    numbers.pop_back();
    numbers.push_back(10);
    std::cout << numbers.size() << " " << numbers[2];
    return 0;
}`,
    options: ['3 3', '4 10', '4 4', '3 10'],
    correctAnswer: '4 10',
    explanation: 'After popping twice, the vector contains {1, 2, 3}. After pushing 10, it contains {1, 2, 3, 10}. So the size is 4 and the element at index 2 is 3.'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>

int recursiveSum(int n) {
    if (n <= 1) {
        return n;
    }
    return n + recursiveSum(n-1);
}

int main() {
    std::cout << recursiveSum(5);
    return 0;
}`,
    options: ['5', '10', '15', '120'],
    correctAnswer: '15',
    explanation: 'The recursive function calculates 5 + 4 + 3 + 2 + 1 = 15.'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>

void modify(int y) {
    y = y + 5;
}

int main() {
    int x = 10;
    int y;
    
    if (x > 5) {
        y = x + 2;
    } else if (x < 5) {
        y = x - 2;
    } else {
        y = x * 2;
    }
    
    modify(y);
    std::cout << y;
    return 0;
}`,
    options: ['10', '12', '17', 'Error'],
    correctAnswer: '12',
    explanation: 'x is 10, so y becomes 12. The function modify changes a copy of y, not the original variable, so y remains 12.'
  },

  // Error questions
  {
    id: 6,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>
#include <vector>

double calculateAverage(const std::vector<int>& numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total / count;
}

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    std::cout << calculateAverage(nums);
    return 0;
}`,
    options: [
      'Error: \`count\` is not declared in this scope', 
      'Error: cannot convert from void to double', 
      'Error: division by zero', 
      'Error: name must be a variable or object'
    ],
    correctAnswer: 'Error: \`count\` is not declared in this scope',
    explanation: 'The variable "count" is used but never defined. It should be numbers.size() instead.'
  },
  {
    id: 7,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> fruits = {"apple", "banana", "cherry"};
    std::cout << fruits[3];
    return 0;
}`,
    options: [
      'std::out_of_range exception', 
      'Undefined behavior', 
      'Segmentation fault', 
      'Compile-time error'
    ],
    correctAnswer: 'Undefined behavior',
    explanation: 'In C++, accessing an out-of-bounds index with the subscript operator [] on a vector does not throw an exception by default - it causes undefined behavior, which might crash the program.'
  },
  {
    id: 8,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>
#include <vector>
#include <string>

std::vector<int> processItems(const std::vector<std::string>& items) {
    std::vector<int> result;
    for (const auto& item : items) {
        if (item > 10) {
            result.push_back(std::stoi(item));
        }
    }
    return result;
}

int main() {
    std::vector<std::string> numbers = {"5", "15", "20", "25"};
    auto filtered = processItems(numbers);
    return 0;
}`,
    options: [
      'Error: no match for operator> (operand types are std::string and int)', 
      'Error: cannot convert std::string to int', 
      'Error: stoi argument must be string, not vector element', 
      'Error: invalid conversion from const char* to int'
    ],
    correctAnswer: 'Error: no match for operator> (operand types are std::string and int)',
    explanation: 'The code tries to compare a string with an integer (item > 10), which is not allowed in C++. You need to convert the string to an integer first with std::stoi().'
  },
  {
    id: 9,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>
#include <string>

class Pet {
private:
    std::string name;
    std::string species;
    
public:
    Pet(std::string name, std::string species) {
        this->name = name;
        this->species = species;
    }
    
    std::string speak() {
        if (species == "dog") {
            return "Woof!";
        } else if (species == "cat") {
            return "Meow!";
        }
        return "...";
    }
};

int main() {
    Pet pet1("Fluffy", "cat");
    std::cout << pet1.speak;
    return 0;
}`,
    options: [
      'Error: cannot convert member function to function pointer without &', 
      'Error: speak is not a member of Pet', 
      'Error: expected primary-expression before \')\'', 
      'Error: invalid use of member function'
    ],
    correctAnswer: 'Error: invalid use of member function',
    explanation: 'The code doesn\'t call the speak method - it should be pet1.speak() with parentheses. Without the parentheses, the compiler treats it as trying to access a member variable, but speak is a member function.'
  },
  {
    id: 10,
    type: 'error',
    difficulty: 'Hard',
    code: `#include <iostream>
#include <functional>

std::function<int()> outerFunction() {
    int counter = 0;
    
    auto innerFunction = [&]() {
        counter++;
        return counter;
    };
    
    return innerFunction;
}

int main() {
    auto counterFunc = outerFunction();
    std::cout << counterFunc();
    return 0;
}`,
    options: [
      'Undefined behavior due to accessing a variable that went out of scope', 
      'Error: capture of variable with automatic storage duration', 
      'Error: inner lambda cannot capture local variable from outer function', 
      'Error: invalid use of non-static data member'
    ],
    correctAnswer: 'Undefined behavior due to accessing a variable that went out of scope',
    explanation: 'The lambda captures counter by reference, but counter is a local variable that goes out of scope when outerFunction returns. Calling the lambda later accesses a variable that no longer exists, causing undefined behavior.'
  },

  // Fix questions
  {
    id: 11,
    type: 'fix',
    difficulty: 'Easy',
    code: `#include <iostream>

int multiply(int a, int b) {
    return a * B;
}

int main() {
    int result = multiply(3, 4);
    std::cout << result;
    return 0;
}`,
    lineToFix: 4,
    correctAnswer: 'return a * b;',
    explanation: 'In C++, variable names are case-sensitive. The parameter is named "b" but the code tries to use "B", which doesn\'t exist.'
  },
  {
    id: 12,
    type: 'fix',
    difficulty: 'Easy',
    code: `#include <iostream>

bool isEven(int number) {
    if (number % 2 = 0) {
        return true;
    } else {
        return false;
    }
}

int main() {
    std::cout << isEven(4);
    return 0;
}`,
    lineToFix: 4,
    correctAnswer: 'if (number % 2 == 0) {',
    explanation: 'The equality check should use == (comparison operator), not = (assignment operator).'
  },
  {
    id: 13,
    type: 'fix',
    difficulty: 'Medium',
    code: `#include <iostream>
#include <vector>

int findMax(const std::vector<int>& numbers) {
    int maxValue = numbers[0];
    for (int number : numbers) {
        if (number > maxValue)
            maxValue = number;
    }
    return maxValue
}

int main() {
    std::vector<int> nums = {5, 8, 3, 9, 2};
    std::cout << findMax(nums);
    return 0;
}`,
    lineToFix: 10,
    correctAnswer: 'return maxValue;',
    explanation: 'In C++, statements must end with a semicolon (;). The return statement is missing a semicolon.'
  },
  {
    id: 14,
    type: 'fix',
    difficulty: 'Medium',
    code: `#include <iostream>
#include <string>

int countVowels(const std::string& text) {
    int count = 0;
    for (char c : text) {
        char ch = tolower(c);
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            count++;
        }
    }
    return count;
}

int main() {
    std::cout << countVowels("Hello, World!");
    return 0;
}`,
    lineToFix: 7,
    correctAnswer: 'char ch = std::tolower(c);',
    explanation: 'The tolower function needs to be qualified with the std:: namespace or include the <cctype> header and use the using namespace std; directive.'
  },
  {
    id: 15,
    type: 'fix',
    difficulty: 'Hard',
    code: `#include <iostream>
#include <cmath>

class Circle {
private:
    double radius;
    
public:
    Circle(double r) : radius(r) {}
    
    double area() const {
        return M_PI * radius * radius;
    }
    
    double circumference() const
    {
        return 2 * M_PI * radius;
    }
};

int main() {
    Circle c(5.0);
    std::cout << "Area: " << c.area() << ", Circumference: " << c.circumference();
    return 0;
}`,
    lineToFix: 14,
    correctAnswer: 'double circumference() const {',
    explanation: 'The method declaration is missing a semicolon (;) after the function signature. In C++, there should be a semicolon after the function header in a class definition.'
  }
];
