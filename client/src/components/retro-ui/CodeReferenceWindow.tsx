import React, { useState, useEffect } from 'react';
import { Code, FileCode, Terminal, Minimize2, X, Search, ExternalLink } from 'lucide-react';

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
  category: 'data-type' | 'function' | 'keyword' | 'operator' | 'directive' | 'class' | 'problem';
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

// Python reference data
const pythonReference: ReferenceLanguage = {
  id: 'python',
  name: 'Python',
  description: 'A high-level, interpreted programming language known for its readability and versatility.',
  icon: <Code className="text-blue-600" />,
  sections: [
    // Python sections data
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
    // More sections would be defined here
  ],
  terms: [
    // Python Built-in Functions
    {
      term: 'print()',
      category: 'function',
      language: 'python',
      description: 'Outputs text or variables to the console.',
      syntax: 'print(value, ..., sep=" ", end="\n", file=sys.stdout, flush=False)',
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
      description: 'Reads a line from the console, converts it to a string, and returns it.',
      syntax: 'input([prompt])',
      examples: [
        'name = input("Enter your name: ")',
        'age = int(input("How old are you? "))'
      ],
      notes: 'Always returns a string. To get numeric input, wrap with int() or float().'
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
      notes: 'Works with strings, lists, tuples, dictionaries, sets, and more.'
    },
    {
      term: 'range()',
      category: 'function',
      language: 'python',
      description: 'Returns a sequence of numbers, starting from 0 by default, and increments by 1, up to a specified end.',
      syntax: 'range(stop) or range(start, stop[, step])',
      examples: [
        'for i in range(5): print(i) # Prints 0, 1, 2, 3, 4',
        'list(range(1, 10, 2)) # Returns [1, 3, 5, 7, 9]'
      ],
      notes: 'Commonly used in for loops. In Python 3, range() returns a range object, not a list.'
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
      notes: 'Useful for debugging and type checking.'
    },
    {
      term: 'int()',
      category: 'function',
      language: 'python',
      description: 'Returns an integer object constructed from a number or string.',
      syntax: 'int(x=0) or int(x, base=10)',
      examples: [
        'int("42") # Returns 42',
        'int(3.14) # Returns 3',
        'int("1010", 2) # Returns 10 (binary to decimal)'
      ],
      notes: 'If no arguments are given, returns 0. The base parameter specifies the number system (e.g., 2 for binary, 16 for hex).'
    },
    {
      term: 'float()',
      category: 'function',
      language: 'python',
      description: 'Returns a floating point number constructed from a number or string.',
      syntax: 'float(x)',
      examples: [
        'float(42) # Returns 42.0',
        'float("3.14") # Returns 3.14'
      ],
      notes: 'If no arguments are given, returns 0.0.'
    },
    {
      term: 'str()',
      category: 'function',
      language: 'python',
      description: 'Returns a string version of an object.',
      syntax: 'str(object="")',
      examples: [
        'str(42) # Returns "42"',
        'str([1, 2, 3]) # Returns "[1, 2, 3]"'
      ],
      notes: 'If no arguments are given, returns empty string. Different from repr().'
    },
    {
      term: 'list()',
      category: 'function',
      language: 'python',
      description: 'Creates a list from an iterable.',
      syntax: 'list([iterable])',
      examples: [
        'list("abc") # Returns [\'a\', \'b\', \'c\']',
        'list(range(3)) # Returns [0, 1, 2]'
      ],
      notes: 'If no arguments are given, returns an empty list.'
    },
    {
      term: 'dict()',
      category: 'function',
      language: 'python',
      description: 'Creates a dictionary from keyword arguments or an iterable of key-value pairs.',
      syntax: 'dict([mapping or iterable][, **kwargs])',
      examples: [
        'dict(a=1, b=2) # Returns {\'a\': 1, \'b\': 2}',
        'dict([(\'a\', 1), (\'b\', 2)]) # Returns {\'a\': 1, \'b\': 2}'
      ],
      notes: 'If no arguments are given, returns an empty dictionary.'
    },
    
    // Python Data Types and Operators
    {
      term: 'list',
      category: 'data-type',
      language: 'python',
      description: 'A mutable sequence of elements.',
      syntax: '[element1, element2, ...]',
      examples: [
        'numbers = [1, 2, 3, 4]',
        'mixed = [1, "hello", True, 3.14]'
      ],
      notes: 'Lists are ordered, mutable, and allow duplicate elements. Accessed by index (0-based).'
    },
    {
      term: 'dict',
      category: 'data-type',
      language: 'python',
      description: 'A collection of key-value pairs.',
      syntax: '{key1: value1, key2: value2, ...}',
      examples: [
        'person = {"name": "Alice", "age": 30, "city": "New York"}',
        'empty_dict = {}'
      ],
      notes: 'Dictionaries are unordered, mutable, and indexed by keys which must be immutable.'
    },
    {
      term: 'tuple',
      category: 'data-type',
      language: 'python',
      description: 'An immutable sequence of elements.',
      syntax: '(element1, element2, ...) or element1, element2, ...',
      examples: [
        'coordinates = (10, 20)',
        'single_element = (42,)'
      ],
      notes: 'Tuples are ordered, immutable, and allow duplicate elements. Often used for fixed collections of data.'
    },
    {
      term: 'set',
      category: 'data-type',
      language: 'python',
      description: 'An unordered collection of unique elements.',
      syntax: '{element1, element2, ...} or set([iterable])',
      examples: [
        'unique_numbers = {1, 2, 3, 3, 2, 1} # Results in {1, 2, 3}',
        'empty_set = set() # Can\'t use {} which creates an empty dict'
      ],
      notes: 'Sets are unordered, mutable, and don\'t allow duplicate elements. Useful for membership testing and eliminating duplicates.'
    },
    {
      term: 'bool',
      category: 'data-type',
      language: 'python',
      description: 'A boolean value representing True or False.',
      syntax: 'True or False',
      examples: [
        'is_active = True',
        'has_permission = False'
      ],
      notes: 'Any object can be tested for truth value. Empty containers, zero values, and None are all considered False.'
    },
    {
      term: 'None',
      category: 'keyword',
      language: 'python',
      description: 'A special constant representing the absence of a value or a null value.',
      syntax: 'None',
      examples: [
        'result = None',
        'if value is None: print("No value")' 
      ],
      notes: 'Use \"is None\" or \"is not None\" for comparison rather than equality operators.'
    },
    {
      term: '+',
      category: 'operator',
      language: 'python',
      description: 'Addition operator or string/sequence concatenation.',
      syntax: 'a + b',
      examples: [
        '3 + 5 # Returns 8',
        '"Hello" + " " + "World" # Returns "Hello World"',
        '[1, 2] + [3, 4] # Returns [1, 2, 3, 4]'
      ],
      notes: 'Behavior depends on the types of the operands.'
    },
    {
      term: 'in',
      category: 'operator',
      language: 'python',
      description: 'Membership operator that tests if a value is in a sequence.',
      syntax: 'x in sequence',
      examples: [
        '"a" in "apple" # Returns True',
        '5 in [1, 2, 3, 4] # Returns False',
        '"name" in {"name": "Alice", "age": 30} # Returns True (checks keys)'
      ],
      notes: 'For dictionaries, checks if the specified key is in the dictionary.'
    },
    
    // Python Control Flow
    {
      term: 'if-elif-else',
      category: 'keyword',
      language: 'python',
      description: 'Conditional execution of code based on boolean expressions.',
      syntax: 'if condition1:\n    # code block\nelif condition2:\n    # code block\nelse:\n    # code block',
      examples: [
        'if x > 0:\n    print("Positive")\nelif x < 0:\n    print("Negative")\nelse:\n    print("Zero")'
      ],
      notes: 'elif and else clauses are optional. Python uses indentation to define blocks of code.'
    },
    {
      term: 'for',
      category: 'keyword',
      language: 'python',
      description: 'Loop for iterating over a sequence.',
      syntax: 'for item in sequence:\n    # code block',
      examples: [
        'for i in range(5):\n    print(i)',
        'for char in "Hello":\n    print(char)',
        'for key, value in dictionary.items():\n    print(key, value)'
      ],
      notes: 'Can be used with break, continue, and else clauses.'
    },
    {
      term: 'while',
      category: 'keyword',
      language: 'python',
      description: 'Loop that executes as long as a condition is true.',
      syntax: 'while condition:\n    # code block',
      examples: [
        'count = 0\nwhile count < 5:\n    print(count)\n    count += 1'
      ],
      notes: 'Can be used with break, continue, and else clauses. Be careful of infinite loops.'
    },
    {
      term: 'break',
      category: 'keyword',
      language: 'python',
      description: 'Terminates the loop containing it.',
      syntax: 'break',
      examples: [
        'for i in range(10):\n    if i == 5:\n        break\n    print(i) # Prints 0, 1, 2, 3, 4'
      ],
      notes: 'Can be used in both for and while loops.'
    },
    {
      term: 'continue',
      category: 'keyword',
      language: 'python',
      description: 'Skips the rest of the code in the current loop iteration and continues with the next iteration.',
      syntax: 'continue',
      examples: [
        'for i in range(10):\n    if i % 2 == 0:\n        continue\n    print(i) # Prints only odd numbers'
      ],
      notes: 'Can be used in both for and while loops.'
    },
    {
      term: 'try-except',
      category: 'keyword',
      language: 'python',
      description: 'Handles exceptions that may occur in a block of code.',
      syntax: 'try:\n    # code that might raise an exception\nexcept ExceptionType:\n    # code that handles the exception',
      examples: [
        'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")'
      ],
      notes: 'Can catch specific exception types or use a generic except clause. Can include else (executes if no exception) and finally (always executes) clauses.'
    },
    {
      term: 'with',
      category: 'keyword',
      language: 'python',
      description: 'Context manager that automatically handles resource acquisition and release.',
      syntax: 'with expression as variable:\n    # code block',
      examples: [
        'with open("file.txt", "r") as file:\n    content = file.read()'
      ],
      notes: 'Ensures resources are properly managed (e.g., files are closed) even if exceptions occur.'
    },
    
    // Python Functions and Classes
    {
      term: 'def',
      category: 'keyword',
      language: 'python',
      description: 'Defines a function.',
      syntax: 'def function_name(parameters):\n    # function body\n    return value',
      examples: [
        'def greet(name):\n    return f"Hello, {name}!"',
        'def add(a, b=0):\n    return a + b'
      ],
      notes: 'Functions can have default parameter values and can return multiple values as a tuple.'
    },
    {
      term: 'lambda',
      category: 'keyword',
      language: 'python',
      description: 'Creates a small anonymous function.',
      syntax: 'lambda parameters: expression',
      examples: [
        'add = lambda x, y: x + y',
        'sorted([5, 2, 3, 1, 4], key=lambda x: x % 2) # Sort by remainder when divided by 2'
      ],
      notes: 'Lambda functions can only contain expressions, not statements. Often used for short-lived or one-time functions.'
    },
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
      term: 'inheritance',
      category: 'concept',
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
      description: 'Used to import modules, attributes, or functions from modules.',
      syntax: 'import module or from module import attribute',
      examples: [
        'import math',
        'from datetime import datetime',
        'from os.path import join, exists'
      ],
      notes: 'Can use \"as\" to create aliases. Importing * from a module is generally discouraged.'
    },
    {
      term: 'from',
      category: 'keyword',
      language: 'python',
      description: 'Used with import to import specific attributes or functions from a module.',
      syntax: 'from module import attribute1, attribute2, ...',
      examples: [
        'from math import pi, sqrt',
        'from os import path'
      ],
      notes: 'Can be combined with \"as\" to create aliases.'
    },
    {
      term: 'as',
      category: 'keyword',
      language: 'python',
      description: 'Creates an alias when importing a module.',
      syntax: 'import module as alias or from module import attribute as alias',
      examples: [
        'import numpy as np',
        'from datetime import datetime as dt'
      ],
      notes: 'Useful for shortening long module or attribute names.'
    },
    
    // Python String Methods
    {
      term: 'str.format()',
      category: 'function',
      language: 'python',
      description: 'Formats a string using placeholders.',
      syntax: 'string.format(value1, value2, ...)',
      examples: [
        '"{} {}".format("Hello", "World") # Returns "Hello World"',
        '"{name} is {age} years old".format(name="Alice", age=30)'
      ],
      notes: 'A versatile way to format strings, though f-strings (since Python 3.6) are often preferred.'
    },
    {
      term: 'f-string',
      category: 'syntax',
      language: 'python',
      description: 'String literal that allows embedding expressions inside curly braces.',
      syntax: 'f"string {expression}"',
      examples: [
        'name = "Alice"\nf"Hello, {name}" # Returns "Hello, Alice"',
        'f"The answer is {2 * 21}"'
      ],
      notes: 'Introduced in Python 3.6. More concise and readable than str.format().'
    },
    {
      term: 'str.split()',
      category: 'function',
      language: 'python',
      description: 'Splits a string into a list of substrings based on a separator.',
      syntax: 'str.split([separator[, maxsplit]])',
      examples: [
        '"Hello World".split() # Returns ["Hello", "World"]',
        '"a,b,c,d".split(",") # Returns ["a", "b", "c", "d"]'
      ],
      notes: 'If separator is not specified, splits on whitespace. maxsplit limits the number of splits.'
    },
    {
      term: 'str.join()',
      category: 'function',
      language: 'python',
      description: 'Joins elements of an iterable with a string.',
      syntax: 'str.join(iterable)',
      examples: [
        '", ".join(["apple", "banana", "cherry"]) # Returns "apple, banana, cherry"',
        '"".join(["a", "b", "c"]) # Returns "abc"'
      ],
      notes: 'The elements of the iterable must be strings. The string on which join() is called is used as the separator.'
    },
    {
      term: 'str.strip()',
      category: 'function',
      language: 'python',
      description: 'Returns a copy of the string with leading and trailing characters removed.',
      syntax: 'str.strip([chars])',
      examples: [
        '" Hello ".strip() # Returns "Hello"',
        '"...abc...".strip(".") # Returns "abc"'
      ],
      notes: 'If chars is not specified, removes whitespace. Also has lstrip() and rstrip() variants for removing only leading or trailing characters.'
    },
    
    // Python List Methods
    {
      term: 'list.append()',
      category: 'function',
      language: 'python',
      description: 'Adds an element to the end of a list.',
      syntax: 'list.append(element)',
      examples: [
        'numbers = [1, 2, 3]\nnumbers.append(4) # numbers becomes [1, 2, 3, 4]'
      ],
      notes: 'Modifies the list in place and returns None.'
    },
    {
      term: 'list.extend()',
      category: 'function',
      language: 'python',
      description: 'Adds all elements of an iterable to the end of a list.',
      syntax: 'list.extend(iterable)',
      examples: [
        'numbers = [1, 2, 3]\nnumbers.extend([4, 5]) # numbers becomes [1, 2, 3, 4, 5]'
      ],
      notes: 'Modifies the list in place and returns None. Different from append(), which would add the iterable as a single element.'
    },
    {
      term: 'list.insert()',
      category: 'function',
      language: 'python',
      description: 'Inserts an element at a specified position in a list.',
      syntax: 'list.insert(index, element)',
      examples: [
        'numbers = [1, 2, 4]\nnumbers.insert(2, 3) # numbers becomes [1, 2, 3, 4]'
      ],
      notes: 'Modifies the list in place and returns None. If index is greater than length, inserts at the end.'
    },
    {
      term: 'list.remove()',
      category: 'function',
      language: 'python',
      description: 'Removes the first occurrence of a value from a list.',
      syntax: 'list.remove(value)',
      examples: [
        'numbers = [1, 2, 3, 2]\nnumbers.remove(2) # numbers becomes [1, 3, 2]'
      ],
      notes: 'Modifies the list in place and returns None. Raises ValueError if the value is not present.'
    },
    {
      term: 'list.pop()',
      category: 'function',
      language: 'python',
      description: 'Removes and returns an element at a specified position in a list.',
      syntax: 'list.pop([index])',
      examples: [
        'numbers = [1, 2, 3, 4]\npopped = numbers.pop(1) # popped = 2, numbers = [1, 3, 4]',
        'last = numbers.pop() # Removes and returns the last element'
      ],
      notes: 'Modifies the list in place. If index is not specified, removes and returns the last item.'
    },
    {
      term: 'list.sort()',
      category: 'function',
      language: 'python',
      description: 'Sorts the elements of a list in place.',
      syntax: 'list.sort(key=None, reverse=False)',
      examples: [
        'numbers = [3, 1, 4, 2]\nnumbers.sort() # numbers becomes [1, 2, 3, 4]',
        'words = ["apple", "banana", "cherry"]\nwords.sort(key=len) # Sort by length'
      ],
      notes: 'Modifies the list in place and returns None. For a new sorted list without modifying the original, use sorted().'
    },
    
    // Python Dictionary Methods
    {
      term: 'dict.get()',
      category: 'function',
      language: 'python',
      description: 'Returns the value for a key, or a default value if the key is not found.',
      syntax: 'dict.get(key[, default])',
      examples: [
        'person = {"name": "Alice", "age": 30}\nperson.get("name") # Returns "Alice"',
        'person.get("city", "Unknown") # Returns "Unknown" since "city" key doesn\'t exist'
      ],
      notes: 'If default is not provided and the key is not found, returns None.'
    },
    {
      term: 'dict.items()',
      category: 'function',
      language: 'python',
      description: 'Returns a view object containing key-value pairs of the dictionary.',
      syntax: 'dict.items()',
      examples: [
        'person = {"name": "Alice", "age": 30}\nfor key, value in person.items():\n    print(key, value)'
      ],
      notes: 'The returned view object reflects changes to the dictionary.'
    },
    {
      term: 'dict.keys()',
      category: 'function',
      language: 'python',
      description: 'Returns a view object containing the keys of the dictionary.',
      syntax: 'dict.keys()',
      examples: [
        'person = {"name": "Alice", "age": 30}\nfor key in person.keys():\n    print(key)'
      ],
      notes: 'The returned view object reflects changes to the dictionary.'
    },
    {
      term: 'dict.values()',
      category: 'function',
      language: 'python',
      description: 'Returns a view object containing the values of the dictionary.',
      syntax: 'dict.values()',
      examples: [
        'person = {"name": "Alice", "age": 30}\nfor value in person.values():\n    print(value)'
      ],
      notes: 'The returned view object reflects changes to the dictionary.'
    },
    {
      term: 'dict.update()',
      category: 'function',
      language: 'python',
      description: 'Updates the dictionary with key-value pairs from another dictionary or iterable.',
      syntax: 'dict.update([other])',
      examples: [
        'person = {"name": "Alice"}\nperson.update({"age": 30, "city": "New York"}) # person now includes the new keys'
      ],
      notes: 'Modifies the dictionary in place and returns None. If a key exists in both dictionaries, the value from the other dictionary overwrites the original.'
    },
    
    // Python File Operations
    {
      term: 'open()',
      category: 'function',
      language: 'python',
      description: 'Opens a file and returns a file object.',
      syntax: 'open(file, mode="r", encoding=None)',
      examples: [
        'file = open("example.txt", "r")',
        'with open("data.csv", "r", encoding="utf-8") as file:\n    content = file.read()'
      ],
      notes: 'Common modes: "r" (read), "w" (write), "a" (append), "b" (binary). Best used with a context manager (with).'
    },
    {
      term: 'file.read()',
      category: 'function',
      language: 'python',
      description: 'Reads content from a file.',
      syntax: 'file.read([size])',
      examples: [
        'with open("example.txt", "r") as file:\n    content = file.read() # Reads entire file',
        'with open("example.txt", "r") as file:\n    chunk = file.read(100) # Reads up to 100 characters'
      ],
      notes: 'If size is omitted, reads the entire file. To read line by line, use file.readline() or iterate over the file object.'
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
      notes: 'Returns the number of characters written. File must be opened in write or append mode.'
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
      notes: 'Best practice is to use a context manager (with) which automatically closes the file.'
    },
    
    // Python Comprehensions
    {
      term: 'list comprehension',
      category: 'syntax',
      language: 'python',
      description: 'A concise way to create lists based on existing iterables.',
      syntax: '[expression for item in iterable if condition]',
      examples: [
        'squares = [x**2 for x in range(10)] # List of squares from 0 to 9',
        'even_squares = [x**2 for x in range(10) if x % 2 == 0] # Squares of even numbers'
      ],
      notes: 'More concise and often faster than using a for loop to create a list. The condition is optional.'
    },
    {
      term: 'dict comprehension',
      category: 'syntax',
      language: 'python',
      description: 'A concise way to create dictionaries based on existing iterables.',
      syntax: '{key_expr: value_expr for item in iterable if condition}',
      examples: [
        'squares = {x: x**2 for x in range(5)} # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}',
        'name_lengths = {name: len(name) for name in ["Alice", "Bob", "Charlie"]}'
      ],
      notes: 'Similar to list comprehensions but creates a dictionary. The condition is optional.'
    },
    {
      term: 'set comprehension',
      category: 'syntax',
      language: 'python',
      description: 'A concise way to create sets based on existing iterables.',
      syntax: '{expression for item in iterable if condition}',
      examples: [
        'unique_squares = {x**2 for x in range(-5, 6)} # Set of unique squares',
        'vowels = {char.lower() for char in "Hello World" if char.lower() in "aeiou"}'
      ],
      notes: 'Similar to list comprehensions but creates a set. The condition is optional.'
    },
    
    // Python Decorators and Generators
    {
      term: 'decorator',
      category: 'concept',
      language: 'python',
      description: 'A function that takes another function and extends its behavior without explicitly modifying it.',
      syntax: '@decorator\ndef function():\n    # function body',
      examples: [
        '@timer\ndef slow_function():\n    # function body\n\n# Equivalent to:\n# slow_function = timer(slow_function)'
      ],
      notes: 'Decorators are applied at definition time. Multiple decorators can be stacked.'
    },
    {
      term: 'generator',
      category: 'concept',
      language: 'python',
      description: 'A function that returns an iterator using the yield statement.',
      syntax: 'def generator_function():\n    yield value',
      examples: [
        'def count_up_to(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\n\nfor number in count_up_to(5):\n    print(number) # Prints 0, 1, 2, 3, 4'
      ],
      notes: 'Generators produce values on-demand, saving memory for large sequences. Use next() to get the next value.'
    },
    {
      term: 'yield',
      category: 'keyword',
      language: 'python',
      description: 'Returns a value from a generator function and pauses its execution.',
      syntax: 'yield expression',
      examples: [
        'def fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b'
      ],
      notes: 'When a generator function is called, it returns a generator object but doesn\'t execute the function body. Execution happens when next() is called.'
    }
  ]
};

