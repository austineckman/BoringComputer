import { Question } from './questions-interface';

export const pythonQuestions: Question[] = [
  // Output questions
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: `x = 5\ny = 3\nprint(x + y * 2)`,
    options: ['8', '11', '16', 'Error'],
    correctAnswer: 1,
    explanation: 'The expression evaluates to 5 + (3 * 2) = 5 + 6 = 11. Multiplication has higher precedence than addition.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: `def greet(name):\n    return f"Hello, {name}!"\n\nresult = greet("Gizbo")\nprint(result)`,
    options: ['Hello, Gizbo!', 'Hello, name!', 'Hello, "Gizbo"!', 'None'],
    correctAnswer: 1,
    explanation: 'The function returns a formatted string where {name} is replaced with the argument "Gizbo".'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Medium',
    code: `numbers = [1, 2, 3, 4, 5]\nresult = [n * 2 for n in numbers if n % 2 == 0]\nprint(result)`,
    options: ['[2, 4, 6, 8, 10]', '[2, 6, 10]', '[4, 8]', '[2, 4, 6, 8]'],
    correctAnswer: 3,
    explanation: 'This list comprehension filters even numbers (2, 4) and then multiplies them by 2, resulting in [4, 8].'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Medium',
    code: `def recursive_sum(n):\n    if n <= 1:\n        return n\n    return n + recursive_sum(n-1)\n\nprint(recursive_sum(5))`,
    options: ['5', '10', '15', '120'],
    correctAnswer: 3,
    explanation: 'The recursive function calculates 5 + 4 + 3 + 2 + 1 = 15.'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Hard',
    code: `x = 10\nif x > 5:\n    y = x + 2\nelif x < 5:\n    y = x - 2\nelse:\n    y = x * 2\n\ndef modify(y):\n    y = y + 5\n    return y\n    \nz = modify(y)\nprint(y)`,
    options: ['10', '12', '17', 'Error'],
    correctAnswer: 2,
    explanation: 'x is 10, so y becomes 12. The function modify creates a new local variable y, which doesn\'t affect the outer y. So print(y) shows 12.'
  },

  // Error questions
  {
    id: 6,
    type: 'error',
    difficulty: 'Easy',
    code: `def calculate_average(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total / count\n\navg = calculate_average([1, 2, 3, 4, 5])`,
    correctAnswer: 5,
    explanation: 'The variable "count" is used but never defined. It should be len(numbers) instead.'
  },
  {
    id: 7,
    type: 'error',
    difficulty: 'Easy',
    code: `fruits = ["apple", "banana", "cherry"]\nprint(fruits[3])`,
    correctAnswer: 2,
    explanation: 'List indices start at 0, so a list with 3 elements has indices 0, 1, and 2. Trying to access index 3 results in IndexError.'
  },
  {
    id: 8,
    type: 'error',
    difficulty: 'Medium',
    code: `def process_items(items):\n    result = []\n    for i in range(len(items)):\n        if items[i] > 10:\n            result.append(items[i])\n    return result\n\nnumbers = [5, 15, "20", 25]\nfiltered = process_items(numbers)`,
    correctAnswer: 4,
    explanation: 'The function tries to compare a string "20" with the integer 10, which causes a TypeError because these types can\'t be compared with >.'
  },
  {
    id: 9,
    type: 'error',
    difficulty: 'Medium',
    code: `class Pet:\n    def __init__(self, name, species):\n        self.name = name\n        self.species = species\n    \n    def speak(self):\n        if self.species == "dog":\n            return "Woof!"\n        elif self.species == "cat":\n            return "Meow!"\n        return "..."\n\npet1 = Pet("Fluffy", "cat")\npet1.speak`,
    options: [
      'TypeError: \'method\' object is not callable', 
      'No error but returns a method reference instead of "Meow!"', 
      'AttributeError: \'Pet\' object has no attribute \'speak\'', 
      'SyntaxError: invalid syntax'
    ],
    correctAnswer: 2,
    explanation: 'The code doesn\'t call the speak method - it should be pet1.speak() with parentheses. Without the parentheses, it just returns a reference to the method.'
  },
  {
    id: 10,
    type: 'error',
    difficulty: 'Hard',
    code: `def outer_function():\n    counter = 0\n    \n    def inner_function():\n        counter += 1\n        return counter\n    \n    return inner_function\n\ncounter_func = outer_function()\nprint(counter_func())`,
    options: [
      'UnboundLocalError: local variable \'counter\' referenced before assignment', 
      'NameError: name \'counter\' is not defined', 
      'SyntaxError: can\'t assign to variable in enclosing scope', 
      'TypeError: \'int\' object is not callable'
    ],
    correctAnswer: 1,
    explanation: 'Python treats counter as a local variable in inner_function when we try to modify it. To fix this, we need to declare it as nonlocal.'
  },

  // Fix questions
  {
    id: 11,
    type: 'fix',
    difficulty: 'Easy',
    code: `def multiply(a, b):\n    return a * B\n\nresult = multiply(3, 4)\nprint(result)`,
    lineToFix: 2,
    correctAnswer: 'return a * b',
    explanation: 'In Python, variable names are case-sensitive. The parameter is named "b" but the code tries to use "B", which doesn\'t exist.'
  },
  {
    id: 12,
    type: 'fix',
    difficulty: 'Easy',
    code: `def is_even(number):\n    if number % 2 = 0:\n        return True\n    else:\n        return False`,
    lineToFix: 2,
    correctAnswer: 'if number % 2 == 0:',
    explanation: 'The equality check should use == (comparison operator), not = (assignment operator).'
  },
  {
    id: 13,
    type: 'fix',
    difficulty: 'Medium',
    code: `def find_max(numbers):\n    max_value = numbers[0]\n    for number in numbers:\n        if number > max_value\n            max_value = number\n    return max_value`,
    lineToFix: 4,
    correctAnswer: 'if number > max_value:',
    explanation: 'The if statement is missing a colon (:) at the end.'
  },
  {
    id: 14,
    type: 'fix',
    difficulty: 'Medium',
    code: `def count_vowels(text):\n    count = 0\n    for char in text.lower():\n        if char in ['a', 'e', 'i', 'o', 'u']:\n            count++\n    return count`,
    lineToFix: 5,
    correctAnswer: 'count += 1',
    explanation: 'Python doesn\'t have the increment operator (++). Use count += 1 instead.'
  },
  {
    id: 15,
    type: 'fix',
    difficulty: 'Hard',
    code: `class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    \n    def area(self):\n        return 3.14159 * self.radius * self.radius\n    \n    def circumference(self)\n        return 2 * 3.14159 * self.radius`,
    lineToFix: 8,
    correctAnswer: 'def circumference(self):',
    explanation: 'The method definition is missing a colon (:) after the parameter list.'
  }
];
