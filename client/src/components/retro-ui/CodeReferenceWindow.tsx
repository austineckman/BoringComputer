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
    // Python terms
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
    // More terms would be defined here
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
    // Arduino/Wiring terms
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
    // More terms would be defined here
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