// C++ reference data
const cppReference: ReferenceLanguage = {
  id: 'cpp',
  name: 'C++',
  description: 'A powerful, high-performance programming language with direct memory manipulation capabilities.',
  icon: <FileCode className="text-purple-600" />,
  sections: [
    // C++ sections
    {
      id: 'cpp-basics',
      title: 'C++ Basics',
      content: 'C++ is a statically typed, compiled programming language that extends C with object-oriented features. It provides low-level memory manipulation while also supporting high-level abstractions.',
      examples: [
        {
          title: 'Hello World',
          code: '#include <iostream>\n\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}',
          explanation: 'This program outputs "Hello, World!" to the console.'
        }
      ]
    },
    // More sections would be defined here
  ],
  terms: [
    // C++ Standard I/O
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
        'int num; std::cin >> num;',
        'std::string name; std::cin >> name;'
      ],
      notes: 'Part of the <iostream> library. Use with the extraction operator (>>).'
    },
    {
      term: 'cerr',
      category: 'function',
      language: 'cpp',
      description: 'The standard error stream object in C++.',
      syntax: 'std::cerr << error_message;',
      examples: [
        'std::cerr << "Error: File not found!" << std::endl;'
      ],
      notes: 'Used for error output. Not buffered, unlike cout.'
    },
    {
      term: 'endl',
      category: 'function',
      language: 'cpp',
      description: 'Inserts a newline character and flushes the stream.',
      syntax: 'std::cout << std::endl;',
      examples: [
        'std::cout << "Line 1" << std::endl << "Line 2" << std::endl;'
      ],
      notes: 'Equivalent to outputting \'\\n\' and calling flush().'
    },
    
    // C++ Data Types
    {
      term: 'int',
      category: 'data-type',
      language: 'cpp',
      description: 'Integer data type for whole numbers.',
      syntax: 'int variable_name = value;',
      examples: [
        'int count = 42;',
        'int negativeNumber = -10;'
      ],
      notes: 'Typically 4 bytes (32 bits), range approx -2 billion to +2 billion.'
    },
    {
      term: 'double',
      category: 'data-type',
      language: 'cpp',
      description: 'Double-precision floating point number.',
      syntax: 'double variable_name = value;',
      examples: [
        'double pi = 3.14159;',
        'double avogadro = 6.022e23;'
      ],
      notes: 'Typically 8 bytes, more precision than float.'
    },
    {
      term: 'char',
      category: 'data-type',
      language: 'cpp',
      description: 'Character data type for storing a single character.',
      syntax: 'char variable_name = \'value\';',
      examples: [
        'char grade = \'A\';',
        'char newline = \'\\n\';'
      ],
      notes: 'Uses single quotes for character literals. One byte in size.'
    },
    {
      term: 'bool',
      category: 'data-type',
      language: 'cpp',
      description: 'Boolean data type for true/false values.',
      syntax: 'bool variable_name = value;',
      examples: [
        'bool isReady = true;',
        'bool hasError = false;'
      ],
      notes: 'Any non-zero value converts to true, zero converts to false.'
    },
    {
      term: 'string',
      category: 'data-type',
      language: 'cpp',
      description: 'String class for text handling in C++.',
      syntax: 'std::string variable_name = "value";',
      examples: [
        'std::string greeting = "Hello, World!";',
        'std::string name; std::getline(std::cin, name);'
      ],
      notes: 'Requires #include <string>. More convenient than C-style char arrays.'
    },
    {
      term: 'vector',
      category: 'data-type',
      language: 'cpp',
      description: 'Dynamic array container that can resize itself automatically.',
      syntax: 'std::vector<type> variable_name;',
      examples: [
        'std::vector<int> numbers = {1, 2, 3, 4, 5};',
        'numbers.push_back(6); // Add element to end'
      ],
      notes: 'Requires #include <vector>. Part of the Standard Template Library (STL).'
    },
    {
      term: 'array',
      category: 'data-type',
      language: 'cpp',
      description: 'Fixed-size container for sequential elements of same type.',
      syntax: 'std::array<type, size> variable_name;',
      examples: [
        'std::array<int, 5> numbers = {1, 2, 3, 4, 5};',
        'int value = numbers[2]; // Access third element'
      ],
      notes: 'Requires #include <array>. Modern alternative to C-style arrays.'
    },
    
    // C++ Control Structures
    {
      term: 'if',
      category: 'keyword',
      language: 'cpp',
      description: 'Conditional statement that executes code if a condition is true.',
      syntax: 'if (condition) {\n  // code to execute\n}',
      examples: [
        'if (x > 10) {\n  std::cout << "x is greater than 10" << std::endl;\n}'
      ],
      notes: 'Can be followed by else if and else clauses for multiple conditions.'
    },
    {
      term: 'else',
      category: 'keyword',
      language: 'cpp',
      description: 'Executes code when the if condition is false.',
      syntax: 'if (condition) {\n  // code when true\n} else {\n  // code when false\n}',
      examples: [
        'if (age >= 18) {\n  std::cout << "Adult" << std::endl;\n} else {\n  std::cout << "Minor" << std::endl;\n}'
      ],
      notes: 'Always follows an if statement or else if statement.'
    },
    {
      term: 'switch',
      category: 'keyword',
      language: 'cpp',
      description: 'Multi-way branch statement based on a value.',
      syntax: 'switch (expression) {\n  case value1:\n    // code\n    break;\n  case value2:\n    // code\n    break;\n  default:\n    // code\n}',
      examples: [
        'switch (day) {\n  case 1:\n    std::cout << "Monday" << std::endl;\n    break;\n  case 2:\n    std::cout << "Tuesday" << std::endl;\n    break;\n  default:\n    std::cout << "Other day" << std::endl;\n}'
      ],
      notes: 'Break statements prevent fall-through to next case. Default case is optional.'
    },
    {
      term: 'for',
      category: 'keyword',
      language: 'cpp',
      description: 'Loop that repeats code a specified number of times.',
      syntax: 'for (initialization; condition; increment) {\n  // code to repeat\n}',
      examples: [
        'for (int i = 0; i < 10; i++) {\n  std::cout << i << std::endl;\n}'
      ],
      notes: 'The initialization happens once, condition is checked before each iteration, increment after each iteration.'
    },
    {
      term: 'while',
      category: 'keyword',
      language: 'cpp',
      description: 'Loop that repeats code while a condition is true.',
      syntax: 'while (condition) {\n  // code to repeat\n}',
      examples: [
        'int count = 0;\nwhile (count < 5) {\n  std::cout << count << std::endl;\n  count++;\n}'
      ],
      notes: 'The condition is checked before each iteration. If initially false, the loop never executes.'
    },
    {
      term: 'do-while',
      category: 'keyword',
      language: 'cpp',
      description: 'Loop that repeats code while a condition is true, but always executes at least once.',
      syntax: 'do {\n  // code to repeat\n} while (condition);',
      examples: [
        'int count = 0;\ndo {\n  std::cout << count << std::endl;\n  count++;\n} while (count < 5);'
      ],
      notes: 'The condition is checked after each iteration. The loop always executes at least once.'
    },
    {
      term: 'break',
      category: 'keyword',
      language: 'cpp',
      description: 'Exits the current loop or switch statement.',
      syntax: 'break;',
      examples: [
        'for (int i = 0; i < 10; i++) {\n  if (i == 5) {\n    break;\n  }\n  std::cout << i << std::endl;\n}'
      ],
      notes: 'When used in nested loops, break only exits the innermost loop.'
    },
    {
      term: 'continue',
      category: 'keyword',
      language: 'cpp',
      description: 'Skips the rest of the current loop iteration and continues with the next iteration.',
      syntax: 'continue;',
      examples: [
        'for (int i = 0; i < 10; i++) {\n  if (i % 2 == 0) {\n    continue;\n  }\n  std::cout << i << std::endl; // Only prints odd numbers\n}'
      ],
      notes: 'Useful for skipping specific cases without using nested if statements.'
    },
    
    // C++ Functions
    {
      term: 'function',
      category: 'keyword',
      language: 'cpp',
      description: 'A named block of code that performs a specific task.',
      syntax: 'return_type function_name(parameter_type parameter_name) {\n  // function body\n  return value;\n}',
      examples: [
        'int add(int a, int b) {\n  return a + b;\n}',
        'void printMessage() {\n  std::cout << "Hello!" << std::endl;\n}'
      ],
      notes: 'Functions can return values or be void. They can take parameters or none.'
    },
    {
      term: 'return',
      category: 'keyword',
      language: 'cpp',
      description: 'Returns a value from a function and exits the function.',
      syntax: 'return expression;',
      examples: [
        'int square(int x) {\n  return x * x;\n}'
      ],
      notes: 'The return type in the function declaration must match the type of the returned value.'
    },
    {
      term: 'void',
      category: 'keyword',
      language: 'cpp',
      description: 'Indicates that a function does not return a value.',
      syntax: 'void function_name(parameters) {\n  // function body\n}',
      examples: [
        'void printLine() {\n  std::cout << "------------" << std::endl;\n}'
      ],
      notes: 'Void functions can use a return statement without a value to exit early.'
    },
    
    // C++ Operators
    {
      term: 'operators',
      category: 'operator',
      language: 'cpp',
      description: 'Symbols that perform operations on operands.',
      syntax: 'operand1 operator operand2',
      examples: [
        'int sum = a + b; // Addition',
        'bool isEqual = (x == y); // Comparison'
      ],
      notes: 'C++ has arithmetic, relational, logical, bitwise, assignment, and other operators.'
    },
    {
      term: 'new',
      category: 'operator',
      language: 'cpp',
      description: 'Allocates memory dynamically for an object.',
      syntax: 'pointer_type pointer_name = new type;',
      examples: [
        'int* ptr = new int; // Allocate memory for a single integer',
        'int* arr = new int[10]; // Allocate memory for an array of 10 integers'
      ],
      notes: 'Memory allocated with new must be released with delete to prevent memory leaks.'
    },
    {
      term: 'delete',
      category: 'operator',
      language: 'cpp',
      description: 'Deallocates memory that was dynamically allocated with new.',
      syntax: 'delete pointer_name;',
      examples: [
        'delete ptr; // Free memory for a single object',
        'delete[] arr; // Free memory for an array'
      ],
      notes: 'Using delete on a nullptr is safe. Using it on an already deleted pointer causes undefined behavior.'
    },
    
    // C++ Classes and Objects
    {
      term: 'class',
      category: 'keyword',
      language: 'cpp',
      description: 'A blueprint for creating objects, providing initial values for state and implementations of behavior.',
      syntax: 'class ClassName {\nprivate:\n  // private members\npublic:\n  // public members\n};',
      examples: [
        'class Rectangle {\nprivate:\n  int width, height;\npublic:\n  Rectangle(int w, int h) : width(w), height(h) {}\n  int area() { return width * height; }\n};'
      ],
      notes: 'Class members are private by default. Use public: or private: access specifiers to change accessibility.'
    },
    {
      term: 'struct',
      category: 'keyword',
      language: 'cpp',
      description: 'Similar to a class, but members are public by default.',
      syntax: 'struct StructName {\n  // members (public by default)\n};',
      examples: [
        'struct Point {\n  int x, y;\n  Point(int _x, int _y) : x(_x), y(_y) {}\n};'
      ],
      notes: 'In C++, structs can have methods and inheritance just like classes.'
    },
    {
      term: 'constructor',
      category: 'function',
      language: 'cpp',
      description: 'Special method that initializes an object when it is created.',
      syntax: 'ClassName(parameters) {\n  // initialization code\n}',
      examples: [
        'class Circle {\nprivate:\n  double radius;\npublic:\n  Circle(double r) {\n    radius = r;\n  }\n};'
      ],
      notes: 'Constructors have the same name as the class and no return type, not even void.'
    },
    {
      term: 'destructor',
      category: 'function',
      language: 'cpp',
      description: 'Special method that is called when an object is destroyed.',
      syntax: '~ClassName() {\n  // cleanup code\n}',
      examples: [
        'class FileHandler {\nprivate:\n  FILE* file;\npublic:\n  FileHandler(const char* filename) { file = fopen(filename, "r"); }\n  ~FileHandler() { if(file) fclose(file); }\n};'
      ],
      notes: 'Destructors have the class name prefixed with a tilde (~) and take no parameters.'
    },
    {
      term: 'inheritance',
      category: 'keyword',
      language: 'cpp',
      description: 'Mechanism where a new class inherits properties and behaviors from an existing class.',
      syntax: 'class DerivedClass : [access_specifier] BaseClass {\n  // class members\n};',
      examples: [
        'class Animal {\npublic:\n  void eat() { std::cout << "Eating..."; }\n};\n\nclass Dog : public Animal {\npublic:\n  void bark() { std::cout << "Barking..."; }\n};'
      ],
      notes: 'Access specifiers for inheritance: public, protected, or private. Public is most common.'
    },
    {
      term: 'virtual',
      category: 'keyword',
      language: 'cpp',
      description: 'Specifies that a function can be overridden in derived classes.',
      syntax: 'virtual return_type function_name(parameters);',
      examples: [
        'class Shape {\npublic:\n  virtual double area() { return 0; }\n};\n\nclass Circle : public Shape {\npublic:\n  double radius;\n  Circle(double r) : radius(r) {}\n  double area() override { return 3.14159 * radius * radius; }\n};'
      ],
      notes: 'Virtual functions enable polymorphism in C++. Use \'override\' keyword in derived classes for clarity.'
    },
    
    // C++ Memory Management
    {
      term: 'pointer',
      category: 'data-type',
      language: 'cpp',
      description: 'Variable that stores a memory address.',
      syntax: 'type* pointer_name = &variable; or type* pointer_name = new type;',
      examples: [
        'int num = 10;\nint* ptr = &num; // ptr holds the address of num',
        'int* dynamicInt = new int(42); // Dynamically allocated integer'
      ],
      notes: 'Access the value at the address using dereference operator (*). Always initialize pointers or set to nullptr.'
    },
    {
      term: 'reference',
      category: 'data-type',
      language: 'cpp',
      description: 'An alias for an existing variable.',
      syntax: 'type& reference_name = existing_variable;',
      examples: [
        'int num = 10;\nint& ref = num; // ref is an alias for num\nref = 20; // changes value of num to 20'
      ],
      notes: 'References must be initialized when declared and cannot be reassigned to refer to another variable.'
    },
    {
      term: 'nullptr',
      category: 'keyword',
      language: 'cpp',
      description: 'A literal representing a null pointer (introduced in C++11).',
      syntax: 'pointer_name = nullptr;',
      examples: [
        'int* ptr = nullptr; // Initialize pointer with null value',
        'if (ptr == nullptr) { // Check if pointer is null\n  // Handle null case\n}'
      ],
      notes: 'Safer than using 0 or NULL for null pointers. Should be used to initialize pointers that don\'t yet point to valid memory.'
    },
    {
      term: 'smart_pointers',
      category: 'data-type',
      language: 'cpp',
      description: 'Objects that act like pointers but provide automatic memory management.',
      syntax: 'std::unique_ptr<type> ptr = std::make_unique<type>(args);\nstd::shared_ptr<type> ptr = std::make_shared<type>(args);',
      examples: [
        'std::unique_ptr<int> ptr = std::make_unique<int>(42); // C++14',
        'std::shared_ptr<MyClass> ptr = std::make_shared<MyClass>("Hello");'
      ],
      notes: 'Requires #include <memory>. unique_ptr for exclusive ownership, shared_ptr for shared ownership.'
    },
    
    // C++ Standard Library
    {
      term: 'iostream',
      category: 'directive',
      language: 'cpp',
      description: 'Header that provides input/output stream functionality.',
      syntax: '#include <iostream>',
      examples: [
        '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}'
      ],
      notes: 'Defines cin, cout, cerr, and clog stream objects for standard input/output operations.'
    },
    {
      term: 'string',
      category: 'directive',
      language: 'cpp',
      description: 'Header that provides the string class for text manipulation.',
      syntax: '#include <string>',
      examples: [
        '#include <string>\nstd::string greeting = "Hello, World!";\nsize_t length = greeting.length();'
      ],
      notes: 'Provides string class with methods for concatenation, comparison, finding, and substring operations.'
    },
    {
      term: 'vector',
      category: 'directive',
      language: 'cpp',
      description: 'Header that provides the vector container (dynamic array).',
      syntax: '#include <vector>',
      examples: [
        '#include <vector>\nstd::vector<int> numbers = {1, 2, 3};\nnumbers.push_back(4);\nint size = numbers.size();'
      ],
      notes: 'Vector provides dynamic array functionality with automatic memory management.'
    },
    {
      term: 'algorithm',
      category: 'directive',
      language: 'cpp',
      description: 'Header that provides algorithms for working with containers and sequences.',
      syntax: '#include <algorithm>',
      examples: [
        '#include <algorithm>\nstd::sort(vec.begin(), vec.end()); // Sort a vector',
        'auto it = std::find(vec.begin(), vec.end(), 42); // Find an element'
      ],
      notes: 'Provides functions for searching, sorting, counting, manipulating, and more on ranges of elements.'
    },
    
    // C++ Error Handling
    {
      term: 'try-catch',
      category: 'keyword',
      language: 'cpp',
      description: 'Block structure for handling exceptions.',
      syntax: 'try {\n  // code that might throw exceptions\n} catch (exception_type& e) {\n  // code to handle the exception\n}',
      examples: [
        'try {\n  int* arr = new int[1000000000]; // Might throw std::bad_alloc\n} catch (const std::bad_alloc& e) {\n  std::cerr << "Memory allocation failed: " << e.what() << std::endl;\n}'
      ],
      notes: 'Multiple catch blocks can handle different exception types. Use catch(...) to catch all exceptions.'
    },
    {
      term: 'throw',
      category: 'keyword',
      language: 'cpp',
      description: 'Throws an exception when a problem occurs.',
      syntax: 'throw exception_object;',
      examples: [
        'if (denominator == 0) {\n  throw std::runtime_error("Division by zero");\n}',
        'throw MyCustomException("Something went wrong");'
      ],
      notes: 'Can throw objects of any type, but standard practice is to throw objects derived from std::exception.'
    },
    {
      term: 'exception',
      category: 'class',
      language: 'cpp',
      description: 'Base class for all standard exceptions in C++.',
      syntax: '#include <exception>',
      examples: [
        'class MyException : public std::exception {\npublic:\n  const char* what() const noexcept override {\n    return "My custom exception";\n  }\n};'
      ],
      notes: 'Custom exceptions should inherit from std::exception and override the what() method.'
    }
  ]
};

