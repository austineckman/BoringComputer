import React, { useState, useEffect } from 'react';
import { 
  Code, FileCode, Terminal, Minimize2, X, Search, 
  ExternalLink, BookOpen, ChevronRight, Layers, Filter
} from 'lucide-react';

interface CodeReferenceWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

// Data types for the reference content
interface CodeExample {
  title: string;
  code: string;
  explanation: string;
}

interface ReferenceSection {
  id: string;
  title: string;
  content: string;
  examples?: CodeExample[];
  subSections?: ReferenceSection[];
}

interface CodeTerm {
  term: string;
  category: 'function' | 'data-type' | 'keyword' | 'operator' | 'directive' | 'class' | 'problem';
  language: 'python' | 'cpp' | 'arduino' | 'general' | 'problem-solution';
  description: string;
  syntax: string;
  examples: string[];
  notes: string;
  isProblem?: boolean;
}

interface ReferenceLanguage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: ReferenceSection[];
  terms: CodeTerm[];
}

// Import Python reference data from the original CodeReferenceWindow
// This is a completely populated version with ~100 Python terms
const pythonReference: ReferenceLanguage = {
  id: 'python',
  name: 'Python',
  description: 'A high-level, interpreted programming language known for its readability and versatility.',
  icon: <Code className="text-blue-600" />,
  sections: [
    {
      id: 'python-basics',
      title: 'Python Basics',
      content: 'Python is a high-level, interpreted programming language known for its readability and simple syntax. It supports multiple programming paradigms including procedural, object-oriented, and functional programming.',
      examples: [
        {
          title: 'Hello World',
          code: 'print("Hello, World!")',
          explanation: 'The print() function outputs text to the console.'
        }
      ]
    },
    {
      id: 'variables-datatypes',
      title: 'Variables and Data Types',
      content: 'Python is dynamically typed, meaning you don\'t need to declare variable types. Common data types include int, float, str, list, tuple, dict, and bool.',
      examples: [
        {
          title: 'Variable Assignment',
          code: 'x = 10\ny = "Hello"\nz = [1, 2, 3]',
          explanation: 'Variables are assigned using the = operator.'
        }
      ]
    },
    {
      id: 'control-flow',
      title: 'Control Flow',
      content: 'Python uses indentation (whitespace) to define blocks of code. Control flow statements include if-elif-else, for loops, while loops, and more.',
      examples: [
        {
          title: 'If Statement',
          code: 'x = 10\nif x > 5:\n    print("x is greater than 5")\nelse:\n    print("x is less than or equal to 5")',
          explanation: 'If statements execute code conditionally.'
        }
      ]
    }
  ],
  terms: [
    // Python Built-in Functions
    {
      term: 'print()',
      category: 'function',
      language: 'python',
      description: 'Outputs text or variables to the console.',
      syntax: 'print(value, ..., sep=" ", end="\\n", file=sys.stdout, flush=False)',
      examples: [
        'print("Hello, World!")',
        'print("Value:", 42)'
      ],
      notes: 'The print function in Python 3 is different from the print statement in Python 2.'
    },
    {
      term: 'input()',
      category: 'function',
      language: 'python',
      description: 'Reads a line of input from the user.',
      syntax: 'input(prompt)',
      examples: [
        'name = input("Enter your name: ")',
        'age = int(input("Enter your age: "))'
      ],
      notes: 'Always returns a string. Convert to the desired type if necessary.'
    },
    {
      term: 'len()',
      category: 'function',
      language: 'python',
      description: 'Returns the number of items in an object.',
      syntax: 'len(object)',
      examples: [
        'len("Hello") # Returns 5',
        'len([1, 2, 3]) # Returns 3'
      ],
      notes: 'Works with strings, lists, tuples, dictionaries, sets, and other sequence types.'
    },
    {
      term: 'range()',
      category: 'function',
      language: 'python',
      description: 'Generates a sequence of numbers.',
      syntax: 'range(stop) or range(start, stop[, step])',
      examples: [
        'for i in range(5): # 0, 1, 2, 3, 4',
        'for i in range(1, 10, 2): # 1, 3, 5, 7, 9'
      ],
      notes: 'Commonly used in for loops. The result is an immutable sequence type, not a list.'
    },
    {
      term: 'type()',
      category: 'function',
      language: 'python',
      description: 'Returns the type of an object.',
      syntax: 'type(object)',
      examples: [
        'type(42) # Returns <class \'int\'>',
        'type("Hello") # Returns <class \'str\'>'
      ],
      notes: 'Useful for debugging or conditional logic based on object type.'
    },
    {
      term: 'int()',
      category: 'function',
      language: 'python',
      description: 'Converts a value to an integer.',
      syntax: 'int(x, base=10)',
      examples: [
        'int("42") # Returns 42',
        'int(3.14) # Returns 3'
      ],
      notes: 'Raises ValueError if the string does not represent a valid integer or the base is invalid.'
    },
    {
      term: 'float()',
      category: 'function',
      language: 'python',
      description: 'Converts a value to a floating-point number.',
      syntax: 'float(x)',
      examples: [
        'float("3.14") # Returns 3.14',
        'float(42) # Returns 42.0'
      ],
      notes: 'Raises ValueError if the string does not represent a valid float.'
    },
    {
      term: 'str()',
      category: 'function',
      language: 'python',
      description: 'Returns a string representation of an object.',
      syntax: 'str(object)',
      examples: [
        'str(42) # Returns "42"',
        'str([1, 2, 3]) # Returns "[1, 2, 3]"'
      ],
      notes: 'Almost any object can be converted to a string.'
    },
    {
      term: 'list()',
      category: 'function',
      language: 'python',
      description: 'Creates a list or converts an iterable to a list.',
      syntax: 'list(iterable)',
      examples: [
        'list("abc") # Returns [\'a\', \'b\', \'c\']',
        'list(range(3)) # Returns [0, 1, 2]'
      ],
      notes: 'If no argument is given, returns a new empty list.'
    },
    {
      term: 'dict()',
      category: 'function',
      language: 'python',
      description: 'Creates a dictionary or converts a mapping to a dictionary.',
      syntax: 'dict() or dict(mapping) or dict(iterable) or dict(**kwargs)',
      examples: [
        'dict(a=1, b=2) # Returns {\'a\': 1, \'b\': 2}',
        'dict([(\'a\', 1), (\'b\', 2)]) # Returns {\'a\': 1, \'b\': 2}'
      ],
      notes: 'If no argument is given, returns a new empty dictionary.'
    },
    
    // Python Data Types
    {
      term: 'list',
      category: 'data-type',
      language: 'python',
      description: 'A mutable sequence of elements.',
      syntax: '[item1, item2, ...] or list(iterable)',
      examples: [
        'numbers = [1, 2, 3, 4, 5]',
        'mixed = [1, "hello", True, [2, 3]]'
      ],
      notes: 'Lists are mutable, ordered, and can contain items of different types.'
    },
    {
      term: 'dict',
      category: 'data-type',
      language: 'python',
      description: 'A mutable mapping of keys to values.',
      syntax: '{key1: value1, key2: value2, ...} or dict()',
      examples: [
        'person = {"name": "Alice", "age": 30}',
        'scores = dict(Alice=95, Bob=87, Charlie=92)'
      ],
      notes: 'Dictionary keys must be immutable (strings, numbers, tuples, etc.). Values can be any type.'
    },
    {
      term: 'tuple',
      category: 'data-type',
      language: 'python',
      description: 'An immutable sequence of elements.',
      syntax: '(item1, item2, ...) or tuple(iterable)',
      examples: [
        'point = (10, 20)',
        'single_item = (42,)  # Note the trailing comma'
      ],
      notes: 'Tuples are immutable and often used for values that shouldn\'t change, like coordinates.'
    },
    {
      term: 'set',
      category: 'data-type',
      language: 'python',
      description: 'An unordered collection of unique elements.',
      syntax: '{item1, item2, ...} or set(iterable)',
      examples: [
        'unique_numbers = {1, 2, 3, 4, 5}',
        'vowels = set("aeiou")'
      ],
      notes: 'Sets are mutable but can only contain hashable (immutable) items. Useful for removing duplicates.'
    },
    {
      term: 'bool',
      category: 'data-type',
      language: 'python',
      description: 'A boolean value representing True or False.',
      syntax: 'True or False',
      examples: [
        'is_valid = True',
        'has_error = False'
      ],
      notes: 'Many objects have a boolean value: empty containers and 0 are False, most other values are True.'
    },
    {
      term: 'None',
      category: 'data-type',
      language: 'python',
      description: 'A special constant representing the absence of a value.',
      syntax: 'None',
      examples: [
        'result = None',
        'if value is None:'
      ],
      notes: 'Functions that don\'t explicitly return a value return None by default.'
    },
    
    // Python Operators
    {
      term: '+',
      category: 'operator',
      language: 'python',
      description: 'Addition for numbers, concatenation for sequences.',
      syntax: 'x + y',
      examples: [
        '3 + 4  # Returns 7',
        '"Hello" + " World"  # Returns "Hello World"'
      ],
      notes: 'For lists and tuples, creates a new concatenated sequence.'
    },
    {
      term: 'in',
      category: 'operator',
      language: 'python',
      description: 'Membership test operator.',
      syntax: 'x in container',
      examples: [
        '3 in [1, 2, 3]  # Returns True',
        '"a" in "apple"  # Returns True'
      ],
      notes: 'Works with strings, lists, tuples, sets, and dictionaries (checks keys).'
    },
    
    // Python Control Flow
    {
      term: 'if-elif-else',
      category: 'keyword',
      language: 'python',
      description: 'Conditional execution of code.',
      syntax: 'if condition:\n    # code\nelif condition:\n    # code\nelse:\n    # code',
      examples: [
        'if x > 0:\n    print("Positive")\nelif x < 0:\n    print("Negative")\nelse:\n    print("Zero")'
      ],
      notes: 'The elif and else clauses are optional. Multiple elif clauses can be used.'
    },
    {
      term: 'for',
      category: 'keyword',
      language: 'python',
      description: 'Iterates over a sequence.',
      syntax: 'for item in iterable:\n    # code',
      examples: [
        'for i in range(5):\n    print(i)',
        'for char in "hello":\n    print(char)'
      ],
      notes: 'Can iterate over strings, lists, tuples, dictionaries, sets, or any iterable object.'
    },
    {
      term: 'while',
      category: 'keyword',
      language: 'python',
      description: 'Executes code as long as a condition is true.',
      syntax: 'while condition:\n    # code',
      examples: [
        'i = 0\nwhile i < 5:\n    print(i)\n    i += 1'
      ],
      notes: 'Make sure the condition eventually becomes false to avoid infinite loops.'
    },
    {
      term: 'break',
      category: 'keyword',
      language: 'python',
      description: 'Exits the nearest enclosing loop.',
      syntax: 'break',
      examples: [
        'for i in range(10):\n    if i == 5:\n        break\n    print(i)'
      ],
      notes: 'Works in both for and while loops.'
    },
    {
      term: 'continue',
      category: 'keyword',
      language: 'python',
      description: 'Skips the rest of the current loop iteration and continues with the next.',
      syntax: 'continue',
      examples: [
        'for i in range(10):\n    if i % 2 == 0:\n        continue\n    print(i)  # Prints only odd numbers'
      ],
      notes: 'Works in both for and while loops.'
    },
    {
      term: 'try-except',
      category: 'keyword',
      language: 'python',
      description: 'Handles exceptions (errors) that occur during execution.',
      syntax: 'try:\n    # code that might raise an exception\nexcept ExceptionType:\n    # code to handle the exception',
      examples: [
        'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")'
      ],
      notes: 'Multiple except blocks can handle different exception types. except without an exception type catches all exceptions.'
    },
    {
      term: 'with',
      category: 'keyword',
      language: 'python',
      description: 'Context manager for resource acquisition and release.',
      syntax: 'with expression as variable:\n    # code block',
      examples: [
        'with open("file.txt", "r") as file:\n    content = file.read()'
      ],
      notes: 'Automatically handles setup and cleanup (like closing files), even if an exception occurs.'
    },
    
    // Python Functions
    {
      term: 'def',
      category: 'keyword',
      language: 'python',
      description: 'Defines a function.',
      syntax: 'def function_name(parameters):\n    # function body',
      examples: [
        'def greet(name):\n    return f"Hello, {name}!"'
      ],
      notes: 'Parameters can have default values and be keyword or positional.'
    },
    {
      term: 'lambda',
      category: 'keyword',
      language: 'python',
      description: 'Creates a small anonymous function.',
      syntax: 'lambda parameters: expression',
      examples: [
        'add = lambda x, y: x + y\nadd(3, 4)  # Returns 7'
      ],
      notes: 'Limited to a single expression. Useful for short functions passed as arguments.'
    },
    
    // Python Classes and Objects
    {
      term: 'class',
      category: 'keyword',
      language: 'python',
      description: 'Defines a class, which is a blueprint for creating objects.',
      syntax: 'class ClassName:\n    # class body',
      examples: [
        'class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def greet(self):\n        return f"Hello, my name is {self.name}"'
      ],
      notes: 'Classes can inherit from other classes, override methods, and define special methods like __init__, __str__, etc.'
    },
    {
      term: '__init__',
      category: 'function',
      language: 'python',
      description: 'Special method that initializes a new instance of a class.',
      syntax: 'def __init__(self, parameters):\n    # initialization code',
      examples: [
        'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height'
      ],
      notes: 'Called automatically when creating a new instance of a class. The first parameter is always self, which refers to the instance being created.'
    },
    {
      term: 'self',
      category: 'keyword',
      language: 'python',
      description: 'A reference to the instance of a class.',
      syntax: 'self.attribute or self.method()',
      examples: [
        'class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def increment(self):\n        self.count += 1'
      ],
      notes: 'By convention, the first parameter of instance methods is self. It\'s automatically passed when a method is called on an instance.'
    },
    {
      term: 'inheritance-python',
      category: 'keyword',
      language: 'python',
      description: 'The mechanism of basing a class on another class, retaining similar implementation.',
      syntax: 'class DerivedClass(BaseClass):\n    # derived class body',
      examples: [
        'class Animal:\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"'
      ],
      notes: 'Python supports multiple inheritance. Use super() to call methods from the parent class.'
    },
    {
      term: 'super()',
      category: 'function',
      language: 'python',
      description: 'Returns a proxy object that delegates method calls to a parent or sibling class.',
      syntax: 'super().method()',
      examples: [
        'class Parent:\n    def greet(self):\n        return "Hello"\n\nclass Child(Parent):\n    def greet(self):\n        return super().greet() + " World"'
      ],
      notes: 'Commonly used in __init__ methods to call the parent class\'s initialization. Helps with maintaining proper method resolution order in multiple inheritance.'
    },
    
    // Python Modules and Packages
    {
      term: 'import',
      category: 'keyword',
      language: 'python',
      description: 'Imports a module, allowing access to its functions and classes.',
      syntax: 'import module_name',
      examples: [
        'import math\nresult = math.sqrt(16)'
      ],
      notes: 'Can also use from module import item to import specific items.'
    },
    {
      term: 'from',
      category: 'keyword',
      language: 'python',
      description: 'Imports specific items from a module.',
      syntax: 'from module_name import item_name',
      examples: [
        'from math import sqrt\nresult = sqrt(16)'
      ],
      notes: 'Can use from module import * to import all items, but this is generally discouraged.'
    },
    {
      term: 'as',
      category: 'keyword',
      language: 'python',
      description: 'Creates an alias for an imported module or item.',
      syntax: 'import module_name as alias or from module_name import item_name as alias',
      examples: [
        'import numpy as np\narr = np.array([1, 2, 3])',
        'from math import sqrt as square_root\nresult = square_root(16)'
      ],
      notes: 'Useful for modules with long names or to avoid naming conflicts.'
    },
    
    // Python String Methods
    {
      term: 'str.format()',
      category: 'function',
      language: 'python',
      description: 'Formats a string using placeholders.',
      syntax: 'string.format(value1, value2, ...)',
      examples: [
        '"Hello, {}!".format("World")  # Returns "Hello, World!"',
        '"{0} {1}, {1} {0}".format("hello", "world")  # Returns "hello world, world hello"'
      ],
      notes: 'Placeholders can be positional or named: "{name} is {age}".format(name="Alice", age=30)'
    },
    {
      term: 'f-string',
      category: 'function',
      language: 'python',
      description: 'Formatted string literal (introduced in Python 3.6).',
      syntax: 'f"string {expression}"',
      examples: [
        'name = "Alice"\nage = 30\nf"{name} is {age} years old"  # Returns "Alice is 30 years old"'
      ],
      notes: 'Can include expressions: f"2 + 2 = {2 + 2}". More readable and often preferred over str.format().'
    },
    {
      term: 'str.split()',
      category: 'function',
      language: 'python',
      description: 'Splits a string into a list based on a delimiter.',
      syntax: 'string.split(sep=None, maxsplit=-1)',
      examples: [
        '"apple,banana,cherry".split(",")  # Returns [\'apple\', \'banana\', \'cherry\']',
        '"hello world".split()  # Returns [\'hello\', \'world\']'
      ],
      notes: 'If sep is not specified or is None, splits on whitespace.'
    },
    {
      term: 'str.join()',
      category: 'function',
      language: 'python',
      description: 'Joins elements of an iterable using a string as a separator.',
      syntax: 'string.join(iterable)',
      examples: [
        '",".join([\'apple\', \'banana\', \'cherry\'])  # Returns "apple,banana,cherry"',
        '" ".join([\'hello\', \'world\'])  # Returns "hello world"'
      ],
      notes: 'The iterable must contain only strings, or a TypeError will be raised.'
    },
    {
      term: 'str.strip()',
      category: 'function',
      language: 'python',
      description: 'Removes leading and trailing characters from a string.',
      syntax: 'string.strip(chars=None)',
      examples: [
        '"  hello  ".strip()  # Returns "hello"',
        '"www.example.com".strip("w.")  # Returns "example.com"'
      ],
      notes: 'If chars is not specified or is None, removes whitespace. Related methods: lstrip() and rstrip().'
    },
    
    // Python List Methods
    {
      term: 'list.append()',
      category: 'function',
      language: 'python',
      description: 'Adds an item to the end of a list.',
      syntax: 'list.append(item)',
      examples: [
        'fruits = [\'apple\', \'banana\']\nfruits.append(\'cherry\')  # fruits becomes [\'apple\', \'banana\', \'cherry\']'
      ],
      notes: 'Modifies the list in place; doesn\'t return a new list.'
    },
    {
      term: 'list.extend()',
      category: 'function',
      language: 'python',
      description: 'Adds all items from an iterable to the end of a list.',
      syntax: 'list.extend(iterable)',
      examples: [
        'fruits = [\'apple\', \'banana\']\nfruits.extend([\'cherry\', \'date\'])  # fruits becomes [\'apple\', \'banana\', \'cherry\', \'date\']'
      ],
      notes: 'Modifies the list in place. Different from append, which would add the entire iterable as a single item.'
    },
    {
      term: 'list.insert()',
      category: 'function',
      language: 'python',
      description: 'Inserts an item at a given position.',
      syntax: 'list.insert(index, item)',
      examples: [
        'fruits = [\'apple\', \'banana\']\nfruits.insert(1, \'cherry\')  # fruits becomes [\'apple\', \'cherry\', \'banana\']'
      ],
      notes: 'If index is out of range, the item is added at the beginning (if index < 0) or end (if index > len(list)).'
    },
    {
      term: 'list.remove()',
      category: 'function',
      language: 'python',
      description: 'Removes the first occurrence of a value from a list.',
      syntax: 'list.remove(value)',
      examples: [
        'fruits = [\'apple\', \'banana\', \'apple\']\nfruits.remove(\'apple\')  # fruits becomes [\'banana\', \'apple\']'
      ],
      notes: 'Raises ValueError if the value is not present. Only removes the first occurrence.'
    },
    {
      term: 'list.pop()',
      category: 'function',
      language: 'python',
      description: 'Removes and returns an item at a given position.',
      syntax: 'list.pop(index=-1)',
      examples: [
        'fruits = [\'apple\', \'banana\', \'cherry\']\nfruit = fruits.pop()  # fruit is \'cherry\', fruits becomes [\'apple\', \'banana\']',
        'fruits = [\'apple\', \'banana\', \'cherry\']\nfruit = fruits.pop(0)  # fruit is \'apple\', fruits becomes [\'banana\', \'cherry\']'
      ],
      notes: 'If index is not specified, removes and returns the last item.'
    },
    {
      term: 'list.sort()',
      category: 'function',
      language: 'python',
      description: 'Sorts a list in place.',
      syntax: 'list.sort(key=None, reverse=False)',
      examples: [
        'numbers = [3, 1, 4, 1, 5]\nnumbers.sort()  # numbers becomes [1, 1, 3, 4, 5]',
        'fruits = [\'cherry\', \'apple\', \'banana\']\nfruits.sort()  # fruits becomes [\'apple\', \'banana\', \'cherry\']'
      ],
      notes: 'The key parameter specifies a function that is called on each list element prior to making comparisons.'
    },
    
    // Python Dictionary Methods
    {
      term: 'dict.get()',
      category: 'function',
      language: 'python',
      description: 'Returns the value for a key, or a default value if the key is not present.',
      syntax: 'dict.get(key, default=None)',
      examples: [
        'person = {"name": "Alice", "age": 30}\nperson.get("name")  # Returns "Alice"',
        'person.get("city", "Unknown")  # Returns "Unknown" since "city" is not in the dictionary'
      ],
      notes: 'Safer than direct access with dict[key], which raises KeyError if the key is not present.'
    },
    {
      term: 'dict.items()',
      category: 'function',
      language: 'python',
      description: 'Returns a view object containing key-value pairs as tuples.',
      syntax: 'dict.items()',
      examples: [
        'person = {"name": "Alice", "age": 30}\nfor key, value in person.items():\n    print(f"{key}: {value}")'
      ],
      notes: 'The view object reflects changes to the dictionary.'
    },
    {
      term: 'dict.keys()',
      category: 'function',
      language: 'python',
      description: 'Returns a view object containing the dictionary\'s keys.',
      syntax: 'dict.keys()',
      examples: [
        'person = {"name": "Alice", "age": 30}\nfor key in person.keys():\n    print(key)'
      ],
      notes: 'The view object reflects changes to the dictionary.'
    },
    {
      term: 'dict.values()',
      category: 'function',
      language: 'python',
      description: 'Returns a view object containing the dictionary\'s values.',
      syntax: 'dict.values()',
      examples: [
        'person = {"name": "Alice", "age": 30}\nfor value in person.values():\n    print(value)'
      ],
      notes: 'The view object reflects changes to the dictionary.'
    },
    {
      term: 'dict.update()',
      category: 'function',
      language: 'python',
      description: 'Updates the dictionary with elements from another dictionary or iterable.',
      syntax: 'dict.update(other)',
      examples: [
        'person = {"name": "Alice", "age": 30}\nperson.update({"age": 31, "city": "New York"})  # person becomes {"name": "Alice", "age": 31, "city": "New York"}'
      ],
      notes: 'Adds new key-value pairs and updates existing keys.'
    },
    
    // Python File Operations
    {
      term: 'open()',
      category: 'function',
      language: 'python',
      description: 'Opens a file and returns a file object.',
      syntax: 'open(file, mode="r", encoding=None)',
      examples: [
        'file = open("example.txt", "r", encoding="utf-8")',
        'with open("example.txt", "w") as file:\n    file.write("Hello, World!")'
      ],
      notes: 'Common modes: "r" (read), "w" (write), "a" (append), "b" (binary). Use the with statement to ensure the file is properly closed.'
    },
    {
      term: 'file.read()',
      category: 'function',
      language: 'python',
      description: 'Reads the contents of a file.',
      syntax: 'file.read(size=-1)',
      examples: [
        'with open("example.txt", "r") as file:\n    content = file.read()'
      ],
      notes: 'If size is negative or omitted, reads the entire file. Otherwise, reads up to size bytes.'
    },
    {
      term: 'file.write()',
      category: 'function',
      language: 'python',
      description: 'Writes a string to a file.',
      syntax: 'file.write(string)',
      examples: [
        'with open("example.txt", "w") as file:\n    file.write("Hello, World!")'
      ],
      notes: 'Returns the number of characters written. The file must be opened in write mode ("w", "a", etc.).'
    },
    {
      term: 'file.close()',
      category: 'function',
      language: 'python',
      description: 'Closes a file.',
      syntax: 'file.close()',
      examples: [
        'file = open("example.txt", "r")\n# Do something with the file\nfile.close()'
      ],
      notes: 'It\'s usually better to use the with statement, which automatically closes the file.'
    },
    
    // Python Collections and Comprehensions
    {
      term: 'list comprehension',
      category: 'function',
      language: 'python',
      description: 'A concise way to create lists based on existing iterables.',
      syntax: '[expression for item in iterable if condition]',
      examples: [
        'squares = [x**2 for x in range(10)]  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]',
        'evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]'
      ],
      notes: 'The if clause is optional. Can be nested but might become hard to read.'
    },
    {
      term: 'dict comprehension',
      category: 'function',
      language: 'python',
      description: 'A concise way to create dictionaries based on existing iterables.',
      syntax: '{key_expr: value_expr for item in iterable if condition}',
      examples: [
        'squares = {x: x**2 for x in range(5)}  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}',
        'even_squares = {x: x**2 for x in range(10) if x % 2 == 0}  # {0: 0, 2: 4, 4: 16, 6: 36, 8: 64}'
      ],
      notes: 'The if clause is optional. Similar to list comprehensions but creates dictionaries.'
    },
    {
      term: 'set comprehension',
      category: 'function',
      language: 'python',
      description: 'A concise way to create sets based on existing iterables.',
      syntax: '{expression for item in iterable if condition}',
      examples: [
        'squares = {x**2 for x in range(5)}  # {0, 1, 4, 9, 16}',
        'even_squares = {x**2 for x in range(10) if x % 2 == 0}  # {0, 4, 16, 36, 64}'
      ],
      notes: 'The if clause is optional. Similar to list comprehensions but creates sets, eliminating duplicates.'
    }
  ]
};

