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
  category: 'data-type' | 'function' | 'keyword' | 'operator' | 'directive' | 'class';
  language: 'python' | 'cpp' | 'arduino' | 'general';
  description: string;
  syntax: string;
  examples: string[];
  notes: string;
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
  description: 'Python is a high-level, interpreted programming language known for its readability and versatility, making it popular for beginners and professionals alike.',
  icon: <FileCode size={24} className="text-blue-600" />,
  sections: [
    {
      id: 'basics',
      title: 'Basic Syntax',
      content: 'Python uses indentation to define code blocks instead of braces. Whitespace is significant.',
      examples: [
        {
          title: 'If Statement',
          code: `if condition:
    # code to execute if condition is true
    statement1
    statement2
elif another_condition:
    # code to execute if another_condition is true
    statement3
else:
    # code to execute if no conditions are true
    statement4`,
          explanation: 'Python uses indentation to determine which block of code belongs to each condition.'
        },
        {
          title: 'For Loop',
          code: `for item in iterable:
    # code to execute for each item
    print(item)

# Loop with range
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4`,
          explanation: 'For loops in Python iterate over items in a sequence (list, tuple, string) or other iterable objects.'
        }
      ],
      subSections: [
        {
          id: 'variables',
          title: 'Variables',
          content: 'Python variables don\'t need explicit declaration. Type inference is automatic.',
          examples: [
            {
              title: 'Variable Assignment',
              code: `# Integer
x = 5

# String
name = "Python"

# List
my_list = [1, 2, 3, 4]

# Dictionary
my_dict = {"key": "value", "name": "Python"}`,
              explanation: 'Python variables are dynamically typed, meaning you don\'t need to specify the variable type.'
            }
          ]
        },
        {
          id: 'data-types',
          title: 'Data Types',
          content: 'Python has several built-in data types including numerics, sequences, mappings, classes, instances and exceptions.',
          examples: [
            {
              title: 'Common Data Types',
              code: `# Numbers
integer = 42
float_num = 3.14
complex_num = 1 + 2j

# Strings
text = "Hello, Python!"

# Lists (mutable)
my_list = [1, 2, 3, "four", 5.0]

# Tuples (immutable)
my_tuple = (1, 2, "three")

# Dictionaries
my_dict = {"name": "Python", "version": 3.9}

# Sets
my_set = {1, 2, 3, 4, 5}`,
              explanation: 'Python supports various data types for different use cases.'
            }
          ]
        }
      ]
    },
    {
      id: 'functions',
      title: 'Functions',
      content: 'Functions in Python are defined using the def keyword followed by the function name and parameters.',
      examples: [
        {
          title: 'Function Definition',
          code: `def greet(name):
    """This function greets the person passed in as parameter"""
    return "Hello, " + name + "!"

# Call the function
result = greet("Python")
print(result)  # Output: Hello, Python!`,
          explanation: 'Functions help organize code into reusable blocks. They can accept parameters and return values.'
        },
        {
          title: 'Function with Default Parameters',
          code: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# Different ways to call
print(greet("Python"))  # Output: Hello, Python!
print(greet("Python", "Hi"))  # Output: Hi, Python!`,
          explanation: 'You can provide default values for parameters, which are used when the caller doesn\'t provide that argument.'
        }
      ]
    },
    {
      id: 'classes',
      title: 'Classes and Objects',
      content: 'Python is an object-oriented programming language. Almost everything in Python is an object, with its properties and methods.',
      examples: [
        {
          title: 'Class Definition',
          code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."

# Create an object
person1 = Person("Alice", 25)
print(person1.greet())`,
          explanation: 'Classes provide a means of bundling data and functionality together. Creating a new class creates a new type of object, allowing new instances of that type to be made.'
        }
      ]
    },
    {
      id: 'modules',
      title: 'Modules and Packages',
      content: 'Python code can be organized into modules and packages for reusability and maintainability.',
      examples: [
        {
          title: 'Importing Modules',
          code: `# Import the entire module
import math
print(math.sqrt(16))  # Output: 4.0

# Import specific functions
from math import sqrt, pi
print(sqrt(16))  # Output: 4.0
print(pi)  # Output: 3.141592653589793

# Import with alias
import numpy as np
arr = np.array([1, 2, 3])
print(arr)  # Output: [1 2 3]`,
          explanation: 'Modules are Python files with functions, classes and variables that can be imported and used in other Python programs.'
        }
      ]
    }
  ],
  terms: [
    // Python Data Types
    {
      term: 'int',
      category: 'data-type',
      language: 'python',
      description: 'Integer data type in Python. Represents whole numbers without a decimal point.',
      syntax: 'x = 5',
      examples: [
        'age = 25',
        'count = -10',
        'result = int("42")  # Convert string to integer'
      ],
      notes: 'Python integers have unlimited precision, meaning they can grow to arbitrary sizes limited only by available memory.'
    },
    {
      term: 'float',
      category: 'data-type',
      language: 'python',
      description: 'Floating-point data type in Python. Represents numbers with a decimal point.',
      syntax: 'x = 3.14',
      examples: [
        'pi = 3.14159',
        'temperature = -2.5',
        'result = float("3.14")  # Convert string to float'
      ],
      notes: 'Floating-point arithmetic may lead to precision issues due to how computers represent decimals in binary.'
    },
    {
      term: 'str',
      category: 'data-type',
      language: 'python',
      description: 'String data type in Python. Represents sequences of characters.',
      syntax: 'x = "hello"',
      examples: [
        'name = "Alice"',
        'message = "Hello, World!"',
        'multiline = """This is a\nmultiline string"""'
      ],
      notes: 'Strings in Python are immutable, meaning they cannot be changed after creation.'
    },
    {
      term: 'list',
      category: 'data-type',
      language: 'python',
      description: 'A mutable, ordered collection of items in Python. Can contain items of different types.',
      syntax: 'x = [1, 2, 3]',
      examples: [
        'numbers = [1, 2, 3, 4, 5]',
        'mixed = [1, "hello", 3.14, True]',
        'nested = [[1, 2], [3, 4]]'
      ],
      notes: 'Lists are mutable (can be modified after creation) and can store elements of different data types.'
    },
    {
      term: 'dict',
      category: 'data-type',
      language: 'python',
      description: 'Dictionary data type in Python. Stores key-value pairs and is mutable.',
      syntax: 'x = {"key": "value"}',
      examples: [
        'person = {"name": "Alice", "age": 30}',
        'scores = {"math": 90, "science": 95}',
        'print(person["name"])  # Access value by key'
      ],
      notes: 'Keys must be immutable (strings, numbers, tuples) and unique within a dictionary.'
    },
    {
      term: 'tuple',
      category: 'data-type',
      language: 'python',
      description: 'An immutable, ordered collection of items in Python.',
      syntax: 'x = (1, 2, 3)',
      examples: [
        'coordinates = (10, 20)',
        'mixed = (1, "hello", 3.14)',
        'single_item = (42,)  # Note the trailing comma'
      ],
      notes: 'Tuples are immutable (cannot be modified after creation) and are often used for fixed collections.'
    },
    {
      term: 'set',
      category: 'data-type',
      language: 'python',
      description: 'An unordered collection of unique items in Python.',
      syntax: 'x = {1, 2, 3}',
      examples: [
        'unique_numbers = {1, 2, 3, 3, 4}  # Will store {1, 2, 3, 4}',
        'a = {1, 2, 3}; b = {3, 4, 5}',
        'print(a.intersection(b))  # {3}'
      ],
      notes: 'Sets are useful for membership testing, removing duplicates, and mathematical operations like unions and intersections.'
    },
    {
      term: 'bool',
      category: 'data-type',
      language: 'python',
      description: 'Boolean data type in Python. Represents True or False values.',
      syntax: 'x = True',
      examples: [
        'is_valid = True',
        'has_errors = False',
        'print(bool(0))  # False'
      ],
      notes: 'In Python, many values are implicitly converted to booleans in boolean contexts. Empty values (0, "", [], {}) are False.'
    },
    
    // Python Built-ins
    {
      term: 'print()',
      category: 'function',
      language: 'python',
      description: 'Prints the specified message to the screen or other standard output device.',
      syntax: 'print(value1, value2, ..., sep=" ", end="\n", file=sys.stdout, flush=False)',
      examples: [
        'print("Hello, World!")',
        'print("Value:", 42)',
        'print("X:", x, "Y:", y, sep="-")'
      ],
      notes: 'The print function takes multiple arguments and has optional parameters to control output format.'
    },
    {
      term: 'input()',
      category: 'function',
      language: 'python',
      description: 'Reads a line from the input (usually keyboard) and returns it as a string.',
      syntax: 'input(prompt)',
      examples: [
        'name = input("Enter your name: ")',
        'age = int(input("Enter your age: "))  # Convert to integer'
      ],
      notes: 'Always returns a string. You need to convert to other types (like int or float) if needed.'
    },
    {
      term: 'range()',
      category: 'function',
      language: 'python',
      description: 'Returns a sequence of numbers, starting from 0 by default, and increments by 1 by default, and stops before a specified number.',
      syntax: 'range(stop) or range(start, stop[, step])',
      examples: [
        'for i in range(5):  # 0, 1, 2, 3, 4',
        'for i in range(1, 6):  # 1, 2, 3, 4, 5',
        'for i in range(0, 10, 2):  # 0, 2, 4, 6, 8'
      ],
      notes: 'The range() function returns an immutable sequence object, not a list. To get a list, use list(range()).'
    },
    {
      term: 'len()',
      category: 'function',
      language: 'python',
      description: 'Returns the number of items in an object.',
      syntax: 'len(object)',
      examples: [
        'len("hello")  # Returns 5',
        'len([1, 2, 3])  # Returns 3',
        'len({"a": 1, "b": 2})  # Returns 2'
      ],
      notes: 'Works with strings, lists, tuples, dictionaries, sets, and most collection objects.'
    },
    {
      term: 'type()',
      category: 'function',
      language: 'python',
      description: 'Returns the type of an object.',
      syntax: 'type(object)',
      examples: [
        'type(42)  # <class \'int\'>',
        'type("hello")  # <class \'str\'>',
        'print(type([1, 2, 3]))  # <class \'list\'>'
      ],
      notes: 'Useful for debugging and conditional logic based on types.'
    },
    {
      term: 'sum()',
      category: 'function',
      language: 'python',
      description: 'Returns the sum of all items in an iterable.',
      syntax: 'sum(iterable, start=0)',
      examples: [
        'sum([1, 2, 3, 4])  # Returns 10',
        'sum([0.1, 0.2])  # Returns 0.30000000000000004',
        'sum([[1], [2]], [])  # Concatenates lists: [1, 2]'
      ],
      notes: 'The start parameter adds an additional value to the sum.'
    },
    {
      term: 'max()',
      category: 'function',
      language: 'python',
      description: 'Returns the largest item in an iterable or the largest of two or more arguments.',
      syntax: 'max(iterable) or max(arg1, arg2, *args, key=None)',
      examples: [
        'max(5, 10, 15)  # Returns 15',
        'max([1, 2, 3, 4])  # Returns 4',
        'max("apple", "banana", key=len)  # Returns "banana" (by length)'
      ],
      notes: 'The key parameter specifies a function to customize comparison.'
    },
    {
      term: 'min()',
      category: 'function',
      language: 'python',
      description: 'Returns the smallest item in an iterable or the smallest of two or more arguments.',
      syntax: 'min(iterable) or min(arg1, arg2, *args, key=None)',
      examples: [
        'min(5, 10, 15)  # Returns 5',
        'min([1, 2, 3, 4])  # Returns 1',
        'min("apple", "banana", key=len)  # Returns "apple" (by length)'
      ],
      notes: 'The key parameter specifies a function to customize comparison.'
    },
    
    // Python Keywords
    {
      term: 'if',
      category: 'keyword',
      language: 'python',
      description: 'Executes a block of code if a specified condition is true.',
      syntax: 'if condition:\\n    # code block',
      examples: [
        'if x > 10:\\n    print("x is greater than 10")',
        'if name == "Alice":\\n    print("Hello Alice")'
      ],
      notes: 'Can be followed by elif and else blocks for more complex conditions.'
    },
    {
      term: 'for',
      category: 'keyword',
      language: 'python',
      description: 'Creates a loop that iterates over a sequence.',
      syntax: 'for item in iterable:\n    # code block',
      examples: [
        'for i in range(5):\n    print(i)',
        'for name in ["Alice", "Bob", "Charlie"]:\n    print(f"Hello {name}")'
      ],
      notes: 'Can use break to exit the loop early or continue to skip to the next iteration.'
    },
    {
      term: 'while',
      category: 'keyword',
      language: 'python',
      description: 'Creates a loop that executes as long as a specified condition is true.',
      syntax: 'while condition:\n    # code block',
      examples: [
        'count = 0\nwhile count < 5:\n    print(count)\n    count += 1',
        'while True:\n    user_input = input()\n    if user_input == "quit":\n        break'
      ],
      notes: 'Be careful to ensure the condition will eventually become false to avoid infinite loops.'
    },
    {
      term: 'def',
      category: 'keyword',
      language: 'python',
      description: 'Defines a function in Python.',
      syntax: 'def function_name(parameters):\n    # function body\n    return value',
      examples: [
        'def greet(name):\n    return f"Hello, {name}!"',
        'def add(a, b=0):\n    return a + b'
      ],
      notes: 'Functions can have default parameter values and return values. Use "return" to specify what value the function outputs.'
    },
    {
      term: 'class',
      category: 'keyword',
      language: 'python',
      description: 'Defines a class, which is a blueprint for creating objects.',
      syntax: 'class ClassName:\n    # class body',
      examples: [
        'class Person:\n    def __init__(self, name):\n        self.name = name\n    def greet(self):\n        return f"Hello, my name is {self.name}"',
        'person = Person("Alice")\nprint(person.greet())'
      ],
      notes: 'The __init__ method is the constructor that initializes new instances. The self parameter refers to the instance being created.'
    },
    
    // C++ Data Types
    {
      term: 'int',
      category: 'data-type',
      language: 'cpp',
      description: 'Integer data type in C++. Represents whole numbers without a decimal point.',
      syntax: 'int x = 5;',
      examples: [
        'int age = 25;',
        'int count = -10;',
        'int result = std::stoi("42");  // Convert string to integer'
      ],
      notes: 'The size of int is usually 4 bytes, giving a typical range of -2,147,483,648 to 2,147,483,647.'
    },
    {
      term: 'float',
      category: 'data-type',
      language: 'cpp',
      description: 'Floating-point data type in C++. Represents numbers with a decimal point.',
      syntax: 'float x = 3.14f;',
      examples: [
        'float pi = 3.14159f;',
        'float temperature = -2.5f;',
        'float result = std::stof("3.14");  // Convert string to float'
      ],
      notes: 'The suffix "f" indicates a float literal. Without it, decimal literals are treated as double by default.'
    },
    {
      term: 'double',
      category: 'data-type',
      language: 'cpp',
      description: 'Double-precision floating-point data type in C++. Has greater precision than float.',
      syntax: 'double x = 3.14159265359;',
      examples: [
        'double pi = 3.14159265359;',
        'double result = 10.0 / 3.0;  // 3.3333...',
        'double scientific = 6.022e23;  // Scientific notation'
      ],
      notes: 'Usually 8 bytes in size, providing greater precision than float. It\'s the default type for floating-point literals in C++.'
    },
    {
      term: 'char',
      category: 'data-type',
      language: 'cpp',
      description: 'Character data type in C++. Represents a single character.',
      syntax: 'char c = \'A\';',
      examples: [
        'char letter = \'A\';',
        'char digit = \'5\';',
        'char newline = \'\n\';'
      ],
      notes: 'Typically 1 byte in size. Characters are enclosed in single quotes. Stores the ASCII or Unicode value of the character.'
    },
    {
      term: 'bool',
      category: 'data-type',
      language: 'cpp',
      description: 'Boolean data type in C++. Represents true or false values.',
      syntax: 'bool flag = true;',
      examples: [
        'bool isValid = true;',
        'bool hasError = false;',
        'bool result = (5 > 3);  // true'
      ],
      notes: 'A bool can only have the values true or false. In memory, it typically uses 1 byte, although only 1 bit would be needed.'
    },
    {
      term: 'std::string',
      category: 'data-type',
      language: 'cpp',
      description: 'String class in C++ that represents sequences of characters.',
      syntax: 'std::string s = "hello";',
      examples: [
        '#include <string>',
        'std::string name = "Alice";',
        'std::string message = "Hello, World!";',
        'std::string combined = first + " " + last;  // String concatenation'
      ],
      notes: 'Requires the <string> header. Unlike C strings, std::string handles memory allocation automatically.'
    },
    {
      term: 'std::vector',
      category: 'data-type',
      language: 'cpp',
      description: 'A dynamic array container in C++ that can resize itself automatically.',
      syntax: 'std::vector<type> name;',
      examples: [
        '#include <vector>',
        'std::vector<int> numbers = {1, 2, 3, 4, 5};',
        'numbers.push_back(6);  // Add element to the end',
        'int third = numbers[2];  // Access third element (0-indexed)'
      ],
      notes: 'Requires the <vector> header. Provides dynamic size, efficient element access, and various useful methods.'
    },
    
    // C++ Keywords and Operators
    {
      term: 'for',
      category: 'keyword',
      language: 'cpp',
      description: 'Creates a loop that executes a specified number of times.',
      syntax: 'for (initialization; condition; increment) { /* code */ }',
      examples: [
        'for (int i = 0; i < 5; i++) {\n    std::cout << i << std::endl;\n}',
        'for (auto item : collection) {\n    // Use item\n}  // Range-based for loop (C++11)'
      ],
      notes: 'The initialization part runs once at the beginning, the condition is checked before each iteration, and the increment part runs after each iteration.'
    },
    {
      term: 'if',
      category: 'keyword',
      language: 'cpp',
      description: 'Executes a block of code if a specified condition is true.',
      syntax: 'if (condition) { /* code */ } else { /* code */ }',
      examples: [
        'if (x > 10) {\n    std::cout << "x is greater than 10" << std::endl;\n}',
        'if (age >= 18) {\n    std::cout << "Adult" << std::endl;\n} else {\n    std::cout << "Minor" << std::endl;\n}'
      ],
      notes: 'The else clause is optional. You can also use else if for multiple conditions.'
    },
    
    // Arduino/Wiring Functions
    {
      term: 'pinMode()',
      category: 'function',
      language: 'arduino',
      description: 'Configures the specified pin to behave either as an input or an output.',
      syntax: 'pinMode(pin, mode)',
      examples: [
        'pinMode(13, OUTPUT);  // Set pin 13 as output',
        'pinMode(2, INPUT);    // Set pin 2 as input',
        'pinMode(3, INPUT_PULLUP);  // Set pin 3 as input with pullup resistor'
      ],
      notes: 'Should be called in setup(). Modes are OUTPUT, INPUT, or INPUT_PULLUP.'
    },
    {
      term: 'Serial.begin()',
      category: 'function',
      language: 'arduino',
      description: 'Initializes serial communication at the specified baud rate.',
      syntax: 'Serial.begin(baudRate)',
      examples: [
        'void setup() {\n  Serial.begin(9600);  // Initialize at 9600 baud\n}',
        'Serial.begin(115200);  // Higher baud rate for faster communication'
      ],
      notes: 'Common baud rates are 9600, 57600, and 115200. Must be called before using other Serial functions.'
    },
    {
      term: 'Serial.print()',
      category: 'function',
      language: 'arduino',
      description: 'Prints data to the serial port without a newline character.',
      syntax: 'Serial.print(val) or Serial.print(val, format)',
      examples: [
        'Serial.print("Sensor value: ");',
        'Serial.print(analogValue);',
        'Serial.print(value, HEX);  // Print in hexadecimal format'
      ],
      notes: 'Serial must be initialized with Serial.begin() before using Serial.print().'
    },
    {
      term: 'Serial.println()',
      category: 'function',
      language: 'arduino',
      description: 'Prints data to the serial port followed by a carriage return and newline characters.',
      syntax: 'Serial.println(val) or Serial.println(val, format)',
      examples: [
        'Serial.println("Hello, Arduino!");',
        'Serial.println(analogValue);',
        'Serial.println(sensorValue, DEC);  // Print in decimal format'
      ],
      notes: 'Serial must be initialized with Serial.begin() before using Serial.println(). Common baud rates are 9600 or 115200.'
    },
    {
      term: 'digitalWrite()',
      category: 'function',
      language: 'arduino',
      description: 'Writes a HIGH or LOW value to a digital pin.',
      syntax: 'digitalWrite(pin, value)',
      examples: [
        'digitalWrite(13, HIGH);  // Turn LED on',
        'digitalWrite(13, LOW);   // Turn LED off',
        'digitalWrite(outputPin, state);  // Set pin to variable state'
      ],
      notes: 'The pin must be set as OUTPUT using pinMode() before using digitalWrite().'
    },
    {
      term: 'digitalRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads the value from a specified digital pin, either HIGH or LOW.',
      syntax: 'digitalRead(pin)',
      examples: [
        'int buttonState = digitalRead(2);',
        'if (digitalRead(buttonPin) == HIGH) {',
        '  // do something when button is pressed',
        '}'
      ],
      notes: 'The pin should be set as INPUT using pinMode() before using digitalRead().'
    },
    {
      term: 'analogRead()',
      category: 'function',
      language: 'arduino',
      description: 'Reads the value from a specified analog pin.',
      syntax: 'analogRead(pin)',
      examples: [
        'int sensorValue = analogRead(A0);',
        'float voltage = analogRead(A0) * (5.0 / 1023.0);'
      ],
      notes: 'Returns a value between 0 and 1023, representing voltages between 0 and the operating voltage (usually 5V or 3.3V).'
    },
    {
      term: 'analogWrite()',
      category: 'function',
      language: 'arduino',
      description: 'Writes an analog value (PWM) to a pin.',
      syntax: 'analogWrite(pin, value)',
      examples: [
        'analogWrite(9, 128);  // 50% duty cycle',
        'analogWrite(9, 255);  // 100% duty cycle',
        'analogWrite(ledPin, brightness);'
      ],
      notes: 'Works only on pins with PWM capability. Value range is 0-255, where 0 is off and 255 is fully on.'
    },
    {
      term: 'delay()',
      category: 'function',
      language: 'arduino',
      description: 'Pauses the program for the specified amount of time (in milliseconds).',
      syntax: 'delay(ms)',
      examples: [
        'delay(1000);  // pause for one second',
        'delay(50);    // pause for 50 milliseconds'
      ],
      notes: 'During the delay, the microcontroller cannot read sensors, compute, or perform other tasks.'
    },
    {
      term: 'delayMicroseconds()',
      category: 'function',
      language: 'arduino',
      description: 'Pauses the program for the specified amount of time (in microseconds).',
      syntax: 'delayMicroseconds(us)',
      examples: [
        'delayMicroseconds(10);  // pause for 10 microseconds',
        'delayMicroseconds(50);  // pause for 50 microseconds'
      ],
      notes: 'More precise than delay() for very short pauses. Accurate for delays up to about 16 milliseconds.'
    },
    {
      term: 'millis()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the number of milliseconds since the Arduino board began running the current program.',
      syntax: 'millis()',
      examples: [
        'unsigned long currentTime = millis();',
        'if (millis() - previousTime > interval) {',
        '  // do something periodically without using delay()',
        '}'
      ],
      notes: 'Overflows after approximately 50 days. Returns an unsigned long value.'
    },
    {
      term: 'micros()',
      category: 'function',
      language: 'arduino',
      description: 'Returns the number of microseconds since the Arduino board began running the current program.',
      syntax: 'micros()',
      examples: [
        'unsigned long startTime = micros();',
        '// do something',
        'unsigned long duration = micros() - startTime;'
      ],
      notes: 'Overflows after approximately 70 minutes. Returns an unsigned long value. Higher resolution than millis().'
    },
    {
      term: 'map()',
      category: 'function',
      language: 'arduino',
      description: 'Re-maps a number from one range to another.',
      syntax: 'map(value, fromLow, fromHigh, toLow, toHigh)',
      examples: [
        'int brightness = map(analogRead(A0), 0, 1023, 0, 255);',
        'float angle = map(potValue, 0, 1023, 0.0, 180.0);'
      ],
      notes: 'Useful for converting sensor readings to usable values. The original value is not constrained, so the result may be outside the target range.'
    },
    {
      term: 'constrain()',
      category: 'function',
      language: 'arduino',
      description: 'Constrains a number to be within a range.',
      syntax: 'constrain(x, a, b)',
      examples: [
        'int brightness = constrain(sensorValue, 0, 255);',
        'float angle = constrain(calculatedAngle, 0.0, 180.0);'
      ],
      notes: 'Returns x if it\'s between a and b, a if x is less than a, and b if x is greater than b.'
    },
    {
      term: 'bit()',
      category: 'function',
      language: 'arduino',
      description: 'Computes the value of the specified bit (bit 0 is 1, bit 1 is 2, bit 2 is 4, etc.).',
      syntax: 'bit(n)',
      examples: [
        'bit(3);  // Returns 8 (2^3)',
        'PORTD |= bit(5);  // Set bit 5 on PORTD',
        'PORTB &= ~bit(2);  // Clear bit 2 on PORTB'
      ],
      notes: 'Useful for setting and clearing individual bits in registers. Equivalent to (1 << n).'
    }
  ]
};

