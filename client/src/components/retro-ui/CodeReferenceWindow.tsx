import React, { useState, useEffect } from 'react';
import { X, Minimize2, Search, Book, Code, FileCode, Terminal, ExternalLink, ChevronRight } from 'lucide-react';
import './retro-ui.css';

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

interface ReferenceLanguage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: ReferenceSection[];
  resources: ResourceLink[];
}

interface ResourceLink {
  title: string;
  url: string;
  description: string;
  category: 'Documentation' | 'Tutorial' | 'Community' | 'Tool' | 'Reference';
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
  resources: [
    {
      title: 'Python Official Documentation',
      url: 'https://docs.python.org/',
      description: 'Comprehensive documentation for all Python versions.',
      category: 'Documentation'
    },
    {
      title: 'Real Python',
      url: 'https://realpython.com/',
      description: 'Tutorials, articles, and news about Python programming.',
      category: 'Tutorial'
    },
    {
      title: 'Python Package Index (PyPI)',
      url: 'https://pypi.org/',
      description: 'Repository of software for the Python programming language.',
      category: 'Tool'
    },
    {
      title: 'Stack Overflow - Python',
      url: 'https://stackoverflow.com/questions/tagged/python',
      description: 'Community-driven Q&A for Python programmers.',
      category: 'Community'
    },
    {
      title: 'Python Cheat Sheet',
      url: 'https://www.pythoncheatsheet.org/',
      description: 'A comprehensive Python cheatsheet for quick reference.',
      category: 'Reference'
    }
  ]
};