// Import the C++ reference data to ensure all terms are available
const cppReference: ReferenceLanguage = {
  id: 'cpp',
  name: 'C++',
  description: 'A powerful, high-performance programming language with direct memory manipulation capabilities.',
  icon: <FileCode className="text-purple-600" />,
  sections: [
    {
      id: 'cpp-basics',
      title: 'C++ Basics',
      content: 'C++ is a statically typed, compiled programming language that extends C with object-oriented features. It provides low-level memory manipulation while also supporting high-level abstractions.',
      examples: [
        {
          title: 'Hello World',
          code: '#include <iostream>\\n\\nint main() {\\n  std::cout << "Hello, World!" << std::endl;\\n  return 0;\\n}',
          explanation: 'This program outputs "Hello, World!" to the console.'
        }
      ]
    },
    {
      id: 'cpp-io',
      title: 'C++ Input/Output',
      content: 'C++ provides input/output functionality through the <iostream> library. The main objects are std::cout (for output), std::cin (for input), and std::cerr (for error output).',
      examples: [
        {
          title: 'User Input',
          code: '#include <iostream>\\n\\nint main() {\\n  int number;\\n  std::cout << "Enter a number: ";\\n  std::cin >> number;\\n  std::cout << "You entered: " << number << std::endl;\\n  return 0;\\n}',
          explanation: 'This program prompts the user to enter a number, reads it, and then displays it.'
        }
      ]
    },
    {
      id: 'cpp-control-flow',
      title: 'C++ Control Flow',
      content: 'C++ supports common control flow statements such as if-else, switch, for loops, while loops, and do-while loops.',
      examples: [
        {
          title: 'For Loop',
          code: '#include <iostream>\\n\\nint main() {\\n  for (int i = 0; i < 5; i++) {\\n    std::cout << i << std::endl;\\n  }\\n  return 0;\\n}',
          explanation: 'This program prints the numbers 0 through 4 using a for loop.'
        }
      ]
    }
  ],
  terms: [
    // C++ Input/Output
    {
      term: 'cout',
      category: 'function',
      language: 'cpp',
      description: 'The standard output stream object in C++.',
      syntax: 'std::cout << value;',
      examples: [
        'std::cout << "Hello, World!" << std::endl;',
        'std::cout << "The value is: " << variable << std::endl;'
      ],
      notes: 'Part of the <iostream> library. Use with the insertion operator (<<).'
    },
    {
      term: 'cin',
      category: 'function',
      language: 'cpp',
      description: 'The standard input stream object in C++.',
      syntax: 'std::cin >> variable;',
      examples: [
        'int number;\\nstd::cin >> number;',
        'std::string name;\\nstd::cin >> name;'
      ],
      notes: 'Part of the <iostream> library. Use with the extraction operator (>>). Reads until whitespace.'
    },
    {
      term: 'cerr',
      category: 'function',
      language: 'cpp',
      description: 'The standard error stream object in C++.',
      syntax: 'std::cerr << value;',
      examples: [
        'std::cerr << "Error: File not found." << std::endl;'
      ],
      notes: 'Part of the <iostream> library. Similar to cout, but for error messages. Output is not buffered.'
    },
    {
      term: 'endl',
      category: 'function',
      language: 'cpp',
      description: 'Inserts a newline character and flushes the stream.',
      syntax: 'std::cout << std::endl;',
      examples: [
        'std::cout << "Hello" << std::endl << "World" << std::endl;'
      ],
      notes: 'Equivalent to inserting \'\\n\' and calling flush(), but less efficient for multiple outputs.'
    },
    
    // C++ Data Types
    {
      term: 'int-cpp',
      category: 'data-type',
      language: 'cpp',
      description: 'Integer data type, typically 4 bytes.',
      syntax: 'int variable_name;',
      examples: [
        'int count = 10;',
        'int numbers[5] = {1, 2, 3, 4, 5};'
      ],
      notes: 'Size and range can vary by platform. Typical range is -2,147,483,648 to 2,147,483,647.'
    },
    {
      term: 'double',
      category: 'data-type',
      language: 'cpp',
      description: 'Double-precision floating-point data type, typically 8 bytes.',
      syntax: 'double variable_name;',
      examples: [
        'double pi = 3.14159;',
        'double distance = 123.45;'
      ],
      notes: 'More precise than float, but uses more memory. Typical range is approximately ±1.7E±308.'
    },
    {
      term: 'char',
      category: 'data-type',
      language: 'cpp',
      description: 'Character data type, 1 byte.',
      syntax: 'char variable_name;',
      examples: [
        'char grade = \'A\';',
        'char letter = 65; // Equivalent to \'A\' in ASCII'
      ],
      notes: 'Can store single characters or small integers. Characters are enclosed in single quotes.'
    },
    {
      term: 'string',
      category: 'data-type',
      language: 'cpp',
      description: 'Sequence of characters, part of the C++ Standard Library.',
      syntax: 'std::string variable_name;',
      examples: [
        'std::string name = "Alice";',
        'std::string greeting = "Hello, " + name;'
      ],
      notes: 'Requires #include <string>. More flexible than C-style string arrays.'
    },
    {
      term: 'vector',
      category: 'data-type',
      language: 'cpp',
      description: 'Dynamic array container, part of the C++ Standard Library.',
      syntax: 'std::vector<type> variable_name;',
      examples: [
        'std::vector<int> numbers = {1, 2, 3, 4, 5};',
        'numbers.push_back(6); // Add an element'
      ],
      notes: 'Requires #include <vector>. Size can change at runtime, unlike arrays.'
    },
    {
      term: 'array-cpp',
      category: 'data-type',
      language: 'cpp',
      description: 'Fixed-size collection of elements of the same type.',
      syntax: 'type variable_name[size];',
      examples: [
        'int scores[5] = {90, 85, 95, 80, 88};',
        'char name[10] = "Alice";'
      ],
      notes: 'Size must be known at compile time. Index starts at 0.'
    },
    
    // C++ Control Flow
    {
      term: 'if-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Conditional statement that executes code if a condition is true.',
      syntax: 'if (condition) { statements; }',
      examples: [
        'if (x > 0) {\\n    std::cout << "Positive" << std::endl;\\n}'
      ],
      notes: 'Can be followed by else if and else clauses.'
    },
    {
      term: 'else-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Used with if to specify code to execute when the condition is false.',
      syntax: 'if (condition) { statements1; } else { statements2; }',
      examples: [
        'if (x > 0) {\\n    std::cout << "Positive" << std::endl;\\n} else {\\n    std::cout << "Non-positive" << std::endl;\\n}'
      ],
      notes: 'The else clause is optional.'
    },
    {
      term: 'switch-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Multi-way branch statement that selects code to execute based on a value.',
      syntax: 'switch (expression) { case value1: statements1; break; case value2: statements2; break; default: statements3; }',
      examples: [
        'switch (day) {\\n    case 1: std::cout << "Monday"; break;\\n    case 2: std::cout << "Tuesday"; break;\\n    default: std::cout << "Other day"; break;\\n}'
      ],
      notes: 'Each case should typically end with break to prevent fall-through. The default case is optional.'
    },
    {
      term: 'for-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Loop that iterates a specified number of times.',
      syntax: 'for (initialization; condition; increment) { statements; }',
      examples: [
        'for (int i = 0; i < 5; i++) {\\n    std::cout << i << std::endl;\\n}'
      ],
      notes: 'All three expressions are optional. C++11 introduced range-based for loops for collections.'
    },
    {
      term: 'while-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Loop that executes as long as a condition is true, checking before each iteration.',
      syntax: 'while (condition) { statements; }',
      examples: [
        'int i = 0;\\nwhile (i < 5) {\\n    std::cout << i << std::endl;\\n    i++;\\n}'
      ],
      notes: 'The body may never execute if the condition is initially false.'
    },
    {
      term: 'do-while-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Loop that executes as long as a condition is true, checking after each iteration.',
      syntax: 'do { statements; } while (condition);',
      examples: [
        'int i = 0;\\ndo {\\n    std::cout << i << std::endl;\\n    i++;\\n} while (i < 5);'
      ],
      notes: 'The body always executes at least once, even if the condition is initially false.'
    },
    {
      term: 'break-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Exits the nearest enclosing loop or switch statement.',
      syntax: 'break;',
      examples: [
        'for (int i = 0; i < 10; i++) {\\n    if (i == 5) {\\n        break;\\n    }\\n    std::cout << i << std::endl;\\n}'
      ],
      notes: 'Can be used in for, while, do-while loops, and switch statements.'
    },
    {
      term: 'continue-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Skips the rest of the current loop iteration and continues with the next.',
      syntax: 'continue;',
      examples: [
        'for (int i = 0; i < 10; i++) {\\n    if (i % 2 == 0) {\\n        continue;\\n    }\\n    std::cout << i << std::endl; // Prints only odd numbers\\n}'
      ],
      notes: 'Can be used in for, while, and do-while loops.'
    },
    
    // C++ Functions
    {
      term: 'function-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Named block of code that performs a specific task.',
      syntax: 'return_type function_name(parameter_type parameter_name, ...) { statements; }',
      examples: [
        'int add(int a, int b) {\\n    return a + b;\\n}\\n\\nint main() {\\n    int sum = add(3, 4); // sum becomes 7\\n    return 0;\\n}'
      ],
      notes: 'Functions must be declared before they are called. Can use function prototypes to declare without defining.'
    },
    {
      term: 'return-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Exits a function and optionally returns a value.',
      syntax: 'return expression;',
      examples: [
        'int square(int x) {\\n    return x * x;\\n}'
      ],
      notes: 'A function with return type void can use return without an expression to exit early.'
    },
    {
      term: 'void-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Indicates that a function does not return a value.',
      syntax: 'void function_name(parameters) { statements; }',
      examples: [
        'void printMessage(std::string message) {\\n    std::cout << message << std::endl;\\n}'
      ],
      notes: 'Can also be used to specify that a function takes no parameters: void func(void);'
    },
    
    // C++ Memory Management
    {
      term: 'new',
      category: 'keyword',
      language: 'cpp',
      description: 'Allocates dynamic memory on the heap.',
      syntax: 'pointer_type* variable_name = new pointer_type;',
      examples: [
        'int* p = new int; // Allocate a single integer\\n*p = 10;',
        'int* arr = new int[5]; // Allocate array of 5 integers'
      ],
      notes: 'Memory allocated with new must be deallocated with delete or delete[] to avoid memory leaks.'
    },
    {
      term: 'delete',
      category: 'keyword',
      language: 'cpp',
      description: 'Deallocates memory previously allocated with new.',
      syntax: 'delete pointer_variable;',
      examples: [
        'int* p = new int;\\n*p = 10;\\n// Use p\\ndelete p; // Free the memory',
        'int* arr = new int[5];\\n// Use arr\\ndelete[] arr; // Free the array memory'
      ],
      notes: 'Use delete for single objects and delete[] for arrays. Using delete on a null pointer is safe.'
    },
    {
      term: 'pointer',
      category: 'data-type',
      language: 'cpp',
      description: 'Variable that stores a memory address.',
      syntax: 'type* variable_name;',
      examples: [
        'int* p = nullptr; // Declare and initialize a pointer',
        'int value = 42;\\nint* ptr = &value; // Point to value\'s address\\nstd::cout << *ptr; // Print 42'
      ],
      notes: 'Use & to get an address, * to dereference (access the value at) a pointer.'
    },
    {
      term: 'reference',
      category: 'data-type',
      language: 'cpp',
      description: 'An alias for an existing variable.',
      syntax: 'type& variable_name = existing_variable;',
      examples: [
        'int value = 42;\\nint& ref = value; // ref is an alias for value\\nref = 100; // value is now 100 too'
      ],
      notes: 'Must be initialized when declared. Cannot be reassigned to refer to a different variable.'
    },
    {
      term: 'nullptr',
      category: 'keyword',
      language: 'cpp',
      description: 'Represents a null pointer value (introduced in C++11).',
      syntax: 'pointer_type* variable_name = nullptr;',
      examples: [
        'int* p = nullptr; // Modern way to initialize a null pointer',
        'if (p == nullptr) { /* Handle null pointer */ }'
      ],
      notes: 'Preferred over NULL or 0 for null pointers in modern C++. Type-safe.'
    },
    {
      term: 'smart_pointers',
      category: 'data-type',
      language: 'cpp',
      description: 'Pointers that automatically manage memory (part of C++11 and later).',
      syntax: 'std::unique_ptr<type> variable_name = std::make_unique<type>();',
      examples: [
        '// C++14\\nstd::unique_ptr<int> p = std::make_unique<int>(42);',
        '// C++11\\nstd::shared_ptr<int> p = std::make_shared<int>(42);'
      ],
      notes: 'unique_ptr has exclusive ownership, shared_ptr has shared ownership, weak_ptr holds a non-owning reference to a shared_ptr object.'
    },
    
    // C++ Classes and Objects
    {
      term: 'class-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'User-defined data type that encapsulates data and functions.',
      syntax: 'class ClassName { access_specifier: members; };',
      examples: [
        'class Rectangle {\\nprivate:\\n    int width, height;\\npublic:\\n    Rectangle(int w, int h) : width(w), height(h) {}\\n    int area() { return width * height; }\\n};'
      ],
      notes: 'Access specifiers: public, private, protected. Default is private.'
    },
    {
      term: 'struct',
      category: 'keyword',
      language: 'cpp',
      description: 'User-defined data type similar to class, but with public members by default.',
      syntax: 'struct StructName { members; };',
      examples: [
        'struct Point {\\n    int x, y;\\n    Point(int x_val, int y_val) : x(x_val), y(y_val) {}\\n};'
      ],
      notes: 'Functionally equivalent to class except for default access level. Often used for simple data structures.'
    },
    {
      term: 'constructor',
      category: 'function',
      language: 'cpp',
      description: 'Special member function that initializes an object of a class.',
      syntax: 'ClassName(parameters) { initialization; }',
      examples: [
        'class Rectangle {\\nprivate:\\n    int width, height;\\npublic:\\n    Rectangle(int w, int h) {\\n        width = w;\\n        height = h;\\n    }\\n};'
      ],
      notes: 'Called automatically when an object is created. Can be overloaded to accept different parameters.'
    },
    {
      term: 'destructor',
      category: 'function',
      language: 'cpp',
      description: 'Special member function that is called when an object is destroyed.',
      syntax: '~ClassName() { cleanup; }',
      examples: [
        'class Resource {\\nprivate:\\n    int* data;\\npublic:\\n    Resource() { data = new int[100]; }\\n    ~Resource() { delete[] data; } // Destructor\\n};'
      ],
      notes: 'Important for freeing resources (like memory) owned by an object. Cannot take parameters or return values.'
    },
    {
      term: 'inheritance-cpp',
      category: 'keyword',
      language: 'cpp',
      description: 'Mechanism where a class inherits properties and methods from another class.',
      syntax: 'class DerivedClass : access_specifier BaseClass { members; };',
      examples: [
        'class Animal {\\npublic:\\n    void eat() { /* ... */ }\\n};\\n\\nclass Dog : public Animal {\\npublic:\\n    void bark() { /* ... */ }\\n};'
      ],
      notes: 'Access specifiers for inheritance: public, protected, private. Public is most common.'
    },
    {
      term: 'virtual',
      category: 'keyword',
      language: 'cpp',
      description: 'Specifies that a function can be overridden in derived classes.',
      syntax: 'virtual return_type function_name(parameters);',
      examples: [
        'class Base {\\npublic:\\n    virtual void show() { std::cout << "Base"; }\\n};\\n\\nclass Derived : public Base {\\npublic:\\n    void show() override { std::cout << "Derived"; }\\n};'
      ],
      notes: 'Enables polymorphism. Use override (C++11) in derived classes to make intent clear and catch errors.'
    }
  ]
};