// C++ terms
const cppTerms: CodeTerm[] = [
  {
    term: 'int',
    category: 'data-type',
    language: 'cpp',
    description: 'Integer data type, used to store whole numbers.',
    syntax: 'int variable_name = value;',
    examples: [
      'int count = 0;',
      'int result = 5 + 10;',
      'for(int i = 0; i < 10; i++) { /* code */ }'
    ],
    notes: 'Typically 4 bytes, range approximately -2 billion to +2 billion.'
  },
  {
    term: 'class',
    category: 'keyword',
    language: 'cpp',
    description: 'Creates a user-defined data type with properties and methods.',
    syntax: 'class ClassName { public: /* members */ private: /* members */ };',
    examples: [
      `class Rectangle {
public:
  int width, height;
  int area() { return width * height; }
};`
    ],
    notes: 'By default, members are private unless specified as public or protected.'
  },
  {
    term: 'vector',
    category: 'class',
    language: 'cpp',
    description: 'A dynamic array container from the Standard Template Library (STL).',
    syntax: 'vector<type> variable_name;',
    examples: [
      `#include <vector>
vector<int> numbers;`,
      'numbers.push_back(10);',
      'for(int i = 0; i < numbers.size(); i++) { cout << numbers[i]; }'
    ],
    notes: 'Automatically manages memory allocation. Header <vector> must be included.'
  },
  {
    term: 'cout',
    category: 'function',
    language: 'cpp',
    description: 'Standard output stream object used for output operations.',
    syntax: 'cout << value;',
    examples: [
      `#include <iostream>
using namespace std;
cout << "Hello World";`,
      'cout << "Value: " << variable << endl;'
    ],
    notes: 'Part of the iostream library. Often used with insertion operator (<<).'
  },
  {
    term: 'cin',
    category: 'function',
    language: 'cpp',
    description: 'Standard input stream object used for input operations.',
    syntax: 'cin >> variable;',
    examples: [
      `#include <iostream>
using namespace std;
int age;
cin >> age;`,
      `string name;
cin >> name;`
    ],
    notes: 'Part of the iostream library. Often used with extraction operator (>>).'
  }
];

