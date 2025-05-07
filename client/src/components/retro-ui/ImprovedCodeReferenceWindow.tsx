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
      syntax: 'print(value, ..., sep=" ", end="\\n", file=sys.stdout, flush=False)',
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
          code: '#include <iostream>\\n\\nint main() {\\n  std::cout << "Hello, World!" << std::endl;\\n  return 0;\\n}',
          explanation: 'This program outputs "Hello, World!" to the console.'
        }
      ]
    },
    // More sections would be defined here
  ],
  terms: [
    // C++ terms
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
    // More terms would be defined here
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
          code: 'void setup() {\\n  pinMode(13, OUTPUT);\\n}\\n\\nvoid loop() {\\n  digitalWrite(13, HIGH);\\n  delay(1000);\\n  digitalWrite(13, LOW);\\n  delay(1000);\\n}',
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