// C++ reference data
const cppReference: ReferenceLanguage = {
  id: 'cpp',
  name: 'C++',
  description: 'C++ is a powerful general-purpose programming language that extends C with object-oriented features. It\'s used for system/software development, game development, and more.',
  icon: <Code size={24} className="text-blue-800" />,
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
        },
        {
          title: 'Basic Control Structures',
          code: `#include <iostream>
using namespace std;

int main() {
    // If-else statement
    int x = 10;
    if (x > 5) {
        cout << "x is greater than 5" << endl;
    } else {
        cout << "x is not greater than 5" << endl;
    }
    
    // For loop
    for (int i = 0; i < 5; i++) {
        cout << i << " ";
    }
    cout << endl;
    
    // While loop
    int j = 0;
    while (j < 5) {
        cout << j << " ";
        j++;
    }
    cout << endl;
    
    return 0;
}`,
          explanation: 'This example shows basic control structures in C++: if-else statement, for loop, and while loop.'
        }
      ],
      subSections: [
        {
          id: 'variables',
          title: 'Variables',
          content: 'In C++, variables must be declared with their data type before they can be used.',
          examples: [
            {
              title: 'Variable Declaration and Initialization',
              code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Integer
    int x = 5;
    
    // Float and double
    float f = 3.14f;
    double d = 3.14159;
    
    // Character
    char c = 'A';
    
    // Boolean
    bool isTrue = true;
    
    // String (from C++ standard library)
    string str = "Hello, C++!";
    
    cout << "x = " << x << endl;
    cout << "f = " << f << endl;
    cout << "d = " << d << endl;
    cout << "c = " << c << endl;
    cout << "isTrue = " << isTrue << endl;
    cout << "str = " << str << endl;
    
    return 0;
}`,
              explanation: 'Unlike Python, C++ is statically typed, meaning variable types must be explicitly declared.'
            }
          ]
        },
        {
          id: 'data-types',
          title: 'Data Types',
          content: 'C++ has several built-in data types for different kinds of values.',
          examples: [
            {
              title: 'Common Data Types',
              code: `#include <iostream>
#include <string>
#include <vector>
#include <map>
using namespace std;

int main() {
    // Fundamental types
    int i = 42;
    float f = 3.14f;
    double d = 2.71828;
    char c = 'X';
    bool b = true;
    
    // Complex types
    string s = "C++ String";
    
    // Container types
    vector<int> v = {1, 2, 3, 4, 5};
    map<string, int> m = {{
        {"one", 1},
        {"two", 2},
        {"three", 3}
    }};
    
    // Iterating through vector
    cout << "Vector elements: ";
    for (const auto& element : v) {
        cout << element << " ";
    }
    cout << endl;
    
    // Accessing map elements
    cout << "Map elements:" << endl;
    for (const auto& [key, value] : m) {
        cout << key << ": " << value << endl;
    }
    
    return 0;
}`,
              explanation: 'C++ provides various data types for different use cases, including primitive types and container types from the Standard Template Library (STL).'
            }
          ]
        }
      ]
    },
    {
      id: 'functions',
      title: 'Functions',
      content: 'Functions in C++ are defined with a return type, name, and parameters.',
      examples: [
        {
          title: 'Function Definition and Call',
          code: `#include <iostream>
using namespace std;

// Function declaration
int add(int a, int b);

int main() {
    int result = add(5, 3);
    cout << "5 + 3 = " << result << endl;
    return 0;
}

// Function definition
int add(int a, int b) {
    return a + b;
}`,
          explanation: 'Functions in C++ can be declared before they are defined. This example shows how to define and call a simple function.'
        },
        {
          title: 'Default Parameters',
          code: `#include <iostream>
using namespace std;

// Function with default parameters
void greet(string name = "User", string greeting = "Hello") {
    cout << greeting << ", " << name << "!" << endl;
}

int main() {
    greet();                // Uses both defaults
    greet("Alice");         // Uses default greeting
    greet("Bob", "Hi");     // Uses no defaults
    return 0;
}`,
          explanation: 'C++ functions can have default parameter values, which are used when the caller doesn\'t provide that argument.'
        }
      ]
    },
    {
      id: 'classes',
      title: 'Classes and Objects',
      content: 'C++ is an object-oriented programming language where data and functions can be encapsulated in classes.',
      examples: [
        {
          title: 'Class Definition',
          code: `#include <iostream>
#include <string>
using namespace std;

class Person {
private:
    string name;
    int age;
    
public:
    // Constructor
    Person(string name, int age) {
        this->name = name;
        this->age = age;
    }
    
    // Member function
    void greet() {
        cout << "Hello, my name is " << name << 
                " and I am " << age << " years old." << endl;
    }
    
    // Getters and setters
    string getName() { return name; }
    void setName(string name) { this->name = name; }
    int getAge() { return age; }
    void setAge(int age) { this->age = age; }
};

int main() {
    // Create an object
    Person person("Alice", 25);
    person.greet();
    
    // Use getters and setters
    person.setName("Bob");
    cout << "New name: " << person.getName() << endl;
    
    return 0;
}`,
          explanation: 'This example shows how to define a class in C++ with private data members, a constructor, member functions, and getters/setters.'
        }
      ]
    },
    {
      id: 'memory',
      title: 'Memory Management',
      content: 'C++ allows manual memory management using new and delete operators, as well as smart pointers for automatic memory management.',
      examples: [
        {
          title: 'Dynamic Memory Allocation',
          code: `#include <iostream>
using namespace std;

int main() {
    // Dynamic allocation of a single integer
    int* p = new int;
    *p = 10;
    cout << "Value: " << *p << endl;
    delete p;  // Free the memory
    
    // Dynamic allocation of an array
    int* arr = new int[5];
    for (int i = 0; i < 5; i++) {
        arr[i] = i * 2;
    }
    for (int i = 0; i < 5; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    delete[] arr;  // Free the array memory
    
    return 0;
}`,
          explanation: 'C++ allows dynamic memory allocation using new and delete operators. It\'s important to free the allocated memory to avoid memory leaks.'
        },
        {
          title: 'Smart Pointers',
          code: `#include <iostream>
#include <memory>
using namespace std;

class Resource {
public:
    Resource() { cout << "Resource acquired" << endl; }
    ~Resource() { cout << "Resource released" << endl; }
    void use() { cout << "Resource being used" << endl; }
};

int main() {
    // Unique pointer - exclusive ownership
    unique_ptr<Resource> res1 = make_unique<Resource>();
    res1->use();
    
    // Shared pointer - shared ownership
    shared_ptr<Resource> res2 = make_shared<Resource>();
    {
        shared_ptr<Resource> res3 = res2;  // Reference count = 2
        res3->use();
    }  // res3 goes out of scope, but resource is not deleted yet
    res2->use();  // Resource still accessible through res2
    
    return 0;
}  // Both res1 and res2 go out of scope, resources are automatically released`,
          explanation: 'Smart pointers in C++ provide automatic memory management. unique_ptr represents exclusive ownership, while shared_ptr allows shared ownership of a resource.'
        }
      ]
    }
  ],
  resources: [
    {
      title: 'CPP Reference',
      url: 'https://en.cppreference.com/',
      description: 'Comprehensive reference for C and C++ languages and standard libraries.',
      category: 'Documentation'
    },
    {
      title: 'Learn CPP',
      url: 'https://www.learncpp.com/',
      description: 'A free website devoted to teaching you how to program in C++.',
      category: 'Tutorial'
    },
    {
      title: 'C++ Core Guidelines',
      url: 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines',
      description: 'A set of core guidelines for modern C++ developed by Bjarne Stroustrup and Herb Sutter.',
      category: 'Reference'
    },
    {
      title: 'Stack Overflow - C++',
      url: 'https://stackoverflow.com/questions/tagged/c%2B%2B',
      description: 'Community-driven Q&A for C++ programmers.',
      category: 'Community'
    },
    {
      title: 'Compiler Explorer',
      url: 'https://godbolt.org/',
      description: 'An interactive online compiler which shows the assembly output of compiled C++ code.',
      category: 'Tool'
    }
  ]
};