// C++ reference data
const cppReference: ReferenceLanguage = {
  id: 'cpp',
  name: 'C++',
  description: 'C++ is a powerful general-purpose programming language that extends C with object-oriented features. It\'s used for system/software development, game development, and more.',
  icon: <Code size={24} className="text-blue-800" />,
  terms: cppTerms,
  sections: [
    {
      id: 'basics',
      title: 'Basic Syntax',
      content: 'C++ programs consist of functions and classes. The main() function is the entry point of every C++ program.',
      examples: [
        {
          title: 'Hello World Program',
          code: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
          explanation: 'This is the minimal C++ program that prints "Hello, World!" to the console.'
        }
      ]
    }
  ]
};

// Arduino/Wiring terms
const wiringTerms: CodeTerm[] = [
  {
    term: 'pinMode()',
    category: 'function',
    language: 'arduino',
    description: 'Configures the specified pin to behave either as an input or an output.',
    syntax: 'pinMode(pin, mode)',
    examples: [
      'pinMode(13, OUTPUT);',
      'pinMode(7, INPUT);',
      'pinMode(buttonPin, INPUT_PULLUP);'
    ],
    notes: 'Available modes are INPUT, OUTPUT, and INPUT_PULLUP. Configure pins in the setup() function.'
  },
  {
    term: 'digitalWrite()',
    category: 'function',
    language: 'arduino',
    description: 'Writes a HIGH or LOW value to a digital pin.',
    syntax: 'digitalWrite(pin, value)',
    examples: [
      'digitalWrite(13, HIGH);  // Turn LED on',
      'digitalWrite(13, LOW);   // Turn LED off',
      'digitalWrite(ledPin, ledState);'
    ],
    notes: 'The pin must be configured as OUTPUT with pinMode() before using digitalWrite().'
  },
  {
    term: 'digitalRead()',
    category: 'function',
    language: 'arduino',
    description: 'Reads the value from a specified digital pin, either HIGH or LOW.',
    syntax: 'digitalRead(pin)',
    examples: [
      'int buttonState = digitalRead(7);',
      'if (digitalRead(buttonPin) == HIGH) { /* code */ }'
    ],
    notes: 'The pin should be configured as INPUT with pinMode() before using digitalRead().'
  },
  {
    term: 'analogRead()',
    category: 'function',
    language: 'arduino',
    description: 'Reads the value from the specified analog pin.',
    syntax: 'analogRead(pin)',
    examples: [
      'int sensorValue = analogRead(A0);',
      'float voltage = analogRead(A0) * (5.0 / 1023.0);'
    ],
    notes: 'Returns a value between 0 and 1023, where 0 represents 0V and 1023 represents the operating voltage.'
  },
  {
    term: 'analogWrite()',
    category: 'function',
    language: 'arduino',
    description: 'Writes an analog value (PWM) to a pin.',
    syntax: 'analogWrite(pin, value)',
    examples: [
      'analogWrite(9, 128);  // 50% duty cycle',
      'analogWrite(9, 255);  // 100% duty cycle',
      'analogWrite(ledPin, brightness);'
    ],
    notes: 'Works only on pins with PWM capability. Value range is 0-255, where 0 is off and 255 is fully on.'
  },
  {
    term: 'delay()',
    category: 'function',
    language: 'arduino',
    description: 'Pauses the program for the specified amount of time (in milliseconds).',
    syntax: 'delay(ms)',
    examples: [
      'delay(1000);  // pause for one second',
      'delay(50);    // pause for 50 milliseconds'
    ],
    notes: 'During the delay, the microcontroller cannot read sensors, compute, or perform other tasks.'
  },
  {
    term: 'Serial.begin()',
    category: 'function',
    language: 'arduino',
    description: 'Sets the data rate in bits per second (baud) for serial data transmission.',
    syntax: 'Serial.begin(baudRate)',
    examples: [
      'Serial.begin(9600);',
      'Serial.begin(115200);'
    ],
    notes: 'Common baud rates: 9600, 19200, 38400, 57600, 115200. Use in setup() function.'
  },
  {
    term: 'Serial.print()',
    category: 'function',
    language: 'arduino',
    description: 'Prints data to the serial port as human-readable ASCII text.',
    syntax: 'Serial.print(data)',
    examples: [
      'Serial.print("Sensor value: ");',
      'Serial.print(sensorValue);',
      'Serial.print(value, HEX);  // Print in hexadecimal format'
    ],
    notes: 'Does not add a newline character. Serial.begin() must be called first.'
  },
  {
    term: 'Serial.println()',
    category: 'function',
    language: 'arduino',
    description: 'Prints data to the serial port as human-readable ASCII text followed by a newline character.',
    syntax: 'Serial.println(data)',
    examples: [
      'Serial.println("Hello World");',
      'Serial.println(sensorValue);',
      'Serial.println();  // Just print a new line'
    ],
    notes: 'Adds a newline character after the data. Serial.begin() must be called first.'
  }
];