// Arduino/Wiring reference data
const wiringReference: ReferenceLanguage = {
  id: 'wiring',
  name: 'Arduino/Wiring',
  description: 'A C++-based language designed for programming microcontrollers, especially Arduino boards.',
  icon: <Terminal className="text-green-600" />,
  sections: [
    // Arduino/Wiring sections
    {
      id: 'arduino-basics',
      title: 'Arduino Basics',
      content: 'Arduino programming is based on C++ but includes specific functions and libraries for interfacing with Arduino hardware. Every Arduino program (sketch) must include setup() and loop() functions.',
      examples: [
        {
          title: 'Blink LED',
          code: 'void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}',
          explanation: 'This program blinks an LED connected to pin 13 at a 1-second interval.'
        }
      ]
    },
    // More sections would be defined here
  ],
  terms: [
    // Digital I/O
    {
      term: 'digitalRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads the value from a specified digital pin, either HIGH or LOW.',
      syntax: 'digitalRead(pin)',
      examples: [
        'int buttonState = digitalRead(7); // Read the state of pin 7',
        'if (digitalRead(sensorPin) == HIGH) { // Check if sensor is active }'
      ],
      notes: 'The pin should be configured as INPUT or INPUT_PULLUP before using digitalRead().'
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
      notes: 'The pin must be configured as OUTPUT using pinMode() first.'
    },
    {
      term: 'pinMode()',
      category: 'function',
      language: 'arduino',
      description: 'Configures the specified pin to behave either as an INPUT, INPUT_PULLUP, or OUTPUT.',
      syntax: 'pinMode(pin, mode)',
      examples: [
        'pinMode(13, OUTPUT); // Set pin 13 as an output',
        'pinMode(7, INPUT); // Set pin 7 as an input',
        'pinMode(2, INPUT_PULLUP); // Set pin 2 as an input with pull-up resistor activated'
      ],
      notes: 'INPUT_PULLUP enables the internal pull-up resistor, eliminating the need for an external pull-up resistor.'
    },
    
    // Analog I/O
    {
      term: 'analogRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads the value from the specified analog pin with a 10-bit resolution.',
      syntax: 'analogRead(pin)',
      examples: [
        'int sensorValue = analogRead(A0); // Read analog pin A0',
        'float voltage = analogRead(A5) * (5.0 / 1023.0); // Convert reading to voltage'
      ],
      notes: 'Returns a value between 0 (0V) and 1023 (5V) by default. The analog pins do not need to be declared as inputs with pinMode().'
    },
    {
      term: 'analogReadResolution()',
      category: 'function',
      language: 'arduino',
      description: 'Sets the resolution of analogRead() return values.',
      syntax: 'analogReadResolution(bits)',
      examples: [
        'analogReadResolution(12); // Set analog reading resolution to 12 bits'
      ],
      notes: 'Only available on select boards like Arduino Due, Zero, and MKR. The default is 10 bits.'
    },
    {
      term: 'analogReference()',
      category: 'function',
      language: 'arduino',
      description: 'Configures the reference voltage used for analog input.',
      syntax: 'analogReference(type)',
      examples: [
        'analogReference(EXTERNAL); // Use voltage on AREF pin as reference'
      ],
      notes: 'Reference types vary between boards. Common types are DEFAULT, INTERNAL, EXTERNAL.'
    },
    {
      term: 'analogWrite()',
      category: 'function',
      language: 'arduino',
      description: 'Writes a PWM (analog) value to a pin.',
      syntax: 'analogWrite(pin, value)',
      examples: [
        'analogWrite(9, 128); // Set LED to half brightness',
        'analogWrite(3, 255); // Set LED to maximum brightness'
      ],
      notes: 'PWM can only be used on pins marked with ~ on most Arduino boards. The value range is 0-255.'
    },
    {
      term: 'analogWriteResolution()',
      category: 'function',
      language: 'arduino',
      description: 'Sets the resolution of analogWrite() values.',
      syntax: 'analogWriteResolution(bits)',
      examples: [
        'analogWriteResolution(12); // Set DAC resolution to 12 bits'
      ],
      notes: 'Only available on select boards like Arduino Due, Zero, and MKR. The default is 8 bits.'
    },
    
    // Math Functions
    {
      term: 'abs()',
      category: 'function',
      language: 'arduino',
      description: 'Computes the absolute value of a number.',
      syntax: 'abs(x)',
      examples: [
        'int absoluteValue = abs(-5); // Returns 5'
      ],
      notes: 'Works with integers, longs, floats, and doubles.'
    },
    {
      term: 'constrain()',
      category: 'function',
      language: 'arduino',
      description: 'Constrains a number to be within a specified range.',
      syntax: 'constrain(x, a, b)',
      examples: [
        'int constrainedValue = constrain(sensorValue, 0, 255); // Ensures value is between 0 and 255'
      ],
      notes: 'Useful for ensuring a variable stays within a valid range.'
    },
    {
      term: 'map()',
      category: 'function',
      language: 'arduino',
      description: 'Re-maps a number from one range to another.',
      syntax: 'map(value, fromLow, fromHigh, toLow, toHigh)',
      examples: [
        'int mappedValue = map(analogRead(A0), 0, 1023, 0, 255); // Map sensor reading to LED brightness'
      ],
      notes: 'Useful for converting sensor readings to output ranges. Works only with integer math.'
    },
    {
      term: 'max()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the larger of two numbers.',
      syntax: 'max(x, y)',
      examples: [
        'int maximum = max(sensorValue, threshold); // Get the larger of the two values'
      ],
      notes: 'Works with any data type that supports the > operator.'
    },
    {
      term: 'min()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the smaller of two numbers.',
      syntax: 'min(x, y)',
      examples: [
        'int minimum = min(sensorValue, maxLimit); // Get the smaller of the two values'
      ],
      notes: 'Works with any data type that supports the < operator.'
    },
    {
      term: 'pow()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the value of a number raised to a power.',
      syntax: 'pow(base, exponent)',
      examples: [
        'double squared = pow(2.0, 2.0); // Returns 4.0',
        'double cubed = pow(3.0, 3.0); // Returns 27.0'
      ],
      notes: 'Returns a double. Requires the math.h library which is included by default.'
    },
    {
      term: 'sq()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the square of a number.',
      syntax: 'sq(x)',
      examples: [
        'int squared = sq(5); // Returns 25'
      ],
      notes: 'More efficient than using pow() for simple squaring operations.'
    },
    {
      term: 'sqrt()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the square root of a number.',
      syntax: 'sqrt(x)',
      examples: [
        'double root = sqrt(25.0); // Returns 5.0'
      ],
      notes: 'Returns a double. Requires the math.h library which is included by default.'
    },
    
    // Trigonometry Functions
    {
      term: 'cos()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the cosine of an angle (in radians).',
      syntax: 'cos(rad)',
      examples: [
        'double cosValue = cos(PI); // Returns -1.0'
      ],
      notes: 'Returns the cosine of an angle, value ranges from -1 to 1.'
    },
    {
      term: 'sin()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the sine of an angle (in radians).',
      syntax: 'sin(rad)',
      examples: [
        'double sinValue = sin(PI/2); // Returns 1.0'
      ],
      notes: 'Returns the sine of an angle, value ranges from -1 to 1.'
    },
    {
      term: 'tan()',
      category: 'function',
      language: 'arduino',
      description: 'Calculates the tangent of an angle (in radians).',
      syntax: 'tan(rad)',
      examples: [
        'double tanValue = tan(PI/4); // Returns approximately 1.0'
      ],
      notes: 'Returns the tangent of an angle.'
    },
    
    // Bits and Bytes Functions
    {
      term: 'bit()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the value of the specified bit (bit position).',
      syntax: 'bit(n)',
      examples: [
        'byte b = bit(3); // Sets b to 8 (binary 00001000)'
      ],
      notes: 'Computes 2^n. Useful for creating bit masks.'
    },
    {
      term: 'bitClear()',
      category: 'function',
      language: 'arduino',
      description: 'Clears (sets to 0) a bit of a numeric variable.',
      syntax: 'bitClear(x, n)',
      examples: [
        'byte b = 0x0F; // binary: 00001111\nbitClear(b, 2); // b becomes 0x0B (binary: 00001011)'
      ],
      notes: 'Modifies the original value directly.'
    },
    {
      term: 'bitRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads a bit of a numeric variable.',
      syntax: 'bitRead(x, n)',
      examples: [
        'byte b = 0x0F; // binary: 00001111\nint i = bitRead(b, 2); // i equals 1'
      ],
      notes: 'Returns the value of the bit (0 or 1).'
    },
    {
      term: 'bitSet()',
      category: 'function',
      language: 'arduino',
      description: 'Sets (sets to 1) a bit of a numeric variable.',
      syntax: 'bitSet(x, n)',
      examples: [
        'byte b = 0x0A; // binary: 00001010\nbitSet(b, 0); // b becomes 0x0B (binary: 00001011)'
      ],
      notes: 'Modifies the original value directly.'
    },
    {
      term: 'bitWrite()',
      category: 'function',
      language: 'arduino',
      description: 'Writes a bit of a numeric variable.',
      syntax: 'bitWrite(x, n, b)',
      examples: [
        'byte b = 0x0A; // binary: 00001010\nbitWrite(b, 0, 1); // b becomes 0x0B (binary: 00001011)'
      ],
      notes: 'Modifies the original value directly. The bit value b should be 0 or 1.'
    },
    {
      term: 'highByte()',
      category: 'function',
      language: 'arduino',
      description: 'Extracts the high-order (leftmost) byte of a word or larger data type.',
      syntax: 'highByte(x)',
      examples: [
        'int x = 0x1234; // decimal: 4660\nbyte h = highByte(x); // h equals 0x12'
      ],
      notes: 'Useful for serial communication and data protocols.'
    },
    {
      term: 'lowByte()',
      category: 'function',
      language: 'arduino',
      description: 'Extracts the low-order (rightmost) byte of a word or larger data type.',
      syntax: 'lowByte(x)',
      examples: [
        'int x = 0x1234; // decimal: 4660\nbyte l = lowByte(x); // l equals 0x34'
      ],
      notes: 'Useful for serial communication and data protocols.'
    },
    
    // External Interrupts
    {
      term: 'attachInterrupt()',
      category: 'function',
      language: 'arduino',
      description: 'Attaches an interrupt service routine (ISR) to a specified pin.',
      syntax: 'attachInterrupt(digitalPinToInterrupt(pin), ISR, mode)',
      examples: [
        'attachInterrupt(digitalPinToInterrupt(2), handleInterrupt, RISING); // Call handleInterrupt when pin 2 goes from LOW to HIGH'
      ],
      notes: 'Valid modes are LOW, CHANGE, RISING, FALLING. Only certain pins support interrupts; these vary by board.'
    },
    {
      term: 'detachInterrupt()',
      category: 'function',
      language: 'arduino',
      description: 'Disables the interrupt for the specified pin.',
      syntax: 'detachInterrupt(digitalPinToInterrupt(pin))',
      examples: [
        'detachInterrupt(digitalPinToInterrupt(2)); // Disable interrupt on pin 2'
      ],
      notes: 'Useful when you temporarily want to disable an interrupt while performing sensitive operations.'
    },
    {
      term: 'digitalPinToInterrupt()',
      category: 'function',
      language: 'arduino',
      description: 'Maps a digital pin to its corresponding interrupt number.',
      syntax: 'digitalPinToInterrupt(pin)',
      examples: [
        'attachInterrupt(digitalPinToInterrupt(2), myISR, FALLING);'
      ],
      notes: 'Ensures cross-platform compatibility when using interrupts.'
    },
    
    // Advanced I/O
    {
      term: 'noTone()',
      category: 'function',
      language: 'arduino',
      description: 'Stops the generation of a square wave triggered by tone().',
      syntax: 'noTone(pin)',
      examples: [
        'noTone(8); // Stop tone on pin 8'
      ],
      notes: 'Use this to stop playing a tone or to allow the pin to be used for regular output.'
    },
    {
      term: 'pulseIn()',
      category: 'function',
      language: 'arduino',
      description: 'Reads a pulse (either HIGH or LOW) on a pin.',
      syntax: 'pulseIn(pin, value, timeout)',
      examples: [
        'long duration = pulseIn(7, HIGH); // Measure the duration of a HIGH pulse on pin 7'
      ],
      notes: 'Returns the pulse length in microseconds, or 0 if no pulse started before the timeout.'
    },
    {
      term: 'pulseInLong()',
      category: 'function',
      language: 'arduino',
      description: 'Similar to pulseIn() but with better handling of long pulses.',
      syntax: 'pulseInLong(pin, value, timeout)',
      examples: [
        'long duration = pulseInLong(7, HIGH, 1000000); // Measure a pulse with a 1 second timeout'
      ],
      notes: 'More reliable than pulseIn() for measuring longer pulses, but has more overhead.'
    },
    {
      term: 'shiftIn()',
      category: 'function',
      language: 'arduino',
      description: 'Shifts in a byte of data one bit at a time from a data pin.',
      syntax: 'shiftIn(dataPin, clockPin, bitOrder)',
      examples: [
        'byte myByte = shiftIn(dataPin, clockPin, MSBFIRST); // Read a byte MSB first'
      ],
      notes: 'Used for synchronous serial communication with shift registers and other devices.'
    },
    {
      term: 'shiftOut()',
      category: 'function',
      language: 'arduino',
      description: 'Shifts out a byte of data one bit at a time to a data pin.',
      syntax: 'shiftOut(dataPin, clockPin, bitOrder, value)',
      examples: [
        'shiftOut(dataPin, clockPin, MSBFIRST, 0x55); // Send the byte 0x55 MSB first'
      ],
      notes: 'Used for synchronous serial communication with shift registers and other devices.'
    },
    {
      term: 'tone()',
      category: 'function',
      language: 'arduino',
      description: 'Generates a square wave of the specified frequency on a pin.',
      syntax: 'tone(pin, frequency, duration)',
      examples: [
        'tone(8, 440, 1000); // Play a 440Hz tone on pin 8 for 1 second'
      ],
      notes: 'Duration is optional. If not specified, the wave continues until noTone() is called.'
    },
    
    // Time Functions
    {
      term: 'delay()',
      category: 'function',
      language: 'arduino',
      description: 'Pauses the program for the specified amount of milliseconds.',
      syntax: 'delay(ms)',
      examples: [
        'delay(1000); // Pauses for 1 second'
      ],
      notes: 'Blocks all program execution during the delay. For non-blocking operations, consider using millis().'
    },
    {
      term: 'delayMicroseconds()',
      category: 'function',
      language: 'arduino',
      description: 'Pauses the program for the specified amount of microseconds.',
      syntax: 'delayMicroseconds(us)',
      examples: [
        'delayMicroseconds(50); // Pauses for 50 microseconds'
      ],
      notes: 'More precise for very short delays than delay().'
    },
    {
      term: 'micros()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the number of microseconds since the Arduino board began running the current program.',
      syntax: 'micros()',
      examples: [
        'unsigned long startTime = micros();\n// Code to time\nunsigned long elapsedTime = micros() - startTime;'
      ],
      notes: 'Overflows and resets to zero after approximately 70 minutes on 16MHz Arduino boards.'
    },
    {
      term: 'millis()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the number of milliseconds since the Arduino board began running the current program.',
      syntax: 'millis()',
      examples: [
        'unsigned long startTime = millis();\n// ... some time later\nunsigned long elapsedTime = millis() - startTime;'
      ],
      notes: 'Overflows and resets to zero after approximately 50 days.'
    },
    
    // Random Numbers
    {
      term: 'random()',
      category: 'function',
      language: 'arduino',
      description: 'Generates pseudo-random numbers.',
      syntax: 'random(max) or random(min, max)',
      examples: [
        'int randomNumber = random(100); // Random number from 0 to 99',
        'int randomInRange = random(10, 20); // Random number from 10 to 19'
      ],
      notes: 'The upper bound is exclusive. For more truly random numbers, use randomSeed() with an unconnected analog pin first.'
    },
    {
      term: 'randomSeed()',
      category: 'function',
      language: 'arduino',
      description: 'Initializes the pseudo-random number generator.',
      syntax: 'randomSeed(seed)',
      examples: [
        'randomSeed(analogRead(0)); // Use noise from an unconnected analog pin as seed'
      ],
      notes: 'Using the same seed will produce the same sequence of random numbers.'
    },
    
    // Character Functions
    {
      term: 'isAlpha()',
      category: 'function',
      language: 'arduino',
      description: 'Checks if a character is a letter.',
      syntax: 'isAlpha(c)',
      examples: [
        'if (isAlpha(myChar)) { /* do something */ }'
      ],
      notes: 'Returns non-zero if the character is a letter, otherwise zero.'
    },
    {
      term: 'isAlphaNumeric()',
      category: 'function',
      language: 'arduino',
      description: 'Checks if a character is a letter or a number.',
      syntax: 'isAlphaNumeric(c)',
      examples: [
        'if (isAlphaNumeric(myChar)) { /* do something */ }'
      ],
      notes: 'Returns non-zero if the character is a letter or a number, otherwise zero.'
    },
    {
      term: 'isDigit()',
      category: 'function',
      language: 'arduino',
      description: 'Checks if a character is a number.',
      syntax: 'isDigit(c)',
      examples: [
        'if (isDigit(myChar)) { /* do something */ }'
      ],
      notes: 'Returns non-zero if the character is a number (0-9), otherwise zero.'
    },
    {
      term: 'isLowerCase()',
      category: 'function',
      language: 'arduino',
      description: 'Checks if a character is a lowercase letter.',
      syntax: 'isLowerCase(c)',
      examples: [
        'if (isLowerCase(myChar)) { /* do something */ }'
      ],
      notes: 'Returns non-zero if the character is a lowercase letter, otherwise zero.'
    },
    {
      term: 'isUpperCase()',
      category: 'function',
      language: 'arduino',
      description: 'Checks if a character is an uppercase letter.',
      syntax: 'isUpperCase(c)',
      examples: [
        'if (isUpperCase(myChar)) { /* do something */ }'
      ],
      notes: 'Returns non-zero if the character is an uppercase letter, otherwise zero.'
    },
    
    // Interrupts
    {
      term: 'interrupts()',
      category: 'function',
      language: 'arduino',
      description: 'Re-enables interrupts after they have been disabled by noInterrupts().',
      syntax: 'interrupts()',
      examples: [
        'noInterrupts(); // Critical section begins\n// code with interrupts disabled\ninterrupts(); // Critical section ends'
      ],
      notes: 'Use in pairs with noInterrupts() to protect critical sections of code.'
    },
    {
      term: 'noInterrupts()',
      category: 'function',
      language: 'arduino',
      description: 'Disables interrupts.',
      syntax: 'noInterrupts()',
      examples: [
        'noInterrupts(); // Critical section begins\n// code with interrupts disabled\ninterrupts(); // Critical section ends'
      ],
      notes: 'Useful to ensure that a section of code runs uninterrupted. Always keep the critical section as short as possible.'
    },
    
    // Constants
    {
      term: 'HIGH | LOW',
      category: 'keyword',
      language: 'arduino',
      description: 'Constants representing digital pin states.',
      syntax: 'HIGH or LOW',
      examples: [
        'digitalWrite(13, HIGH); // Set pin 13 to HIGH voltage level',
        'if (digitalRead(7) == LOW) { /* do something */ }'
      ],
      notes: 'HIGH represents voltage level of 3.3 or 5V, LOW represents 0V or ground.'
    },
    {
      term: 'INPUT | INPUT_PULLUP | OUTPUT',
      category: 'keyword',
      language: 'arduino',
      description: 'Constants defining pin modes.',
      syntax: 'INPUT, INPUT_PULLUP, or OUTPUT',
      examples: [
        'pinMode(13, OUTPUT); // Configure pin 13 as an output',
        'pinMode(7, INPUT); // Configure pin 7 as an input',
        'pinMode(2, INPUT_PULLUP); // Configure pin 2 as an input with internal pull-up resistor'
      ],
      notes: 'INPUT_PULLUP enables the internal pull-up resistor, eliminating the need for an external pull-up resistor.'
    },
    {
      term: 'true | false',
      category: 'keyword',
      language: 'arduino',
      description: 'Boolean constants representing truth values.',
      syntax: 'true or false',
      examples: [
        'boolean isRunning = true;',
        'if (flag == false) { /* do something */ }'
      ],
      notes: 'In C++, non-zero values are considered true, and zero is considered false.'
    },
    
    // Data Types
    {
      term: 'int',
      category: 'data-type',
      language: 'arduino',
      description: 'Integer data type for whole numbers.',
      syntax: 'int variable_name = value;',
      examples: [
        'int counter = 0;',
        'int temperature = -10;'
      ],
      notes: 'On most Arduino boards, int is a 16-bit value with a range of -32,768 to 32,767.'
    },
    {
      term: 'long',
      category: 'data-type',
      language: 'arduino',
      description: 'Extended size integer for large whole numbers.',
      syntax: 'long variable_name = value;',
      examples: [
        'long distance = 1000000L;'
      ],
      notes: '32-bit value with a range of -2,147,483,648 to 2,147,483,647.'
    },
    {
      term: 'float',
      category: 'data-type',
      language: 'arduino',
      description: 'Data type for floating-point numbers with decimal points.',
      syntax: 'float variable_name = value;',
      examples: [
        'float pi = 3.14159;',
        'float temperature = 22.5;'
      ],
      notes: '32-bit value with about 6-7 digits of precision.'
    },
    {
      term: 'boolean',
      category: 'data-type',
      language: 'arduino',
      description: 'Boolean data type for true/false values.',
      syntax: 'boolean variable_name = value;',
      examples: [
        'boolean isOn = true;',
        'boolean hasError = false;'
      ],
      notes: 'Uses 1 byte of memory, even though it only needs 1 bit.'
    },
    {
      term: 'byte',
      category: 'data-type',
      language: 'arduino',
      description: 'Byte data type for storing 8-bit unsigned values.',
      syntax: 'byte variable_name = value;',
      examples: [
        'byte counter = 0;',
        'byte data = 255;'
      ],
      notes: 'Range is 0 to 255.'
    },
    {
      term: 'String',
      category: 'data-type',
      language: 'arduino',
      description: 'Object for storing and manipulating text.',
      syntax: 'String variable_name = "text";',
      examples: [
        'String message = "Hello";',
        'String fullMessage = message + " World";'
      ],
      notes: 'More memory-intensive than character arrays but easier to manipulate.'
    },
    
    // Control Structure
    {
      term: 'loop()',
      category: 'function',
      language: 'arduino',
      description: 'The main loop function that runs repeatedly after setup.',
      syntax: 'void loop() {\n  // code to run repeatedly\n}',
      examples: [
        'void loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  delay(1000);\n}'
      ],
      notes: 'Required in every Arduino sketch. Executes repeatedly until the board is powered off or reset.'
    },
    {
      term: 'setup()',
      category: 'function',
      language: 'arduino',
      description: 'Function that runs once when the sketch starts.',
      syntax: 'void setup() {\n  // initialization code\n}',
      examples: [
        'void setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}'
      ],
      notes: 'Required in every Arduino sketch. Used for initializing variables, pin modes, libraries, etc.'
    },
    
    // Communication Interfaces
    {
      term: 'Serial',
      category: 'class',
      language: 'arduino',
      description: 'Serial communication interface for communicating with external devices or the computer.',
      syntax: 'Serial.function()',
      examples: [
        'Serial.begin(9600); // Initialize serial communication',
        'Serial.println("Hello World"); // Send data'
      ],
      notes: 'Common functions: begin(), print(), println(), available(), read(), write().'
    },
    {
      term: 'SPI',
      category: 'class',
      language: 'arduino',
      description: 'Serial Peripheral Interface communication for high-speed, synchronous data transfer.',
      syntax: 'SPI.function()',
      examples: [
        '#include <SPI.h>\nSPI.begin();',
        'SPI.transfer(0x55); // Send a byte over SPI'
      ],
      notes: 'Used for communicating with sensors, SD cards, displays, and other SPI devices.'
    },
    {
      term: 'Wire',
      category: 'class',
      language: 'arduino',
      description: 'I²C (Two-Wire Interface) communication library.',
      syntax: 'Wire.function()',
      examples: [
        '#include <Wire.h>\nWire.begin(); // Initialize as master',
        'Wire.beginTransmission(8); // Address 8\nWire.write(data); // Send data\nWire.endTransmission();'
      ],
      notes: 'Used for communicating with various I²C devices like displays, sensors, and other microcontrollers.'
    }
  ]
};