// Import Arduino/Wiring reference data
const wiringReference: ReferenceLanguage = {
  id: 'wiring',
  name: 'Arduino/Wiring',
  description: 'A C++-based language designed for programming microcontrollers, especially Arduino boards.',
  icon: <Terminal className="text-green-600" />,
  sections: [
    {
      id: 'arduino-basics',
      title: 'Arduino Basics',
      content: 'Arduino programming is based on C++ but includes specific functions and libraries for interfacing with Arduino hardware. Every Arduino program (sketch) must include setup() and loop() functions.',
      examples: [
        {
          title: 'Blink LED',
          code: 'void setup() {\\n  pinMode(13, OUTPUT);\\n}\\n\\nvoid loop() {\\n  digitalWrite(13, HIGH);\\n  delay(1000);\\n  digitalWrite(13, LOW);\\n  delay(1000);\\n}',
          explanation: 'This program blinks an LED connected to pin 13 at a 1-second interval.'
        }
      ]
    },
    {
      id: 'arduino-digital-io',
      title: 'Digital Input/Output',
      content: 'Arduino provides functions to read from and write to digital pins. Digital pins can be set to either INPUT, INPUT_PULLUP, or OUTPUT mode.',
      examples: [
        {
          title: 'Button Input',
          code: 'const int buttonPin = 2; // Pin connected to a button\\nconst int ledPin = 13;    // Pin connected to an LED\\n\\nvoid setup() {\\n  pinMode(buttonPin, INPUT_PULLUP);\\n  pinMode(ledPin, OUTPUT);\\n}\\n\\nvoid loop() {\\n  if (digitalRead(buttonPin) == LOW) {\\n    digitalWrite(ledPin, HIGH);\\n  } else {\\n    digitalWrite(ledPin, LOW);\\n  }\\n}',
          explanation: 'This program turns on an LED when a button connected to pin 2 is pressed.'
        }
      ]
    },
    {
      id: 'arduino-analog-io',
      title: 'Analog Input/Output',
      content: 'Arduino can read analog values through its analog pins and simulate analog output through PWM on certain digital pins.',
      examples: [
        {
          title: 'Analog Read and Write',
          code: 'const int analogInPin = A0;  // Analog input pin\\nconst int analogOutPin = 9;   // Analog output pin (PWM)\\n\\nvoid setup() {\\n  // No setup needed for analog input\\n  // Analog output pin is automatically set as OUTPUT\\n}\\n\\nvoid loop() {\\n  int sensorValue = analogRead(analogInPin);\\n  int outputValue = map(sensorValue, 0, 1023, 0, 255);\\n  analogWrite(analogOutPin, outputValue);\\n  delay(10);\\n}',
          explanation: 'This program reads an analog value from a sensor and uses it to control the brightness of an LED.'
        }
      ]
    }
  ],
  terms: [
    // Digital I/O
    {
      term: 'pinMode()',
      category: 'function',
      language: 'arduino',
      description: 'Configures a digital pin to behave as an input or output.',
      syntax: 'pinMode(pin, mode)',
      examples: [
        'pinMode(13, OUTPUT); // Set pin 13 as an output',
        'pinMode(2, INPUT); // Set pin 2 as an input',
        'pinMode(3, INPUT_PULLUP); // Set pin 3 as an input with internal pull-up resistor'
      ],
      notes: 'Common modes: INPUT, OUTPUT, INPUT_PULLUP. Must be called before using digitalRead() or digitalWrite() on a pin.'
    },
    {
      term: 'digitalWrite()',
      category: 'function',
      language: 'arduino',
      description: 'Sets a digital pin to either HIGH or LOW state.',
      syntax: 'digitalWrite(pin, value)',
      examples: [
        'digitalWrite(13, HIGH); // Turn on LED',
        'digitalWrite(13, LOW); // Turn off LED'
      ],
      notes: 'The pin must be configured as OUTPUT using pinMode() first. HIGH is 5V (or 3.3V on 3.3V boards), LOW is 0V (ground).'
    },
    {
      term: 'digitalRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads the value from a digital pin, either HIGH or LOW.',
      syntax: 'digitalRead(pin)',
      examples: [
        'int buttonState = digitalRead(2); // Read the state of pin 2',
        'if (digitalRead(7) == HIGH) { /* Do something */ }'
      ],
      notes: 'Returns HIGH (1) if voltage on the pin is above a certain threshold, otherwise LOW (0). When using INPUT_PULLUP, button press reads as LOW.'
    },
    {
      term: 'HIGH | LOW',
      category: 'keyword',
      language: 'arduino',
      description: 'Constants used to set or check digital pin values.',
      syntax: 'HIGH or LOW',
      examples: [
        'digitalWrite(13, HIGH); // Set pin 13 to HIGH (5V/3.3V)',
        'if (digitalRead(2) == LOW) { /* Button pressed with INPUT_PULLUP */ }'
      ],
      notes: 'HIGH equals 1 (or true) and represents 5V (or 3.3V on 3.3V boards). LOW equals 0 (or false) and represents 0V (ground).'
    },
    {
      term: 'INPUT | INPUT_PULLUP | OUTPUT',
      category: 'keyword',
      language: 'arduino',
      description: 'Constants used to set pin modes.',
      syntax: 'INPUT, INPUT_PULLUP, or OUTPUT',
      examples: [
        'pinMode(2, INPUT); // Configure pin 2 as an input',
        'pinMode(3, INPUT_PULLUP); // Configure pin 3 as an input with internal pull-up resistor',
        'pinMode(13, OUTPUT); // Configure pin 13 as an output'
      ],
      notes: 'INPUT_PULLUP enables the internal pull-up resistor, making the pin read HIGH when nothing is connected.'
    },
    
    // Analog I/O
    {
      term: 'analogRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads the value from an analog pin.',
      syntax: 'analogRead(pin)',
      examples: [
        'int sensorValue = analogRead(A0); // Read from analog pin A0'
      ],
      notes: 'Returns a value between 0 and 1023, representing voltages from 0 to 5V (or 0 to 3.3V on 3.3V boards). No need to set pinMode() for analog inputs.'
    },
    {
      term: 'analogWrite()',
      category: 'function',
      language: 'arduino',
      description: 'Outputs an analog value (PWM wave) to a pin.',
      syntax: 'analogWrite(pin, value)',
      examples: [
        'analogWrite(9, 128); // Output 50% duty cycle PWM to pin 9',
        'analogWrite(3, 255); // Output 100% duty cycle (equivalent to digitalWrite(3, HIGH))'
      ],
      notes: 'Value range is 0-255. Only works on pins with PWM capability (usually marked with ~ on the board). Frequency is approximately 490 Hz on most pins.'
    },
    {
      term: 'analogReadResolution()',
      category: 'function',
      language: 'arduino',
      description: 'Sets the resolution of analogRead() on boards that support it.',
      syntax: 'analogReadResolution(bits)',
      examples: [
        'analogReadResolution(12); // Set resolution to 12 bits (0-4095)'
      ],
      notes: 'Only available on certain boards like Arduino Due, Zero, and MKR family. Default is 10 bits (0-1023).'
    },
    {
      term: 'analogWriteResolution()',
      category: 'function',
      language: 'arduino',
      description: 'Sets the resolution of analogWrite() on boards that support it.',
      syntax: 'analogWriteResolution(bits)',
      examples: [
        'analogWriteResolution(12); // Set resolution to 12 bits (0-4095)'
      ],
      notes: 'Only available on certain boards like Arduino Due, Zero, and MKR family. Default is 8 bits (0-255).'
    },
    {
      term: 'analogReference()',
      category: 'function',
      language: 'arduino',
      description: 'Configures the reference voltage used for analog input.',
      syntax: 'analogReference(type)',
      examples: [
        'analogReference(EXTERNAL); // Use voltage applied to AREF pin as reference'
      ],
      notes: 'Available reference types vary by board. Common ones include DEFAULT, INTERNAL, EXTERNAL. Improper use can damage your Arduino.'
    },
    
    // Time Functions
    {
      term: 'delay()',
      category: 'function',
      language: 'arduino',
      description: 'Pauses the program for the specified amount of milliseconds.',
      syntax: 'delay(ms)',
      examples: [
        'delay(1000); // Pause for 1 second'
      ],
      notes: 'Blocks all code execution during delay. Not suitable for multitasking. For non-blocking delays, use millis().'
    },
    {
      term: 'delayMicroseconds()',
      category: 'function',
      language: 'arduino',
      description: 'Pauses the program for the specified amount of microseconds.',
      syntax: 'delayMicroseconds(us)',
      examples: [
        'delayMicroseconds(10); // Pause for 10 microseconds'
      ],
      notes: 'Accurate for delays up to around 16,000 microseconds. For longer delays, use delay().'
    },
    {
      term: 'millis()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the number of milliseconds since the Arduino began running the current program.',
      syntax: 'millis()',
      examples: [
        'unsigned long currentTime = millis();',
        'if (millis() - previousTime >= interval) { /* Do something */ }'
      ],
      notes: 'Returns an unsigned long (0 to 4,294,967,295 milliseconds, or about 50 days). Overflows back to 0 after that.'
    },
    {
      term: 'micros()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the number of microseconds since the Arduino began running the current program.',
      syntax: 'micros()',
      examples: [
        'unsigned long startTime = micros();',
        'doSomething();',
        'unsigned long duration = micros() - startTime;'
      ],
      notes: 'Returns an unsigned long. Overflows after approximately 70 minutes. Resolution depends on the board.'
    },
    
    // Math Functions
    {
      term: 'map()',
      category: 'function',
      language: 'arduino',
      description: 'Re-maps a number from one range to another.',
      syntax: 'map(value, fromLow, fromHigh, toLow, toHigh)',
      examples: [
        'int outputValue = map(sensorValue, 0, 1023, 0, 255); // Map analog input to PWM output'
      ],
      notes: 'Useful for converting sensor readings to appropriate output values. Does not constrain values to the target range.'
    },
    {
      term: 'constrain()',
      category: 'function',
      language: 'arduino',
      description: 'Constrains a number to be within a specified range.',
      syntax: 'constrain(x, min, max)',
      examples: [
        'int constrainedValue = constrain(sensorValue, 100, 900); // Keep value between 100 and 900'
      ],
      notes: 'Returns min if x is less than min, max if x is greater than max, and x otherwise.'
    },
    {
      term: 'min()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the smaller of two numbers.',
      syntax: 'min(x, y)',
      examples: [
        'int smallerValue = min(sensor1, sensor2);'
      ],
      notes: 'Works with any data type that supports comparison operators.'
    },
    {
      term: 'max()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the larger of two numbers.',
      syntax: 'max(x, y)',
      examples: [
        'int largerValue = max(sensor1, sensor2);'
      ],
      notes: 'Works with any data type that supports comparison operators.'
    },
    {
      term: 'abs()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the absolute value of a number.',
      syntax: 'abs(x)',
      examples: [
        'int distance = abs(position1 - position2);'
      ],
      notes: 'Always returns a value of the same type as the input.'
    },
    {
      term: 'pow()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates a number raised to a power.',
      syntax: 'pow(base, exponent)',
      examples: [
        'double area = pow(radius, 2) * PI; // Area of a circle'
      ],
      notes: 'Returns a double. Both parameters should be of type double for best results.'
    },
    {
      term: 'sqrt()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the square root of a number.',
      syntax: 'sqrt(x)',
      examples: [
        'double distance = sqrt(sq(x2 - x1) + sq(y2 - y1)); // Distance between two points'
      ],
      notes: 'Returns a double. Input should be non-negative.'
    },
    {
      term: 'sin()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the sine of an angle (in radians).',
      syntax: 'sin(angle)',
      examples: [
        'float y = sin(radians(angle)); // Sine of an angle in degrees'
      ],
      notes: 'Returns a value between -1 and 1. Input must be in radians. Use radians() to convert from degrees.'
    },
    {
      term: 'cos()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the cosine of an angle (in radians).',
      syntax: 'cos(angle)',
      examples: [
        'float x = cos(radians(angle)); // Cosine of an angle in degrees'
      ],
      notes: 'Returns a value between -1 and 1. Input must be in radians. Use radians() to convert from degrees.'
    },
    {
      term: 'tan()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the tangent of an angle (in radians).',
      syntax: 'tan(angle)',
      examples: [
        'float slope = tan(radians(angle)); // Tangent of an angle in degrees'
      ],
      notes: 'Input must be in radians. Use radians() to convert from degrees.'
    },
    {
      term: 'random()',
      category: 'function',
      language: 'arduino',
      description: 'Generates pseudo-random numbers.',
      syntax: 'random(max) or random(min, max)',
      examples: [
        'int randomValue = random(10); // Random number from 0 to 9',
        'int diceRoll = random(1, 7); // Random number from 1 to 6'
      ],
      notes: 'Returns a long. Upper bound is exclusive, lower bound is inclusive. Use randomSeed() for different sequences.'
    },
    {
      term: 'randomSeed()',
      category: 'function',
      language: 'arduino',
      description: 'Initializes the pseudo-random number generator.',
      syntax: 'randomSeed(seed)',
      examples: [
        'randomSeed(analogRead(A0)); // Use noise from an unconnected analog pin as seed'
      ],
      notes: 'Call once at the beginning of a program for different random sequences each time the program runs.'
    },
    
    // Communication
    {
      term: 'Serial',
      category: 'function',
      language: 'arduino',
      description: 'Used for communication between the Arduino board and a computer or other devices.',
      syntax: 'Serial.method()',
      examples: [
        'Serial.begin(9600); // Initialize serial communication at 9600 bps',
        'Serial.println("Hello, world!"); // Send a message to the serial monitor'
      ],
      notes: 'Common methods: begin(), print(), println(), available(), read(), write().'
    },
    {
      term: 'SPI',
      category: 'function',
      language: 'arduino',
      description: 'Controls SPI (Serial Peripheral Interface) communication.',
      syntax: 'SPI.method()',
      examples: [
        '#include <SPI.h>\\n\\nvoid setup() {\\n  SPI.begin();\\n  // More setup code\\n}\\n\\nvoid loop() {\\n  SPI.transfer(value); // Send/receive a byte\\n}'
      ],
      notes: 'Requires #include <SPI.h>. Used for communication with SPI devices like SD cards, displays, and sensors.'
    },
    {
      term: 'Wire',
      category: 'function',
      language: 'arduino',
      description: 'Controls I2C (Inter-Integrated Circuit) communication.',
      syntax: 'Wire.method()',
      examples: [
        '#include <Wire.h>\\n\\nvoid setup() {\\n  Wire.begin(); // Join the I2C bus as master\\n  // or\\n  Wire.begin(address); // Join as slave with address\\n}'
      ],
      notes: 'Requires #include <Wire.h>. Used for communication with I2C devices like sensors, displays, and other microcontrollers.'
    },
    
    // Interrupts
    {
      term: 'attachInterrupt()',
      category: 'function',
      language: 'arduino',
      description: 'Configures a specified digital pin to trigger an interrupt.',
      syntax: 'attachInterrupt(digitalPinToInterrupt(pin), ISR, mode)',
      examples: [
        'attachInterrupt(digitalPinToInterrupt(2), myISR, RISING); // Call myISR when pin 2 goes from LOW to HIGH'
      ],
      notes: 'Mode options: LOW, CHANGE, RISING, FALLING, HIGH (not all boards). Only certain pins support interrupts.'
    },
    {
      term: 'detachInterrupt()',
      category: 'function',
      language: 'arduino',
      description: 'Disables interrupts on a specified digital pin.',
      syntax: 'detachInterrupt(digitalPinToInterrupt(pin))',
      examples: [
        'detachInterrupt(digitalPinToInterrupt(2)); // Disable interrupt on pin 2'
      ],
      notes: 'Use when you no longer need interrupts on a pin.'
    },
    {
      term: 'interrupts()',
      category: 'function',
      language: 'arduino',
      description: 'Re-enables interrupts (after they\'ve been disabled).',
      syntax: 'interrupts()',
      examples: [
        'noInterrupts(); // Disable interrupts\\n// Critical code that shouldn\'t be interrupted\\ninterrupts(); // Re-enable interrupts'
      ],
      notes: 'Use with noInterrupts() to protect critical sections of code.'
    },
    {
      term: 'noInterrupts()',
      category: 'function',
      language: 'arduino',
      description: 'Disables interrupts.',
      syntax: 'noInterrupts()',
      examples: [
        'noInterrupts(); // Disable interrupts\\n// Critical code that shouldn\'t be interrupted\\ninterrupts(); // Re-enable interrupts'
      ],
      notes: 'Disables all interrupts. Use sparingly and for short periods to avoid missing important events.'
    },
    {
      term: 'digitalPinToInterrupt()',
      category: 'function',
      language: 'arduino',
      description: 'Converts a digital pin number to the corresponding interrupt number.',
      syntax: 'digitalPinToInterrupt(pin)',
      examples: [
        'attachInterrupt(digitalPinToInterrupt(2), myISR, RISING);'
      ],
      notes: 'Use this rather than directly specifying interrupt numbers for better code portability across different Arduino boards.'
    },
    
    // Program Structure
    {
      term: 'setup()',
      category: 'function',
      language: 'arduino',
      description: 'Called once when the program starts.',
      syntax: 'void setup() { /* code */ }',
      examples: [
        'void setup() {\\n  pinMode(13, OUTPUT); // Initialize pin 13 as an output\\n  Serial.begin(9600); // Start serial communication\\n}'
      ],
      notes: 'Used for initialization: setting pin modes, starting serial communication, initializing libraries, etc.'
    },
    {
      term: 'loop()',
      category: 'function',
      language: 'arduino',
      description: 'Called repeatedly after setup() completes.',
      syntax: 'void loop() { /* code */ }',
      examples: [
        'void loop() {\\n  digitalWrite(13, HIGH); // Turn on LED\\n  delay(1000);               // Wait for 1 second\\n  digitalWrite(13, LOW);  // Turn off LED\\n  delay(1000);               // Wait for 1 second\\n}'
      ],
      notes: 'Main program that runs continuously until power is removed or the board is reset.'
    },
    
    // Data Types
    {
      term: 'boolean',
      category: 'data-type',
      language: 'arduino',
      description: 'A simple data type that can be either true or false.',
      syntax: 'boolean variable_name = value;',
      examples: [
        'boolean ledState = false;',
        'if (buttonPressed) { ledState = !ledState; }'
      ],
      notes: 'Takes up 1 byte of memory even though it only needs 1 bit. Can be used with logical operators (&&, ||, !).'
    },
    {
      term: 'byte',
      category: 'data-type',
      language: 'arduino',
      description: 'An 8-bit unsigned data type that stores values from 0 to 255.',
      syntax: 'byte variable_name = value;',
      examples: [
        'byte brightness = 128; // 50% brightness',
        'byte header = 0xFF; // Hexadecimal value'
      ],
      notes: 'Uses less memory than int. Useful for storing small positive integers or working with binary data.'
    },
    {
      term: 'char-arduino',
      category: 'data-type',
      language: 'arduino',
      description: 'A signed 8-bit data type that stores values from -128 to 127.',
      syntax: 'char variable_name = value;',
      examples: [
        'char letter = \'A\'; // Character literal',
        'char signedByte = -100; // Signed numerical value'
      ],
      notes: 'Can store ASCII characters or small signed integers. Single character literals use single quotes.'
    },
    {
      term: 'int-arduino',
      category: 'data-type',
      language: 'arduino',
      description: 'A 16-bit signed data type on most Arduino boards, storing values from -32,768 to 32,767.',
      syntax: 'int variable_name = value;',
      examples: [
        'int sensorValue = analogRead(A0); // Store analog reading',
        'int position = -200; // Negative value'
      ],
      notes: 'Most commonly used integer type. On Arduino Due and other 32-bit boards, int is 32 bits.'
    },
    {
      term: 'long',
      category: 'data-type',
      language: 'arduino',
      description: 'A 32-bit signed data type storing values from -2,147,483,648 to 2,147,483,647.',
      syntax: 'long variable_name = value;',
      examples: [
        'long timeElapsed = millis(); // Store time in milliseconds',
        'long distance = 1500000; // Large number'
      ],
      notes: 'Used when int is not large enough, such as when working with time in milliseconds.'
    },
    {
      term: 'float',
      category: 'data-type',
      language: 'arduino',
      description: 'A 32-bit floating-point data type for decimal numbers.',
      syntax: 'float variable_name = value;',
      examples: [
        'float voltage = 3.3; // Decimal value',
        'float temperature = sensor.readTemperature(); // Store temperature reading'
      ],
      notes: 'Provides about 6-7 decimal digits of precision. Floating-point math is slower than integer math.'
    },
    {
      term: 'String',
      category: 'data-type',
      language: 'arduino',
      description: 'A class for working with text strings.',
      syntax: 'String variable_name = "text";',
      examples: [
        'String message = "Hello";',
        'String fullMessage = message + ", World!"; // String concatenation'
      ],
      notes: 'More memory-intensive than character arrays. Provides convenient methods for string manipulation but can lead to memory fragmentation.'
    },
    {
      term: 'true | false',
      category: 'keyword',
      language: 'arduino',
      description: 'Boolean literals representing logical true and false values.',
      syntax: 'true or false',
      examples: [
        'boolean ledOn = true;',
        'if (digitalRead(buttonPin) == false) { /* Button is pressed with INPUT_PULLUP */ }'
      ],
      notes: 'true evaluates to 1 and false evaluates to 0. Non-zero values are considered true when used in conditions.'
    }
  ]
};