// Wiring reference data
const wiringReference: ReferenceLanguage = {
  id: 'wiring',
  name: 'Arduino/Wiring',
  description: 'Wiring is a programming framework for microcontrollers. Arduino uses a variant of this language, which is essentially C++ with specific libraries for hardware interaction.',
  icon: <Terminal size={24} className="text-green-600" />,
  terms: wiringTerms,
  sections: [
    {
      id: 'basics',
      title: 'Basic Structure',
      content: 'Every Arduino/Wiring program (or sketch) has two essential functions: setup() and loop().',
      examples: [
        {
          title: 'Basic Sketch Structure',
          code: `// Global variables and constants
const int ledPin = 13;

void setup() {
  // Initialize hardware - runs once at startup
  pinMode(ledPin, OUTPUT);  // Set LED pin as output
  Serial.begin(9600);       // Initialize serial communication
}

void loop() {
  // Main program loop - runs continuously
  digitalWrite(ledPin, HIGH);  // Turn LED on
  delay(1000);                 // Wait for 1 second
  digitalWrite(ledPin, LOW);   // Turn LED off
  delay(1000);                 // Wait for 1 second
  Serial.println("LED blinked");
}`,
          explanation: 'Arduino programs have two main functions: setup() runs once at the beginning, and loop() runs repeatedly afterwards.'
        }
      ]
    }
  ]
};