// Wiring reference data
const wiringReference: ReferenceLanguage = {
  id: 'wiring',
  name: 'Arduino/Wiring',
  description: 'Wiring is a programming framework for microcontrollers. Arduino uses a variant of this language, which is essentially C++ with specific libraries for hardware interaction.',
  icon: <Terminal size={24} className="text-green-600" />,
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
    },
    {
      id: 'digital-io',
      title: 'Digital Input/Output',
      content: 'Digital pins can be set as input or output and read or written to as HIGH (1) or LOW (0).',
      examples: [
        {
          title: 'Digital Output - LED Control',
          code: `const int ledPin = 13;  // Built-in LED on many Arduino boards

void setup() {
  pinMode(ledPin, OUTPUT);  // Set the pin as output
}

void loop() {
  digitalWrite(ledPin, HIGH);  // Turn LED on (HIGH is voltage level)
  delay(1000);                 // Wait for a second
  digitalWrite(ledPin, LOW);   // Turn LED off by making the voltage LOW
  delay(1000);                 // Wait for a second
}`,
          explanation: 'This example shows how to control a digital output pin to blink an LED.'
        },
        {
          title: 'Digital Input - Button',
          code: `const int buttonPin = 2;  // Pin connected to pushbutton
const int ledPin = 13;     // Pin connected to LED

// Variables will change:
int buttonState = 0;       // Variable for reading button status

void setup() {
  pinMode(ledPin, OUTPUT);    // Initialize LED pin as output
  pinMode(buttonPin, INPUT);  // Initialize button pin as input
}

void loop() {
  // Read the state of the pushbutton
  buttonState = digitalRead(buttonPin);

  // Check if button is pressed
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);  // Turn LED on
  } else {
    digitalWrite(ledPin, LOW);   // Turn LED off
  }
}`,
          explanation: 'This example shows how to read a digital input from a button and control an LED based on the button state.'
        }
      ]
    },
    {
      id: 'analog-io',
      title: 'Analog Input/Output',
      content: 'Analog pins can read variable voltage levels, and PWM pins can simulate analog output.',
      examples: [
        {
          title: 'Analog Input - Reading a Potentiometer',
          code: `const int potPin = A0;  // Analog input pin connected to potentiometer
int potValue = 0;       // Value from the analog pin

void setup() {
  Serial.begin(9600);  // Initialize serial communication
}

void loop() {
  // Read the analog input
  potValue = analogRead(potPin);  // Returns value between 0-1023
  
  // Print the result
  Serial.print("Potentiometer value: ");
  Serial.println(potValue);
  
  delay(100);  // Small delay for stability
}`,
          explanation: 'This example shows how to read analog values from a potentiometer connected to an analog pin.'
        },
        {
          title: 'Analog Output (PWM) - LED Fading',
          code: `const int ledPin = 9;  // PWM pin connected to LED

void setup() {
  // No need to declare pinMode for analogWrite
}

void loop() {
  // Fade in (from min to max)
  for (int fadeValue = 0; fadeValue <= 255; fadeValue += 5) {
    analogWrite(ledPin, fadeValue);  // Sets the value (0-255)
    delay(30);  // Wait for 30 milliseconds
  }
  
  // Fade out (from max to min)
  for (int fadeValue = 255; fadeValue >= 0; fadeValue -= 5) {
    analogWrite(ledPin, fadeValue);
    delay(30);
  }
}`,
          explanation: 'This example demonstrates how to use analogWrite() for PWM output to fade an LED between off and fully on.'
        }
      ]
    },
    {
      id: 'serial',
      title: 'Serial Communication',
      content: 'Arduino boards can communicate with a computer or other devices via serial communication.',
      examples: [
        {
          title: 'Basic Serial Communication',
          code: `void setup() {
  Serial.begin(9600);  // Initialize serial at 9600 baud rate
  Serial.println("Arduino is ready");
}

void loop() {
  // Send data to the serial port
  Serial.println("Hello from Arduino!");
  
  // Check if data is available to read
  if (Serial.available() > 0) {
    // Read the incoming byte
    char incomingByte = Serial.read();
    
    // Echo the incoming byte back
    Serial.print("I received: ");
    Serial.println(incomingByte);
  }
  
  delay(1000);  // Wait for a second
}`,
          explanation: 'This example shows how to set up serial communication, send data, and receive data from the serial port.'
        }
      ]
    },
    {
      id: 'sensors',
      title: 'Working with Sensors',
      content: 'Arduino can interface with various sensors to read data from the physical environment.',
      examples: [
        {
          title: 'Temperature Sensor (DHT11/DHT22)',
          code: `#include <DHT.h>

#define DHTPIN 2      // Pin connected to DHT sensor
#define DHTTYPE DHT11 // DHT 11 or DHT22 sensor type

DHT dht(DHTPIN, DHTTYPE);  // Initialize DHT sensor

void setup() {
  Serial.begin(9600);
  dht.begin();  // Initialize the DHT sensor
}

void loop() {
  // Wait a few seconds between measurements
  delay(2000);
  
  // Reading temperature or humidity takes about 250 milliseconds
  float h = dht.readHumidity();     // Read humidity
  float t = dht.readTemperature();  // Read temperature in Celsius
  
  // Check if any reads failed and exit early
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println(" °C");
}`,
          explanation: 'This example shows how to read temperature and humidity data from a DHT11 or DHT22 sensor using the DHT library.'
        }
      ]
    }
  ],
  resources: [
    {
      title: 'Arduino Reference',
      url: 'https://www.arduino.cc/reference/en/',
      description: 'Official Arduino language reference documentation.',
      category: 'Documentation'
    },
    {
      title: 'Arduino Tutorials',
      url: 'https://www.arduino.cc/en/Tutorial/HomePage',
      description: 'Official tutorials for Arduino projects and features.',
      category: 'Tutorial'
    },
    {
      title: 'Arduino Forum',
      url: 'https://forum.arduino.cc/',
      description: 'Official Arduino forum for community discussion and support.',
      category: 'Community'
    },
    {
      title: 'Arduino IDE',
      url: 'https://www.arduino.cc/en/software',
      description: 'Integrated Development Environment for Arduino programming.',
      category: 'Tool'
    },
    {
      title: 'Arduino Cheat Sheet',
      url: 'https://github.com/liffiton/Arduino-Cheat-Sheet',
      description: 'A comprehensive Arduino/Wiring cheat sheet for quick reference.',
      category: 'Reference'
    }
  ]
};