// All languages in one array
const LANGUAGES: ReferenceLanguage[] = [pythonReference, cppReference, wiringReference];

// Define categories for organizing terms
interface CategoryMapping {
  [key: string]: string;
}

const ImprovedCodeReferenceWindow = ({ onClose, onMinimize, isActive }: CodeReferenceWindowProps): React.ReactNode => {
  // Track recent terms for history feature
  const [recentTerms, setRecentTerms] = useState<CodeTerm[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // State for currently selected language, section, and subsection
  const [currentLanguage, setCurrentLanguage] = useState<ReferenceLanguage | null>(null);
  const [currentSection, setCurrentSection] = useState<ReferenceSection | null>(null);
  const [currentSubSection, setCurrentSubSection] = useState<ReferenceSection | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Term lookup state
  const [termLookup, setTermLookup] = useState<string>("");
  const [foundTerms, setFoundTerms] = useState<CodeTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<CodeTerm | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
  const [relatedTerms, setRelatedTerms] = useState<CodeTerm[]>([]);
  const [commonProblems, setCommonProblems] = useState<{problem: string, solution: string, relatedTerms: string[]}[]>([]);
  
  // Category browser state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Function to group terms by category for easier browsing
  const getCategorizedTerms = (language: ReferenceLanguage | null) => {
    if (!language) return { groupedTerms: {}, categories: {} };
    
    // Define categories and their display names
    const categories: {[key: string]: string} = {
      'built-in-functions': 'Built-in Functions',
      'data-types': 'Data Types',
      'operators': 'Operators',
      'control-flow': 'Control Flow',
      'functions': 'Functions',
      'classes-objects': 'Classes & Objects',
      'modules-packages': 'Modules & Packages',
      'string-methods': 'String Methods',
      'list-methods': 'List Methods',
      'dict-methods': 'Dictionary Methods',
      'file-operations': 'File Operations',
      'collections': 'Collections & Comprehensions',
      'advanced': 'Advanced Concepts',
      'memory': 'Memory Management',
      'error-handling': 'Error Handling',
      'io': 'Input/Output',
      'digital-io': 'Digital I/O',
      'analog-io': 'Analog I/O',
      'math': 'Math Functions',
      'time': 'Time Functions',
      'communication': 'Communication',
      'interrupts': 'Interrupts',
      'bits': 'Bits & Bytes',
      'other': 'Other'
    };
    
    // Map term names to categories
    const categoryMapping: CategoryMapping = {
      // Python mappings
      'print()': 'built-in-functions',
      'input()': 'built-in-functions',
      'len()': 'built-in-functions',
      'range()': 'built-in-functions',
      'type()': 'built-in-functions',
      'int()': 'built-in-functions',
      'float()': 'built-in-functions',
      'str()': 'built-in-functions',
      'list()': 'built-in-functions',
      'dict()': 'built-in-functions',
      'list': 'data-types',
      'dict': 'data-types',
      'tuple': 'data-types',
      'set': 'data-types',
      'bool': 'data-types',
      'None': 'data-types',
      '+': 'operators',
      'in': 'operators',
      'if-elif-else': 'control-flow',
      'for': 'control-flow',
      'while': 'control-flow',
      'break': 'control-flow',
      'continue': 'control-flow',
      'try-except': 'error-handling',
      'with': 'control-flow',
      'def': 'functions',
      'lambda': 'functions',
      'class': 'classes-objects',
      '__init__': 'classes-objects',
      'self': 'classes-objects',
      'inheritance': 'classes-objects',
      'super()': 'classes-objects',
      'import': 'modules-packages',
      'from': 'modules-packages',
      'as': 'modules-packages',
      'str.format()': 'string-methods',
      'f-string': 'string-methods',
      'str.split()': 'string-methods',
      'str.join()': 'string-methods',
      'str.strip()': 'string-methods',
      'list.append()': 'list-methods',
      'list.extend()': 'list-methods',
      'list.insert()': 'list-methods',
      'list.remove()': 'list-methods',
      'list.pop()': 'list-methods',
      'list.sort()': 'list-methods',
      'dict.get()': 'dict-methods',
      'dict.items()': 'dict-methods',
      'dict.keys()': 'dict-methods',
      'dict.values()': 'dict-methods',
      'dict.update()': 'dict-methods',
      'open()': 'file-operations',
      'file.read()': 'file-operations',
      'file.write()': 'file-operations',
      'file.close()': 'file-operations',
      'list comprehension': 'collections',
      'dict comprehension': 'collections',
      'set comprehension': 'collections',
      
      // C++ mappings
      'cout': 'io',
      'cin': 'io',
      'cerr': 'io',
      'endl': 'io',
      'int': 'data-types',
      'double': 'data-types',
      'char': 'data-types',
      'string': 'data-types',
      'vector': 'data-types',
      'array': 'data-types',
      'if-cpp': 'control-flow',
      'else-cpp': 'control-flow',
      'switch-cpp': 'control-flow',
      'for-cpp': 'control-flow',
      'while-cpp': 'control-flow',
      'do-while-cpp': 'control-flow',
      'break-cpp': 'control-flow',
      'continue-cpp': 'control-flow',
      'function': 'functions',
      'return': 'functions',
      'void': 'functions',
      'operators': 'operators',
      'new': 'memory',
      'delete': 'memory',
      'class-cpp': 'classes-objects',
      'struct': 'classes-objects',
      'constructor': 'classes-objects',
      'destructor': 'classes-objects',
      'inheritance-cpp': 'classes-objects',
      'virtual': 'classes-objects',
      'pointer': 'memory',
      'reference': 'memory',
      'nullptr': 'memory',
      'smart_pointers': 'memory',
      'iostream': 'io',
      'algorithm': 'collections',
      'try-catch': 'error-handling',
      'throw': 'error-handling',
      'exception': 'error-handling',
      
      // Arduino mappings
      'digitalRead()': 'digital-io',
      'digitalWrite()': 'digital-io',
      'pinMode()': 'digital-io',
      'analogRead()': 'analog-io',
      'analogReadResolution()': 'analog-io',
      'analogReference()': 'analog-io',
      'analogWrite()': 'analog-io',
      'analogWriteResolution()': 'analog-io',
      'abs()': 'math',
      'constrain()': 'math',
      'map()': 'math',
      'max()': 'math',
      'min()': 'math',
      'pow()': 'math',
      'sq()': 'math',
      'sqrt()': 'math',
      'cos()': 'math',
      'sin()': 'math',
      'tan()': 'math',
      'bit()': 'bits',
      'bitClear()': 'bits',
      'bitRead()': 'bits',
      'bitSet()': 'bits',
      'bitWrite()': 'bits',
      'highByte()': 'bits',
      'lowByte()': 'bits',
      'attachInterrupt()': 'interrupts',
      'detachInterrupt()': 'interrupts',
      'digitalPinToInterrupt()': 'interrupts',
      'noTone()': 'digital-io',
      'pulseIn()': 'digital-io',
      'pulseInLong()': 'digital-io',
      'shiftIn()': 'digital-io',
      'shiftOut()': 'digital-io',
      'tone()': 'digital-io',
      'delay()': 'time',
      'delayMicroseconds()': 'time',
      'micros()': 'time',
      'millis()': 'time',
      'random()': 'math',
      'randomSeed()': 'math',
      'interrupts()': 'interrupts',
      'noInterrupts()': 'interrupts',
      'HIGH | LOW': 'digital-io',
      'INPUT | INPUT_PULLUP | OUTPUT': 'digital-io',
      'true | false': 'data-types',
      'long': 'data-types',
      'float': 'data-types',
      'boolean': 'data-types',
      'byte': 'data-types',
      'String': 'data-types',
      'loop()': 'control-flow',
      'setup()': 'control-flow',
      'Serial': 'communication',
      'SPI': 'communication',
      'Wire': 'communication'
    };
    
    // Find all terms for this language
    const terms = language.terms;
    
    // Group terms by category
    const groupedTerms: {[key: string]: CodeTerm[]} = {};
    
    terms.forEach(term => {
      // Default category is 'other'
      let category = 'other';
      
      // Try to find a specific category
      if (categoryMapping[term.term]) {
        category = categoryMapping[term.term];
      } else if (term.category === 'function') {
        category = 'built-in-functions';
      } else if (term.category === 'data-type') {
        category = 'data-types';
      } else if (term.category === 'keyword' && 
                (term.term.includes('if') || term.term.includes('for') || 
                 term.term.includes('while') || term.term === 'break' || 
                 term.term === 'continue')) {
        category = 'control-flow';
      } else if (term.category === 'operator') {
        category = 'operators';
      } else if (term.category === 'class') {
        category = 'classes-objects';
      }
      
      // Initialize category array if it doesn't exist
      if (!groupedTerms[category]) {
        groupedTerms[category] = [];
      }
      
      // Add term to the category
      groupedTerms[category].push(term);
    });
    
    return { groupedTerms, categories };
  };

  // Language selection handler
  const handleLanguageSelect = (language: ReferenceLanguage) => {
    setCurrentLanguage(language);
    setCurrentSection(null);
    setCurrentSubSection(null);
    setSelectedCategory(null);
  };
  
  // Section selection handler
  const handleSectionSelect = (section: ReferenceSection) => {
    setCurrentSection(section);
    setCurrentSubSection(null);
  };
  
  // SubSection selection handler
  const handleSubSectionSelect = (subSection: ReferenceSection) => {
    setCurrentSubSection(subSection);
  };
  
  // Category selection handler
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  // Load initial problems data
  useEffect(() => {
    // Sample common problems data
    const problems = [
      {
        problem: "LED not turning on", 
        solution: "Check if the LED is connected in the correct orientation (anode to positive, cathode to negative). Make sure the pin is set to OUTPUT mode and has enough current.",
        relatedTerms: ["pinMode()", "digitalWrite()"]
      },
      {
        problem: "Serial monitor showing garbage characters", 
        solution: "Ensure that the baud rate in your Serial.begin() matches the baud rate selected in the serial monitor.",
        relatedTerms: ["Serial.begin()"]
      },
      {
        problem: "Servo motor jittering", 
        solution: "Check power supply - servos often need more current than the Arduino can provide. Consider using a separate power supply for the servo.",
        relatedTerms: ["analogWrite()", "servo.attach()"]
      },
      {
        problem: "Button input not working", 
        solution: "Add a pull-up or pull-down resistor to prevent floating inputs. Alternatively, use pinMode with INPUT_PULLUP.",
        relatedTerms: ["pinMode()", "digitalRead()"]
      },
      {
        problem: "Sensor readings fluctuating", 
        solution: "Add a decoupling capacitor near the sensor power pins. Consider taking multiple readings and averaging them.",
        relatedTerms: ["analogRead()"]
      }
    ];
    setCommonProblems(problems);
  }, []);

  // Term lookup handler with enhanced search
  const handleTermLookup = (term: string) => {
    setTermLookup(term);
    setSelectedTerm(null);
    
    if (term.trim() === "") {
      setFoundTerms([]);
      setShowAutoComplete(false);
      return;
    }
    
    // Generate autocomplete suggestions
    const allTerms = LANGUAGES.flatMap(lang => lang.terms.map(t => t.term));
    const matchingSuggestions = allTerms
      .filter(t => t.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 5);
    setSuggestions(matchingSuggestions);
    setShowAutoComplete(matchingSuggestions.length > 0);
    
    // Fuzzy search implementation
    const fuzzyMatch = (text: string, pattern: string): boolean => {
      // Simple fuzzy matching - characters can be skipped but must be in order
      pattern = pattern.toLowerCase();
      text = text.toLowerCase();
      
      let patternIdx = 0;
      let textIdx = 0;
      
      while (patternIdx < pattern.length && textIdx < text.length) {
        if (pattern[patternIdx] === text[textIdx]) {
          patternIdx++;
        }
        textIdx++;
      }
      
      return patternIdx === pattern.length;
    };
    
    // Also check for problem-based searches
    const isProblemSearch = commonProblems.some(p => 
      p.problem.toLowerCase().includes(term.toLowerCase())
    );
    
    const terms: CodeTerm[] = [];
    
    // Search by active filter
    LANGUAGES.forEach(language => {
      if (activeFilter !== "all" && language.id !== activeFilter) return;
      
      language.terms.forEach(codeTerm => {
        // Multiple ways to match: exact, includes, fuzzy
        const exactMatch = codeTerm.term.toLowerCase() === term.toLowerCase();
        const includesMatch = codeTerm.term.toLowerCase().includes(term.toLowerCase());
        const fuzzyMatched = fuzzyMatch(codeTerm.term, term);
        const descriptionMatch = codeTerm.description.toLowerCase().includes(term.toLowerCase());
        const syntaxMatch = codeTerm.syntax.toLowerCase().includes(term.toLowerCase());
        const exampleMatch = codeTerm.examples.some(e => e.toLowerCase().includes(term.toLowerCase()));
        
        // Enhanced matching
        if (exactMatch || includesMatch || fuzzyMatched || descriptionMatch || syntaxMatch || exampleMatch) {
          // Avoid duplicates
          if (!terms.some(t => t.term === codeTerm.term && t.language === codeTerm.language)) {
            terms.push(codeTerm);
          }
        }
      });
    });
    
    // If it's a problem search, add problem-related terms to the top
    if (isProblemSearch) {
      const problemMatches = commonProblems.filter(p => 
        p.problem.toLowerCase().includes(term.toLowerCase())
      );
      
      // Add special problem entries to the beginning of results
      problemMatches.forEach(problem => {
        // Mark as special problem result
        const specialProblemEntry: CodeTerm = {
          term: problem.problem,
          category: 'problem',
          language: 'problem-solution',
          description: problem.solution,
          syntax: 'N/A',
          examples: [],
          notes: 'Related functions: ' + problem.relatedTerms.join(', '),
          isProblem: true
        };
        
        // Insert at beginning
        terms.unshift(specialProblemEntry);
      });
    }
    
    setFoundTerms(terms);
    
    // Store search in history if it's a new search with results
    if (term.trim() !== "" && terms.length > 0 && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev].slice(0, 10));
    }
  };
  
  // Handle term selection with related terms
  const handleTermSelect = (term: CodeTerm) => {
    setSelectedTerm(term);
    setFoundTerms([]);
    setTermLookup("");
    setShowAutoComplete(false);
    
    // Find related terms (same category or mentioned in description)
    if (term.language !== 'problem-solution') {
      const related = LANGUAGES
        .flatMap(lang => lang.terms)
        .filter(t => 
          // Same category in same language but different term
          (t.category === term.category && 
           t.language === term.language && 
           t.term !== term.term) ||
          // Or mentioned in description
          t.description.toLowerCase().includes(term.term.toLowerCase()) ||
          // Or related through common problem
          commonProblems.some(problem => 
            problem.relatedTerms.includes(term.term) && 
            problem.relatedTerms.includes(t.term) &&
            t.term !== term.term
          )
        )
        .slice(0, 5); // Limit to 5 related terms
      
      setRelatedTerms(related);
    } else {
      // For problem-solution entries, show the referenced terms
      const referenced = LANGUAGES
        .flatMap(lang => lang.terms)
        .filter(t => term.notes.includes(t.term))
        .slice(0, 5);
      
      setRelatedTerms(referenced);
    }
    
    // Add to recent terms history (avoid duplicates)
    if (!recentTerms.some(t => t.term === term.term && t.language === term.language)) {
      setRecentTerms(prev => [term, ...prev].slice(0, 10)); // Keep last 10 terms
    }
  };
  
  // Effect for searching documentation content
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const results: any[] = [];
    
    // Search in all languages
    LANGUAGES.forEach(language => {
      // Search in language name and description
      if (language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          language.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          type: 'language',
          item: language
        });
      }
      
      // Search in sections
      language.sections.forEach(section => {
        if (section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            type: 'section',
            item: section,
            language: language
          });
        }
        
        // Search in examples
        section.examples?.forEach(example => {
          if (example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              example.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              example.explanation.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              type: 'example',
              item: example,
              section: section,
              language: language
            });
          }
        });
        
        // Search in subsections
        section.subSections?.forEach(subSection => {
          if (subSection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              subSection.content.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              type: 'subsection',
              item: subSection,
              section: section,
              language: language
            });
          }
          
          // Search in subsection examples
          subSection.examples?.forEach(example => {
            if (example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                example.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                example.explanation.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push({
                type: 'example',
                item: example,
                subSection: subSection,
                section: section,
                language: language
              });
            }
          });
        });
      });
      
      // Search in terms
      language.terms.forEach(term => {
        if (term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.syntax.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.examples.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))) {
          results.push({
            type: 'term',
            item: term,
            language: language
          });
        }
      });
    });
    
    setSearchResults(results);
  }, [searchTerm]);
  
  // Helper to render code examples with proper formatting
  const renderCode = (code: string) => {
    return (
      <pre className="bg-gray-100 p-2 rounded overflow-x-auto font-mono text-sm">
        <code>{code}</code>
      </pre>
    );
  };
  
  // Function to render search results
  const renderSearchResults = () => {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Results for "{searchTerm}"</h2>
          <button 
            onClick={() => {
              setSearchTerm("");
              setIsSearching(false);
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            <X className="w-4 h-4 mr-1" /> Clear Search
          </button>
        </div>
        
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-bold text-xl mb-2">No results found</h3>
            <p>Try different keywords or check spelling</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Language results */}
            {searchResults.filter(r => r.type === 'language').length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">Languages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults
                    .filter(r => r.type === 'language')
                    .map((result, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all ${
                          result.item.id === 'python' ? 'bg-blue-50 border-blue-200' :
                          result.item.id === 'cpp' ? 'bg-purple-50 border-purple-200' :
                          'bg-green-50 border-green-200'
                        }`}
                        onClick={() => handleLanguageSelect(result.item)}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-md ${
                            result.item.id === 'python' ? 'bg-blue-100' :
                            result.item.id === 'cpp' ? 'bg-purple-100' :
                            'bg-green-100'
                          } mr-3`}>
                            {result.item.icon}
                          </div>
                          <div>
                            <h4 className="font-bold">{result.item.name}</h4>
                            <p className="text-sm text-gray-600">{result.item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Term results */}
            {searchResults.filter(r => r.type === 'term').length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">Terms</h3>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults
                    .filter(r => r.type === 'term')
                    .map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md ${
                          result.item.language === 'python' ? 'border-blue-200 bg-blue-50' :
                          result.item.language === 'cpp' ? 'border-purple-200 bg-purple-50' :
                          'border-green-200 bg-green-50'
                        }`}
                        onClick={() => handleTermSelect(result.item)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold">{result.item.term}</h4>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              result.item.language === 'python' ? 'bg-blue-200 text-blue-800' :
                              result.item.language === 'cpp' ? 'bg-purple-200 text-purple-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {result.item.language === 'python' ? 'Python' :
                               result.item.language === 'cpp' ? 'C++' : 'Arduino'}
                            </span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">
                              {result.item.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{result.item.description}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Section results */}
            {searchResults.filter(r => r.type === 'section').length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">Topics</h3>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults
                    .filter(r => r.type === 'section')
                    .map((result, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg shadow-sm border border-gray-200 bg-white cursor-pointer hover:shadow-md"
                        onClick={() => {
                          handleLanguageSelect(result.language);
                          handleSectionSelect(result.item);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold">{result.item.title}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            result.language.id === 'python' ? 'bg-blue-200 text-blue-800' :
                            result.language.id === 'cpp' ? 'bg-purple-200 text-purple-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {result.language.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{result.item.content.substring(0, 150)}...</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Example results */}
            {searchResults.filter(r => r.type === 'example').length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">Code Examples</h3>
                <div className="grid grid-cols-1 gap-4">
                  {searchResults
                    .filter(r => r.type === 'example')
                    .map((result, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg shadow-sm border border-gray-200 bg-white cursor-pointer hover:shadow-md"
                        onClick={() => {
                          handleLanguageSelect(result.language);
                          handleSectionSelect(result.section);
                          if (result.subSection) {
                            handleSubSectionSelect(result.subSection);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold">{result.item.title}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            result.language.id === 'python' ? 'bg-blue-200 text-blue-800' :
                            result.language.id === 'cpp' ? 'bg-purple-200 text-purple-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {result.language.name}
                          </span>
                        </div>
                        {renderCode(result.item.code)}
                        <p className="text-sm text-gray-700 mt-1">{result.item.explanation}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          From: {result.section.title}{result.subSection ? ` > ${result.subSection.title}` : ''}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Main content render function
  const renderContent = () => {
    // If searching, show search results
    if (isSearching) {
      return renderSearchResults();
    }
    
    // If term is selected, show term details
    if (selectedTerm) {
      const languageClasses = {
        'python': 'border-blue-500 bg-blue-50',
        'cpp': 'border-purple-500 bg-purple-50',
        'arduino': 'border-green-500 bg-green-50',
        'general': 'border-gray-500 bg-gray-50',
        'problem-solution': 'border-amber-500 bg-amber-50'
      };
      
      const languageColor = {
        'python': 'text-blue-800',
        'cpp': 'text-purple-800',
        'arduino': 'text-green-800',
        'general': 'text-gray-800',
        'problem-solution': 'text-amber-800'
      };
      
      return (
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <button 
              className="text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setSelectedTerm(null)}
            >
              <span className="mr-1">←</span> Back
            </button>
            
            {selectedTerm.language !== 'problem-solution' && (
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Language:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${languageColor[selectedTerm.language]}`}>
                  {selectedTerm.language === 'python' ? 'Python' :
                   selectedTerm.language === 'cpp' ? 'C++' :
                   selectedTerm.language === 'arduino' ? 'Arduino' : 'General'}
                </span>
              </div>
            )}
          </div>
          
          <div className={`rounded-lg border-l-4 p-4 ${languageClasses[selectedTerm.language]}`}>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{selectedTerm.term}</h2>
              <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-800">
                {selectedTerm.category}
              </span>
            </div>
            
            <div className="mt-4 space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-bold mb-1">Description</h3>
                <p>{selectedTerm.description}</p>
              </div>
              
              {/* Syntax (if not a problem) */}
              {selectedTerm.language !== 'problem-solution' && (
                <div>
                  <h3 className="font-bold mb-1">Syntax</h3>
                  <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                    {selectedTerm.syntax}
                  </div>
                </div>
              )}
              
              {/* Examples */}
              {selectedTerm.examples.length > 0 && (
                <div>
                  <h3 className="font-bold mb-1">Examples</h3>
                  <div className="space-y-2">
                    {selectedTerm.examples.map((example, idx) => (
                      <div key={idx} className="bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {selectedTerm.notes && (
                <div>
                  <h3 className="font-bold mb-1">Notes</h3>
                  <p className="text-gray-700">{selectedTerm.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Related terms section */}
          {relatedTerms.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-3">Related Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {relatedTerms.map((term, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 rounded-md cursor-pointer hover:bg-white ${
                      term.language === 'python' ? 'border-l-2 border-blue-500' :
                      term.language === 'cpp' ? 'border-l-2 border-purple-500' :
                      term.language === 'arduino' ? 'border-l-2 border-green-500' :
                      'border-l-2 border-gray-500'
                    }`}
                    onClick={() => handleTermSelect(term)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{term.term}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{term.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // If category is selected, show terms in that category
    if (currentLanguage && selectedCategory) {
      const { groupedTerms, categories } = getCategorizedTerms(currentLanguage);
      const termsInCategory = groupedTerms[selectedCategory] || [];
      const categoryName = categories[selectedCategory] || selectedCategory;
      
      return (
        <div className="p-4">
          <div className="flex items-center mb-6">
            <button 
              className="mr-2 text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setSelectedCategory(null)}
            >
              <span className="mr-1">←</span> Back to Categories
            </button>
            <h2 className="text-xl font-bold">{categoryName} ({termsInCategory.length})</h2>
          </div>
          
          {termsInCategory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <h3 className="font-bold text-xl mb-2">No terms in this category</h3>
              <p>Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {termsInCategory.map((term, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md ${
                    term.language === 'python' ? 'border-blue-200 bg-blue-50' :
                    term.language === 'cpp' ? 'border-purple-200 bg-purple-50' :
                    'border-green-200 bg-green-50'
                  }`}
                  onClick={() => handleTermSelect(term)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{term.term}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">
                      {term.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{term.description}</p>
                  <div className="mt-2 text-xs text-blue-600 flex justify-end">
                    View details →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // If language is selected but no section or category, show language overview with categories
    if (currentLanguage && !currentSection) {
      const { groupedTerms, categories } = getCategorizedTerms(currentLanguage);
      
      // Get all available categories for this language
      const availableCategories = Object.keys(groupedTerms)
        .filter(cat => groupedTerms[cat].length > 0)
        .sort((a, b) => groupedTerms[b].length - groupedTerms[a].length); // Sort by number of terms
      
      return (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              className="mr-2 text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setCurrentLanguage(null)}
            >
              <span className="mr-1">←</span> Back
            </button>
            <h2 className="text-xl font-bold">{currentLanguage.name} Reference</h2>
          </div>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex mb-3">
              <div className={`p-2 rounded-md ${
                currentLanguage.id === 'python' ? 'bg-blue-200' : 
                currentLanguage.id === 'cpp' ? 'bg-purple-200' : 
                'bg-green-200'
              } mr-3`}>
                {currentLanguage.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentLanguage.name}</h3>
                <p className="text-gray-700">{currentLanguage.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Terms:</span>
                <span className="font-semibold">{currentLanguage.terms.length}</span>
              </div>
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Categories:</span>
                <span className="font-semibold">{availableCategories.length}</span>
              </div>
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Documentation:</span>
                <span className="font-semibold">{currentLanguage.sections.length} topics</span>
              </div>
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Last Updated:</span>
                <span className="font-semibold">May 2, 2025</span>
              </div>
            </div>
          </div>
          
          {/* Browse by Category */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-indigo-500" />
              Browse by Category
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableCategories.map(categoryKey => (
                <div 
                  key={categoryKey}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleCategorySelect(categoryKey)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-800">{categories[categoryKey] || categoryKey}</h4>
                    <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                      {groupedTerms[categoryKey].length} terms
                    </span>
                  </div>
                  
                  {/* Show a few sample terms */}
                  <div className="space-y-1 mb-2">
                    {groupedTerms[categoryKey].slice(0, 3).map(term => (
                      <div key={term.term} className="text-sm text-gray-600 font-mono truncate">
                        {term.term}
                      </div>
                    ))}
                    {groupedTerms[categoryKey].length > 3 && (
                      <div className="text-xs text-gray-500">+ {groupedTerms[categoryKey].length - 3} more...</div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-indigo-600 flex justify-end items-center">
                    View all <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Documentation Topics Section */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
              Documentation Topics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentLanguage.sections.map(section => (
                <div
                  key={section.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => handleSectionSelect(section)}
                >
                  <h4 className="font-bold text-gray-800">{section.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{section.content}</p>
                  {section.examples && (
                    <div className="text-xs text-gray-500 mt-2">
                      {section.examples.length} example{section.examples.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // If language and section selected (with possible subsection)
    // Return the section content view
    if (currentLanguage && currentSection) {
      return (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              className="mr-2 text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setCurrentSection(null)}
            >
              <span className="mr-1">←</span> Back to {currentLanguage.name}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar for subsections if they exist */}
            {currentSection.subSections && currentSection.subSections.length > 0 && (
              <div className="lg:col-span-1">
                <h3 className="font-bold mb-2">In This Section</h3>
                <div className="bg-gray-50 rounded-lg">
                  <div 
                    className={`p-2 rounded-md cursor-pointer ${!currentSubSection ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    onClick={() => setCurrentSubSection(null)}
                  >
                    {currentSection.title} Overview
                  </div>
                  {currentSection.subSections.map((subSection) => (
                    <div 
                      key={subSection.id}
                      className={`p-2 rounded-md cursor-pointer ${currentSubSection?.id === subSection.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                      onClick={() => handleSubSectionSelect(subSection)}
                    >
                      {subSection.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Main content area */}
            <div className={`${(currentSection.subSections && currentSection.subSections.length > 0) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {/* Show current subsection if selected, otherwise show main section */}
              {currentSubSection ? (
                <div>
                  <h2 className="text-xl font-bold mb-2">{currentSubSection.title}</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">{currentSubSection.content}</p>
                  </div>
                  
                  {/* Examples for subsection */}
                  {currentSubSection.examples && currentSubSection.examples.length > 0 && (
                    <div className="mt-6 space-y-6">
                      <h3 className="text-lg font-bold">Examples</h3>
                      {currentSubSection.examples.map((example, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-bold mb-2">{example.title}</h4>
                          {renderCode(example.code)}
                          <p className="mt-2 text-gray-700">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-2">{currentSection.title}</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">{currentSection.content}</p>
                  </div>
                  
                  {/* Examples for main section */}
                  {currentSection.examples && currentSection.examples.length > 0 && (
                    <div className="mt-6 space-y-6">
                      <h3 className="text-lg font-bold">Examples</h3>
                      {currentSection.examples.map((example, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-bold mb-2">{example.title}</h4>
                          {renderCode(example.code)}
                          <p className="mt-2 text-gray-700">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Related terms for this section */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">Related Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentLanguage.terms
                    .filter(term => 
                      (currentSubSection && currentSubSection.content.toLowerCase().includes(term.term.toLowerCase())) ||
                      (!currentSubSection && currentSection.content.toLowerCase().includes(term.term.toLowerCase()))
                    )
                    .slice(0, 6)
                    .map(term => (
                      <div
                        key={term.term}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => handleTermSelect(term)}
                      >
                        <div className="flex justify-between">
                          <span className="font-mono font-medium">{term.term}</span>
                          <span className="text-xs text-gray-500">{term.category}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{term.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // If no language selected, show language selection with categorical browsing
    if (!currentLanguage) {
      // Quick browse categories for the home view
      const quickBrowseCategories = [
        { id: 'python-basics', name: 'Python Essentials', language: 'python', categories: ['built-in-functions', 'control-flow'] },
        { id: 'cpp-basics', name: 'C++ Essentials', language: 'cpp', categories: ['io', 'control-flow'] },
        { id: 'arduino-io', name: 'Arduino I/O', language: 'arduino', categories: ['digital-io', 'analog-io'] },
        { id: 'arduino-time', name: 'Arduino Timing', language: 'arduino', categories: ['time'] },
        { id: 'python-data', name: 'Python Data Types', language: 'python', categories: ['data-types', 'list-methods', 'dict-methods'] },
        { id: 'cpp-memory', name: 'C++ Memory Management', language: 'cpp', categories: ['memory'] }
      ];
      
      // Create a language lookup for quick access
      const languageLookup: {[key: string]: ReferenceLanguage} = {};
      LANGUAGES.forEach(lang => {
        languageLookup[lang.id] = lang;
      });
      
      // Get sample terms for quick browsing categories
      const getQuickBrowseSampleTerms = (categoryInfo: { language: string, categories: string[] }, maxCount = 4) => {
        const language = languageLookup[categoryInfo.language];
        if (!language) return [];
        
        const { groupedTerms } = getCategorizedTerms(language);
        let sampleTerms: CodeTerm[] = [];
        
        // Collect terms from all specified categories
        categoryInfo.categories.forEach(categoryId => {
          if (groupedTerms[categoryId]) {
            sampleTerms = [...sampleTerms, ...groupedTerms[categoryId]];
          }
        });
        
        // Return a limited sample
        return sampleTerms.slice(0, maxCount);
      };
      
      return (
        <div className="p-4">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="text-xl font-bold mb-2">Programming Reference Guide</h2>
            <p className="mb-3">Welcome to the interactive programming reference guide! Browse language documentation, look up specific terms, or search for code examples.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <h3 className="font-bold flex items-center text-purple-800">
                  <span className="inline-block w-3 h-3 bg-purple-500 mr-2 rounded-full"></span>
                  Quick Tips
                </h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span> 
                    <span>Search for terms like <code className="text-red-600 bg-gray-100 px-1 rounded">int</code>, <code className="text-red-600 bg-gray-100 px-1 rounded">for</code>, or <code className="text-red-600 bg-gray-100 px-1 rounded">digitalWrite()</code></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span> 
                    <span>Browse by category to discover related terms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span> 
                    <span>Click on any term to see detailed documentation</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <h3 className="font-bold flex items-center text-amber-800">
                  <span className="inline-block w-3 h-3 bg-amber-500 mr-2 rounded-full"></span>
                  Quick Search
                </h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button 
                    onClick={() => {
                      setTermLookup('list');
                      handleTermLookup('list');
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800"
                  >
                    list
                  </button>
                  <button 
                    onClick={() => {
                      setTermLookup('if');
                      handleTermLookup('if');
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800"
                  >
                    if
                  </button>
                  <button 
                    onClick={() => {
                      setTermLookup('function');
                      handleTermLookup('function');
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800"
                  >
                    function
                  </button>
                  <button 
                    onClick={() => {
                      setTermLookup('for');
                      handleTermLookup('for');
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800"
                  >
                    for
                  </button>
                  <button 
                    onClick={() => {
                      setTermLookup('digitalWrite');
                      handleTermLookup('digitalWrite');
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800"
                  >
                    digitalWrite
                  </button>
                  <button 
                    onClick={() => {
                      setTermLookup('class');
                      handleTermLookup('class');
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800"
                  >
                    class
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick browse categories section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Popular Topics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickBrowseCategories.map(category => {
                const sampleTerms = getQuickBrowseSampleTerms(category);
                const language = languageLookup[category.language];
                
                if (!language || sampleTerms.length === 0) return null;
                
                return (
                  <div key={category.id} className={`rounded-lg border p-4 shadow-sm hover:shadow-md ${
                    category.language === 'python' ? 'border-blue-200 bg-blue-50' :
                    category.language === 'cpp' ? 'border-purple-200 bg-purple-50' :
                    'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center mb-3">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        category.language === 'python' ? 'bg-blue-500' :
                        category.language === 'cpp' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`}></span>
                      <h3 className="font-bold text-gray-800">{category.name}</h3>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {sampleTerms.map(term => (
                        <div 
                          key={term.term}
                          onClick={() => handleTermSelect(term)}
                          className="py-1 px-2 rounded hover:bg-white cursor-pointer flex justify-between items-center text-sm"
                        >
                          <span className="font-mono">{term.term}</span>
                          <span className="text-xs text-gray-500">{term.category}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleLanguageSelect(language)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        category.language === 'python' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                        category.language === 'cpp' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                        'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      More {language.name} terms...
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Select a Language</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANGUAGES.map((language) => (
              <div
                key={language.id}
                className={`p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md hover:border-blue-300 transition-all ${
                  language.id === 'python' ? 'bg-blue-50 border-blue-200' :
                  language.id === 'cpp' ? 'bg-purple-50 border-purple-200' :
                  'bg-green-50 border-green-200'
                }`}
                onClick={() => handleLanguageSelect(language)}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-md ${
                    language.id === 'python' ? 'bg-blue-100' :
                    language.id === 'cpp' ? 'bg-purple-100' :
                    'bg-green-100'
                  } mr-3`}>
                    {language.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{language.name}</h3>
                    <p className="text-sm text-gray-600">{language.description}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {language.sections.length} Topics
                  </span>
                  <span className="flex items-center">
                    <Code className="w-4 h-4 mr-1" />
                    {language.terms.length} Terms
                  </span>
                </div>
                
                <div className="mt-3 text-blue-600 text-sm flex justify-end items-center">
                  Browse Reference <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Default empty view (shouldn't normally reach here)
    return <div className="p-4">Select a language to get started.</div>;
  };

  return (
    <div className={`retroWindow ${isActive ? 'active' : ''}`}>
      <div className="windowTitleBar">
        <div className="windowTitle">Code Reference Guide</div>
        <div className="windowControls">
          <button onClick={onMinimize} className="controlButton minimizeButton">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose} className="controlButton closeButton">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="windowContent" style={{ height: 'calc(100% - 28px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top navigation bar with search */}
        <div className="p-2 border-b border-gray-300 bg-gray-100 flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for languages, topics, or code examples..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Filter and history controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`text-sm px-3 py-1 rounded ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                History {showHistory ? '▼' : '▶'}
              </button>
              
              <div className="relative">
                <button 
                  className="text-sm px-3 py-1 rounded flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  <Filter className="w-3 h-3 mr-1" /> Filter: {activeFilter === 'all' ? 'All' : activeFilter}
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              {recentTerms.length > 0 && (
                <button 
                  onClick={() => handleTermSelect(recentTerms[0])}
                  className="text-sm px-3 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                  title={`Go to ${recentTerms[0]?.term}`}
                >
                  Last Term
                </button>
              )}
              <button 
                onClick={() => {
                  setCurrentLanguage(null);
                  setCurrentSection(null);
                  setCurrentSubSection(null);
                  setSelectedTerm(null);
                  setSelectedCategory(null);
                }}
                className="text-sm px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Home
              </button>
            </div>
          </div>
          
          {/* History panel */}
          {showHistory && recentTerms.length > 0 && (
            <div className="mt-2 p-2 bg-indigo-50 rounded-md border border-indigo-200 max-h-32 overflow-y-auto">
              <div className="text-sm font-medium mb-1">Recently Viewed Terms:</div>
              <div className="flex flex-wrap gap-2">
                {recentTerms.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTermSelect(term)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      term.language === 'python' ? 'bg-blue-100 text-blue-800' : 
                      term.language === 'cpp' ? 'bg-purple-100 text-purple-800' : 
                      'bg-green-100 text-green-800'
                    } hover:opacity-80`}
                  >
                    {term.term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Main content area with scrolling */}
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ImprovedCodeReferenceWindow;