// All languages in one array
const LANGUAGES: ReferenceLanguage[] = [pythonReference, cppReference, wiringReference];

const CodeReferenceWindow = ({ onClose, onMinimize, isActive }: CodeReferenceWindowProps): React.ReactNode => {
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
  
  // Language selection handler
  const handleLanguageSelect = (language: ReferenceLanguage) => {
    setCurrentLanguage(language);
    setCurrentSection(null);
    setCurrentSubSection(null);
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
                type: 'subexample',
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
            term.syntax.toLowerCase().includes(searchTerm.toLowerCase())) {
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
  
  // Helper for rendering code blocks with syntax highlighting
  const renderCode = (code: string) => {
    return (
      <div className="relative group">
        <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
          <code>{code}</code>
        </pre>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white p-1 rounded hover:bg-gray-600 transition-opacity"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        </button>
      </div>
    );
  };
  
  // Render search results view
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setIsSearching(false);
              }}
              className="mt-3 text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Search Results for "{searchTerm}"</h2>
          <button 
            onClick={() => {
              setSearchTerm("");
              setIsSearching(false);
            }}
            className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear search
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Group results by type */}
          {['language', 'section', 'subsection', 'example', 'subexample', 'term'].map(type => {
            const typeResults = searchResults.filter(result => result.type === type);
            if (typeResults.length === 0) return null;
            
            return (
              <div key={type} className="mb-4">
                <h3 className="text-lg font-bold mb-2">
                  {type === 'language' ? 'Languages' :
                   type === 'section' ? 'Sections' :
                   type === 'subsection' ? 'Subsections' :
                   type === 'example' ? 'Examples' :
                   type === 'subexample' ? 'Subsection Examples' :
                   'Terms'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {typeResults.map((result, index) => {
                    if (type === 'language') {
                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => {
                            setCurrentLanguage(result.item);
                            setSearchTerm("");
                            setIsSearching(false);
                          }}
                        >
                          <div className="flex items-center mb-2">
                            {result.item.icon}
                            <h4 className="font-bold ml-2">{result.item.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{result.item.description}</p>
                        </div>
                      );
                    }
                    
                    if (type === 'section') {
                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => {
                            setCurrentLanguage(result.language);
                            setCurrentSection(result.item);
                            setSearchTerm("");
                            setIsSearching(false);
                          }}
                        >
                          <h4 className="font-bold">{result.item.title}</h4>
                          <p className="text-xs text-gray-500 mb-1">{result.language.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{result.item.content.substring(0, 100)}...</p>
                        </div>
                      );
                    }
                    
                    if (type === 'subsection') {
                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => {
                            setCurrentLanguage(result.language);
                            setCurrentSection(result.section);
                            setCurrentSubSection(result.item);
                            setSearchTerm("");
                            setIsSearching(false);
                          }}
                        >
                          <h4 className="font-bold">{result.item.title}</h4>
                          <p className="text-xs text-gray-500 mb-1">{result.language.name} &rarr; {result.section.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{result.item.content.substring(0, 100)}...</p>
                        </div>
                      );
                    }
                    
                    if (type === 'example' || type === 'subexample') {
                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition"
                        >
                          <h4 className="font-bold">{result.item.title}</h4>
                          <p className="text-xs text-gray-500 mb-2">
                            {result.language.name} &rarr; {result.section.title}
                            {type === 'subexample' && ` &rarr; ${result.subSection.title}`}
                          </p>
                          {renderCode(result.item.code.substring(0, 200) + (result.item.code.length > 200 ? '...' : ''))}
                          <p className="mt-2 text-sm text-gray-600">{result.item.explanation}</p>
                          <button 
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => {
                              setCurrentLanguage(result.language);
                              setCurrentSection(result.section);
                              if (type === 'subexample') setCurrentSubSection(result.subSection);
                              setSearchTerm("");
                              setIsSearching(false);
                            }}
                          >
                            View in context →
                          </button>
                        </div>
                      );
                    }
                    
                    // Term results
                    return (
                      <div
                        key={index}
                        className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => {
                          handleTermSelect(result.item);
                          setSearchTerm("");
                          setIsSearching(false);
                        }}
                      >
                        <h4 className="font-bold">{result.item.term}</h4>
                        <p className="text-xs text-gray-500 mb-1">
                          {result.language.name} &rarr; {result.item.category}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">{result.item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Main content render function
  // Function to group terms by category for easier browsing
  const getCategorizedTerms = (language) => {
    if (!language) return {};
    
    // Define categories and their display names
    const categories = {
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
    
    // Map term categories to our grouped categories
    const categoryMapping = {
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
      'decorator': 'advanced',
      'generator': 'advanced',
      'yield': 'advanced',
      
      // C++ mappings
      'cout': 'io',
      'cin': 'io',
      'cerr': 'io',
      'endl': 'io',
      'int': 'data-types',
      'double': 'data-types',
      'char': 'data-types',
      'bool': 'data-types',
      'string': 'data-types',
      'vector': 'data-types',
      'array': 'data-types',
      'if': 'control-flow',
      'else': 'control-flow',
      'switch': 'control-flow',
      'for': 'control-flow',
      'while': 'control-flow',
      'do-while': 'control-flow',
      'break': 'control-flow',
      'continue': 'control-flow',
      'function': 'functions',
      'return': 'functions',
      'void': 'functions',
      'operators': 'operators',
      'new': 'memory',
      'delete': 'memory',
      'class': 'classes-objects',
      'struct': 'classes-objects',
      'constructor': 'classes-objects',
      'destructor': 'classes-objects',
      'inheritance': 'classes-objects',
      'virtual': 'classes-objects',
      'pointer': 'memory',
      'reference': 'memory',
      'nullptr': 'memory',
      'smart_pointers': 'memory',
      'iostream': 'io',
      'string': 'io',
      'vector': 'collections',
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
      'int': 'data-types',
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
    const groupedTerms = {};
    
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
                <span className={`px-2 py-1 rounded-full text-xs ${languageColor[selectedTerm.language]} bg-opacity-20`}>
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
                      <div key={idx}>
                        {renderCode(example)}
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
              <h3 className="font-bold mb-2">Related Terms</h3>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTermSelect(term)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      term.language === 'python' ? 'bg-blue-100 text-blue-800' :
                      term.language === 'cpp' ? 'bg-purple-100 text-purple-800' :
                      term.language === 'arduino' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    } hover:opacity-80`}
                  >
                    {term.term}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* People also searched for - based on search history */}
          {searchHistory.length > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-500 mb-2">People Also Searched For</h5>
              <div className="flex flex-wrap gap-2">
                {searchHistory.filter(term => term !== selectedTerm.term).slice(0, 5).map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTermLookup(term);
                      handleTermLookup(term);
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // If no language selected, show language selection with additional info
    if (!currentLanguage) {
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
                    <span>Search for terms like <code className="text-red-600 bg-gray-100 px-1 rounded">int</code>, <code className="text-red-600 bg-gray-100 px-1 rounded">for</code>, or <code className="text-red-600 bg-gray-100 px-1 rounded">Serial.println()</code></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span> 
                    <span>Browse by language and topic using the cards below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span> 
                    <span>View your recently accessed terms with the history button</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <h3 className="font-bold flex items-center text-amber-800">
                  <span className="inline-block w-3 h-3 bg-amber-500 mr-2 rounded-full"></span>
                  Content Included
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="text-xs p-1 bg-blue-50 rounded text-center">Functions & Methods</div>
                  <div className="text-xs p-1 bg-blue-50 rounded text-center">Data Types</div>
                  <div className="text-xs p-1 bg-blue-50 rounded text-center">Keywords</div>
                  <div className="text-xs p-1 bg-blue-50 rounded text-center">Operators</div>
                  <div className="text-xs p-1 bg-blue-50 rounded text-center">Syntax Rules</div>
                  <div className="text-xs p-1 bg-blue-50 rounded text-center">Code Examples</div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Select a Programming Language</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LANGUAGES.map((language) => (
              <div 
                key={language.id}
                className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-shadow cursor-pointer"
                onClick={() => handleLanguageSelect(language)}
              >
                <div className="flex items-center mb-2">
                  {language.icon}
                  <h3 className="text-lg font-bold ml-2">{language.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{language.description}</p>
                <div className="flex justify-between mt-3">
                  <div className="text-xs text-gray-500">{language.terms.length} terms</div>
                  <div className="text-xs text-blue-600">Browse &rarr;</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">Programming Paradigms Overview</h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">Different programming languages support different <strong>paradigms</strong> or styles of programming:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Procedural:</strong> Step-by-step instructions (C, Python)</li>
                <li><strong>Object-Oriented:</strong> Organized around objects and classes (Java, C++, Python)</li>
                <li><strong>Functional:</strong> Functions as first-class citizens (Haskell, JavaScript)</li>
                <li><strong>Event-Driven:</strong> Flow determined by events (JavaScript for web)</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    // If language selected but no section, show section selection with improved organization
    if (currentLanguage && !currentSection) {
      // Group sections by categories for better organization
      const sectionCategories = {
        basics: ['syntax', 'basic', 'fundamental', 'structure', 'concept'],
        dataAndTypes: ['data', 'type', 'variable', 'array', 'object'],
        controlFlow: ['control', 'condition', 'loop', 'flow'],
        functions: ['function', 'method', 'procedure'],
        advanced: ['class', 'object', 'exception', 'thread', 'advanced', 'library']
      };
      
      // Categorize sections
      const categorizedSections: Record<string, ReferenceSection[]> = {
        basics: [],
        dataAndTypes: [],
        controlFlow: [],
        functions: [],
        advanced: [],
        other: []
      };
      
      currentLanguage.sections.forEach(section => {
        const lowerTitle = section.title.toLowerCase();
        let categorized = false;
        
        for (const [category, keywords] of Object.entries(sectionCategories)) {
          if (keywords.some(keyword => lowerTitle.includes(keyword))) {
            categorizedSections[category].push(section);
            categorized = true;
            break;
          }
        }
        
        if (!categorized) {
          categorizedSections.other.push(section);
        }
      });
      
      // Category display names
      const categoryNames: Record<string, string> = {
        basics: 'Language Basics',
        dataAndTypes: 'Data Types & Variables',
        controlFlow: 'Control Flow',
        functions: 'Functions & Methods',
        advanced: 'Advanced Topics',
        other: 'Additional Topics'
      };
      
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
              <div className={`p-2 rounded-md ${currentLanguage.id === 'python' ? 'bg-blue-200' : currentLanguage.id === 'cpp' ? 'bg-purple-200' : 'bg-green-200'} mr-3`}>
                {currentLanguage.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentLanguage.name}</h3>
                <p className="text-gray-700">{currentLanguage.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Terms Available:</span>
                <span className="font-semibold">{currentLanguage.terms.length}</span>
              </div>
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Topics:</span>
                <span className="font-semibold">{currentLanguage.sections.length}</span>
              </div>
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Skill Level:</span>
                <span className="font-semibold">Beginner-Advanced</span>
              </div>
              <div className="p-1 bg-white rounded flex justify-between items-center border border-gray-200">
                <span>Last Updated:</span>
                <span className="font-semibold">May 2, 2025</span>
              </div>
            </div>
          </div>
          
          {/* Render each category of sections */}
          {Object.entries(categorizedSections).map(([category, sections]) => {
            if (sections.length === 0) return null;
            
            return (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    category === 'basics' ? 'bg-green-500' : 
                    category === 'dataAndTypes' ? 'bg-blue-500' : 
                    category === 'controlFlow' ? 'bg-purple-500' : 
                    category === 'functions' ? 'bg-yellow-500' :
                    category === 'advanced' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></span>
                  {categoryNames[category]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sections.map((section) => (
                    <div 
                      key={section.id}
                      className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleSectionSelect(section)}
                    >
                      <h4 className="font-bold">{section.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{section.content.substring(0, 100)}...</p>
                      <div className="flex justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          {section.examples ? `${section.examples.length} example${section.examples.length !== 1 ? 's' : ''}` : 'No examples'}
                        </div>
                        <div className="text-xs text-blue-600">Read more →</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <h3 className="text-lg font-bold mb-2">Term Lookup</h3>
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-md border border-gray-200">
              <p className="mb-2">Look up coding terms, functions, data types, and common problems:</p>
              
              {/* Language filter buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button 
                  onClick={() => setActiveFilter("all")} 
                  className={`px-3 py-1 text-xs rounded-full ${activeFilter === "all" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter("python")} 
                  className={`px-3 py-1 text-xs rounded-full ${activeFilter === "python" ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                >
                  Python
                </button>
                <button 
                  onClick={() => setActiveFilter("cpp")} 
                  className={`px-3 py-1 text-xs rounded-full ${activeFilter === "cpp" ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}
                >
                  C++
                </button>
                <button 
                  onClick={() => setActiveFilter("wiring")} 
                  className={`px-3 py-1 text-xs rounded-full ${activeFilter === "wiring" ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                >
                  Arduino
                </button>
              </div>
              
              {/* Search input with autocomplete */}
              <div className="relative">
                <div className="flex">
                  <input
                    type="text"
                    value={termLookup}
                    onChange={(e) => handleTermLookup(e.target.value)}
                    onFocus={() => termLookup.trim() !== "" && suggestions.length > 0 && setShowAutoComplete(true)}
                    onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
                    placeholder="e.g., int, pinMode(), LED not turning on..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button 
                    onClick={() => handleTermLookup(termLookup)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Search
                  </button>
                </div>
                
                {/* Autocomplete dropdown */}
                {showAutoComplete && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTermLookup(suggestion);
                          handleTermLookup(suggestion);
                          setShowAutoComplete(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Search tips */}
              <div className="mt-2 text-xs text-gray-600">
                <p className="font-medium">Search Tips:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Search for functions like <span className="font-mono bg-gray-100 px-1 rounded">digitalWrite()</span></li>
                  <li>Search for problems like <span className="font-mono bg-gray-100 px-1 rounded">LED not working</span></li>
                  <li>Search is fuzzy - misspellings like <span className="font-mono bg-gray-100 px-1 rounded">digitalrite</span> will still work</li>
                </ul>
              </div>
              
              {/* Search history */}
              {searchHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Recent Searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTermLookup(term);
                          handleTermLookup(term);
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Term search results */}
              {foundTerms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-2">Results for "{termLookup}":</h4>
                  <div className="space-y-3">
                    {foundTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-md cursor-pointer border ${
                          term.language === 'python' ? 'border-blue-200 bg-blue-50' :
                          term.language === 'cpp' ? 'border-purple-200 bg-purple-50' :
                          term.language === 'arduino' ? 'border-green-200 bg-green-50' :
                          term.isProblem ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
                        } hover:shadow-sm`}
                        onClick={() => handleTermSelect(term)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold">{term.term}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            term.language === 'python' ? 'bg-blue-200 text-blue-800' :
                            term.language === 'cpp' ? 'bg-purple-200 text-purple-800' :
                            term.language === 'arduino' ? 'bg-green-200 text-green-800' :
                            term.isProblem ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-800'
                          }`}>
                            {term.language === 'python' ? 'Python' :
                             term.language === 'cpp' ? 'C++' :
                             term.language === 'arduino' ? 'Arduino' :
                             term.isProblem ? 'Problem Solution' : 'General'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{term.description}</p>
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-blue-600">View details →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // If both language and section selected (with possible subsection)
    // Return the section content view
    if (currentLanguage && currentSection) {
      return (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              className="mr-2 text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setCurrentSection(null)}
            >
              <span className="mr-1">←</span> Back to Topics
            </button>
            <h2 className="text-xl font-bold">{currentLanguage.name}: {currentSection.title}</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar for subsections if they exist */}
            {currentSection.subSections && currentSection.subSections.length > 0 && (
              <div className="lg:col-span-1">
                <h3 className="text-lg font-bold mb-2">Subtopics</h3>
                <div className="space-y-1 bg-gray-50 p-2 rounded-md">
                  {currentSection.subSections.map((subSection) => (
                    <div 
                      key={subSection.id}
                      className={`p-2 rounded-md cursor-pointer ${currentSubSection?.id === subSection.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
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
                  <h3 className="text-lg font-bold mb-2">{currentSubSection.title}</h3>
                  <p className="mb-4">{currentSubSection.content}</p>
                  
                  {/* Examples for subsection */}
                  {currentSubSection.examples && currentSubSection.examples.length > 0 && (
                    <div className="space-y-6">
                      {currentSubSection.examples.map((example, index) => (
                        <div key={index} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
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
                  {/* Main section content */}
                  <p className="mb-4">{currentSection.content}</p>
                  
                  {/* Examples for main section */}
                  {currentSection.examples && currentSection.examples.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold mb-2">Examples</h3>
                      {currentSection.examples.map((example, index) => (
                        <div key={index} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                          <h4 className="font-bold mb-2">{example.title}</h4>
                          {renderCode(example.code)}
                          <p className="mt-2 text-gray-700">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
          
          {/* History toggle and navigation buttons */}
          <div className="flex justify-between items-center">
            <div>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`text-sm px-3 py-1 rounded ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Recent Terms {showHistory ? '▼' : '▶'}
              </button>
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
                    className={`text-xs px-2 py-1 rounded-full ${term.language === 'python' ? 'bg-blue-100 text-blue-800' : term.language === 'cpp' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'} hover:opacity-80`}
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

export default CodeReferenceWindow;