// All languages in one array
const LANGUAGES: ReferenceLanguage[] = [pythonReference, cppReference, wiringReference];

const CodeReferenceWindow: React.FC<CodeReferenceWindowProps> = ({ onClose, onMinimize, isActive }) => {
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
  
  // Term lookup handler
  const handleTermLookup = (term: string) => {
    setTermLookup(term);
    setSelectedTerm(null);
    
    if (term.trim() === "") {
      setFoundTerms([]);
      return;
    }
    
    const terms: CodeTerm[] = [];
    
    // Search for matching terms across all languages
    LANGUAGES.forEach(language => {
      language.terms.forEach(codeTerm => {
        // Check if the term or part of it matches
        if (codeTerm.term.toLowerCase().includes(term.toLowerCase()) || 
            term.toLowerCase() === codeTerm.term.toLowerCase()) {
          terms.push(codeTerm);
        }
      });
    });
    
    setFoundTerms(terms);
  };
  
  // Handle term selection
  const handleTermSelect = (term: CodeTerm) => {
    setSelectedTerm(term);
    setFoundTerms([]);
    setTermLookup("");
    
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
    setIsSearching(false);
  }, [searchTerm]);
  
  // Function to render syntax-highlighted code
  const renderCode = (code: string, language = 'text') => {
    // Use different syntax highlighting colors based on common patterns
    const codeWithHighlighting = code
      // Highlight keywords
      .replace(/\b(if|else|for|while|return|function|class|def|import|from|void|int|float|double|bool|char|string|const|let|var)\b/g, 
               '<span class="text-purple-400">$1</span>')
      // Highlight strings
      .replace(/(["'])(.*?)\1/g, '<span class="text-amber-400">$1$2$1</span>')
      // Highlight numbers
      .replace(/\b(\d+)\b/g, '<span class="text-cyan-400">$1</span>')
      // Highlight comments
      .replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)|(#.*)/g, '<span class="text-green-400">$1$2$3</span>')
      // Highlight functions
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="text-blue-400">$1</span>(')
      // Highlight brackets and semicolons
      .replace(/([\{\}\(\)\[\]\;])/g, '<span class="text-gray-500">$1</span>');
      
    return (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto font-mono text-sm">
        <code dangerouslySetInnerHTML={{ __html: codeWithHighlighting }} />
      </pre>
    );
  };
  
  // Function to render search results
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return <div className="p-4 text-gray-500">No results found for "{searchTerm}"</div>;
    }
    
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Search Results for "{searchTerm}"</h2>
        <div className="space-y-4">
          {searchResults.map((result, index) => {
            if (result.type === 'language') {
              return (
                <div 
                  key={`lang-${index}`} 
                  className="p-3 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => {
                    handleLanguageSelect(result.item);
                    setSearchTerm('');
                  }}
                >
                  <h3 className="text-lg font-bold flex items-center">
                    {result.item.icon}
                    <span className="ml-2">{result.item.name}</span>
                  </h3>
                  <p>{result.item.description}</p>
                </div>
              );
            } else if (result.type === 'section') {
              return (
                <div 
                  key={`section-${index}`} 
                  className="p-3 bg-green-50 rounded-md border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => {
                    handleLanguageSelect(result.language);
                    handleSectionSelect(result.item);
                    setSearchTerm('');
                  }}
                >
                  <h3 className="text-lg font-bold">{result.item.title}</h3>
                  <p className="text-sm text-gray-600">{result.language.name}</p>
                  <p>{result.item.content}</p>
                </div>
              );
            } else if (result.type === 'example') {
              return (
                <div 
                  key={`example-${index}`} 
                  className="p-3 bg-yellow-50 rounded-md border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => {
                    handleLanguageSelect(result.language);
                    handleSectionSelect(result.section);
                    setSearchTerm('');
                  }}
                >
                  <h3 className="text-md font-bold">{result.item.title}</h3>
                  <p className="text-sm text-gray-600">{result.language.name} - {result.section.title}</p>
                  <div className="mt-2 max-h-32 overflow-hidden relative">
                    {renderCode(result.item.code.substring(0, 200) + (result.item.code.length > 200 ? '...' : ''))}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-yellow-50 to-transparent"></div>
                  </div>
                </div>
              );
            } else if (result.type === 'term') {
              return (
                <div 
                  key={`term-${index}`}
                  className="p-3 bg-indigo-50 rounded-md border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => {
                    handleTermSelect(result.item);
                    setSearchTerm('');
                  }}
                >
                  <h3 className="text-md font-bold font-mono">{result.item.term}</h3>
                  <p className="text-sm text-gray-600">{result.language.name} - {result.item.category}</p>
                  <p>{result.item.description.substring(0, 100)}{result.item.description.length > 100 ? '...' : ''}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };
  
  // Main content render function
  const renderContent = () => {
    // If searching, show search results
    if (isSearching) {
      return renderSearchResults();
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
    if (!currentSection) {
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
              <div className={`p-2 rounded-md bg-${currentLanguage.id === 'python' ? 'blue' : currentLanguage.id === 'cpp' ? 'purple' : 'green'}-200 mr-3`}>
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
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 bg-${
                    category === 'basics' ? 'green' : 
                    category === 'dataAndTypes' ? 'blue' : 
                    category === 'controlFlow' ? 'purple' : 
                    category === 'functions' ? 'yellow' :
                    category === 'advanced' ? 'red' : 'gray'
                  }-500`}></span>
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
              <p className="mb-2">Look up coding terms, functions, data types, and more:</p>
              <div className="flex">
                <input
                  type="text"
                  value={termLookup}
                  onChange={(e) => handleTermLookup(e.target.value)}
                  placeholder="e.g., int, Serial.println(), bit()..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button 
                  onClick={() => handleTermLookup(termLookup)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Search
                </button>
              </div>
              
              {/* Search results */}
              {foundTerms.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-500 mb-2">{foundTerms.length} result(s) found</p>
                  <div className="space-y-2">
                    {foundTerms.map((term, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleTermSelect(term)}
                        className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-mono font-medium">{term.term}</div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              term.language === 'python' ? 'bg-blue-100 text-blue-800' :
                              term.language === 'cpp' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {term.language === 'python' ? 'Python' :
                               term.language === 'cpp' ? 'C++' : 'Arduino'}
                            </span>
                            <span className="ml-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{term.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Selected term details */}
            {selectedTerm && (
              <div className="p-0 bg-white rounded-md border border-gray-200 shadow overflow-hidden">
                {/* Header with term name and badges */}
                <div className={`p-3 ${selectedTerm.language === 'python' ? 'bg-blue-50' : selectedTerm.language === 'cpp' ? 'bg-purple-50' : 'bg-green-50'} border-b`}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-mono font-bold flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${selectedTerm.language === 'python' ? 'bg-blue-500' : selectedTerm.language === 'cpp' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                      {selectedTerm.term}
                    </h4>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTerm.language === 'python' ? 'bg-blue-100 text-blue-800' :
                        selectedTerm.language === 'cpp' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedTerm.language === 'python' ? 'Python' :
                         selectedTerm.language === 'cpp' ? 'C++' : 'Arduino'}
                      </span>
                      <span className="ml-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{selectedTerm.category}</span>
                    </div>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-gray-700">{selectedTerm.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-bold mb-2 flex items-center">
                      <span className="inline-block w-3 h-3 bg-yellow-400 mr-2"></span>
                      Syntax
                    </h5>
                    {renderCode(selectedTerm.syntax, selectedTerm.language)}
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-bold mb-2 flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-400 mr-2"></span>
                      Examples
                    </h5>
                    <div className="space-y-3">
                      {selectedTerm.examples.map((example, idx) => (
                        <div key={idx} className="rounded-md overflow-hidden border border-gray-200">
                          <div className="bg-gray-100 px-3 py-1 text-xs text-gray-600 border-b">Example {idx + 1}</div>
                          {renderCode(example, selectedTerm.language)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedTerm.notes && (
                    <div className="mb-1">
                      <h5 className="font-bold mb-2 flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-400 mr-2"></span>
                        Notes
                      </h5>
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <p className="text-gray-700">{selectedTerm.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Related terms - visually suggest other terms but not functional yet */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Related Terms</h5>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.filter(lang => lang.id === selectedTerm.language)
                        .flatMap(lang => lang.terms)
                        .filter(term => 
                          term.category === selectedTerm.category && 
                          term.term !== selectedTerm.term)
                        .slice(0, 5)
                        .map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleTermSelect(term)}
                            className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {term.term}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // If both language and section selected
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