// All languages in one array
const LANGUAGES: ReferenceLanguage[] = [pythonReference, cppReference, wiringReference];

const CodeReferenceWindow: React.FC<CodeReferenceWindowProps> = ({ onClose, onMinimize, isActive }) => {
  // State for currently selected language, section, and subsection
  const [currentLanguage, setCurrentLanguage] = useState<ReferenceLanguage | null>(null);
  const [currentSection, setCurrentSection] = useState<ReferenceSection | null>(null);
  const [currentSubSection, setCurrentSubSection] = useState<ReferenceSection | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
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
  
  // Effect for searching
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
      
      // Search in resources
      language.resources.forEach(resource => {
        if (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            type: 'resource',
            item: resource,
            language: language
          });
        }
      });
    });
    
    setSearchResults(results);
  }, [searchTerm]);
  
  // Function to render syntax-highlighted code
  const renderCode = (code: string) => {
    return (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto font-mono text-sm">
        <code>{code}</code>
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
            } else if (result.type === 'subsection') {
              return (
                <div 
                  key={`subsection-${index}`} 
                  className="p-3 bg-purple-50 rounded-md border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={() => {
                    handleLanguageSelect(result.language);
                    handleSectionSelect(result.section);
                    handleSubSectionSelect(result.item);
                    setSearchTerm('');
                  }}
                >
                  <h3 className="text-md font-bold">{result.item.title}</h3>
                  <p className="text-sm text-gray-600">{result.language.name} - {result.section.title}</p>
                  <p>{result.item.content}</p>
                </div>
              );
            } else if (result.type === 'resource') {
              return (
                <div 
                  key={`resource-${index}`} 
                  className="p-3 bg-indigo-50 rounded-md border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <h3 className="text-md font-bold flex justify-between">
                    <span>{result.item.title}</span>
                    <a 
                      href={result.item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} className="mr-1" />
                      <span>Visit</span>
                    </a>
                  </h3>
                  <p className="text-sm text-gray-600">{result.language.name} - {result.item.category}</p>
                  <p>{result.item.description}</p>
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
    
    // If no language selected, show language selection
    if (!currentLanguage) {
      return (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Select a Programming Language</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LANGUAGES.map((language) => (
              <div 
                key={language.id}
                className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleLanguageSelect(language)}
              >
                <div className="flex items-center mb-2">
                  {language.icon}
                  <h3 className="text-lg font-bold ml-2">{language.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{language.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // If language selected but no section, show section selection
    if (!currentSection) {
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
          
          <p className="mb-4">{currentLanguage.description}</p>
          
          <h3 className="text-lg font-bold mb-2">Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {currentLanguage.sections.map((section) => (
              <div 
                key={section.id}
                className="p-3 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleSectionSelect(section)}
              >
                <h4 className="font-bold">{section.title}</h4>
                <p className="text-sm text-gray-600">{section.content.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-bold mb-2">Resources</h3>
          <div className="space-y-2">
            {currentLanguage.resources.map((resource, index) => (
              <a 
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-between items-center p-3 bg-blue-50 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <div>
                  <h4 className="font-bold">{resource.title}</h4>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
                <div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{resource.category}</span>
                </div>
              </a>
            ))}
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
        {/* Search bar */}
        <div className="p-2 border-b border-gray-300 bg-gray-100">
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
