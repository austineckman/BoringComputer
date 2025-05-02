import React, { useState, useEffect } from 'react';
import { Search, HelpCircle, X, Minimize2 } from 'lucide-react';

interface HelpCenterWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

interface HelpQuestion {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const HelpCenterWindow: React.FC<HelpCenterWindowProps> = ({ onClose, onMinimize, isActive }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<HelpQuestion | null>(null);

  // Categories and their icons
  const categories = [
    { id: 'general', name: 'General Questions', icon: '❓' },
    { id: 'hardware', name: 'Hardware & Components', icon: '🔌' },
    { id: 'coding', name: 'Coding & Software', icon: '💻' },
    { id: 'raspberry', name: 'Raspberry Pi Pico', icon: '🍓' },
    { id: 'hero', name: 'HERO Board', icon: '🦸' },
    { id: 'circuits', name: 'Circuit Design', icon: '⚡' },
    { id: 'projects', name: 'Projects & Activities', icon: '🔨' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
  ];

  // Reset selected question when changing categories
  useEffect(() => {
    setSelectedQuestion(null);
  }, [selectedCategory]);

  const questions: HelpQuestion[] = [
    {
      id: 1,
      category: "General Questions",
      question: "What is a microcontroller?",
      answer: "A microcontroller is a small, self-contained computer on a single integrated circuit that includes a processor core, memory, and programmable input/output peripherals. Unlike a typical computer, a microcontroller is designed for specific tasks and embedded applications. The Raspberry Pi Pico and HERO board both use microcontrollers - specifically the RP2040 chip."
    },
    {
      id: 2,
      category: "General Questions",
      question: "What's the difference between a microcontroller and a microprocessor?",
      answer: "The main difference is that a microcontroller is a complete computing system on a single chip with integrated memory and peripherals, while a microprocessor only contains the central processing unit (CPU) and requires external components for memory and I/O operations. Microcontrollers are designed for dedicated tasks and embedded applications, while microprocessors are more general-purpose and found in computers, laptops, and more complex computing devices."
    },
    {
      id: 3,
      category: "General Questions",
      question: "What programming languages can I use with microcontrollers?",
      answer: "For microcontrollers like the Raspberry Pi Pico and HERO board, you can use several languages: 1) MicroPython - a streamlined version of Python for microcontrollers, ideal for beginners. 2) CircuitPython - Adafruit's Python variant with additional libraries. 3) C/C++ - provides more direct hardware control and optimization options. 4) Arduino C (for Arduino-compatible boards) - based on C++ with simplified functions."
    },
    {
      id: 4,
      category: "Raspberry Pi Pico",
      question: "What is the Raspberry Pi Pico?",
      answer: "The Raspberry Pi Pico is a microcontroller board built around the RP2040 chip, designed by the Raspberry Pi Foundation. It features a dual-core ARM Cortex M0+ processor running at up to 133 MHz, 264KB of RAM, 2MB of flash storage, and 26 GPIO pins. It's designed for physical computing and embedded projects, and can be programmed using MicroPython, C/C++, or CircuitPython."
    },
    {
      id: 5,
      category: "Raspberry Pi Pico",
      question: "How do I start programming the Raspberry Pi Pico?",
      answer: "To start programming the Raspberry Pi Pico: 1) For MicroPython, download the MicroPython UF2 file from the Raspberry Pi website and drag it onto the Pico while it's in bootloader mode (hold BOOTSEL while plugging in). 2) For C/C++, install the Raspberry Pi Pico SDK and set up your development environment. 3) For CircuitPython, download the CircuitPython UF2 file from Adafruit and follow similar steps to MicroPython."
    },
    {
      id: 6,
      category: "HERO Education",
      question: "What is the HERO board?",
      answer: "The HERO (Hardware Educational Revolution Outreach) board is an educational microcontroller board based on the RP2040 chip (same as Raspberry Pi Pico). It's specifically designed for STEM education with: 1) Built-in components like LEDs, buttons, potentiometers, a buzzer, and sensors. 2) Beginner-friendly layout with clear labeling. 3) Compatibility with both MicroPython and C/C++. 4) Additional onboard features to support learning activities."
    },
    {
      id: 7,
      category: "HERO Education",
      question: "How does the HERO board differ from Arduino boards?",
      answer: "The HERO board differs from Arduino boards in several key ways: 1) Processor: HERO uses the dual-core RP2040 chip (ARM Cortex-M0+) which is generally more powerful than most Arduino processors. 2) Programming: HERO supports MicroPython out of the box (easier for beginners) as well as C/C++, while Arduino primarily uses C/C++ with the Arduino IDE. 3) Built-in components: HERO includes LEDs, buttons, sensors, and other components directly on the board."
    },
    {
      id: 8,
      category: "Hardware & Components",
      question: "What is an LED and how does it work?",
      answer: "An LED (Light Emitting Diode) is a semiconductor component that emits light when electric current passes through it. It works by the movement of electrons in a semiconductor material, releasing energy in the form of photons (light). LEDs have a positive (anode) and negative (cathode) leg, and current must flow from anode to cathode to work. They're efficient, durable, and available in various colors determined by the semiconductor materials used."
    },
    {
      id: 9,
      category: "Hardware & Components",
      question: "What does a resistor do in a circuit?",
      answer: "A resistor limits the flow of electric current in a circuit, providing controlled resistance measured in ohms (Ω). Common uses include: 1) Current limiting - protecting sensitive components like LEDs from excessive current. 2) Voltage division - creating a specific voltage at a point in a circuit. 3) Pull-up/pull-down - establishing a default voltage state for inputs. 4) Biasing - setting operating conditions for transistors and other components."
    },
    {
      id: 10,
      category: "Coding & Software",
      question: "What is MicroPython and how does it differ from regular Python?",
      answer: "MicroPython is an implementation of Python 3 optimized to run on microcontrollers with limited resources. Key differences from regular Python include: 1) Smaller footprint - only includes a subset of the standard Python libraries. 2) Hardware-specific modules - adds special libraries for accessing GPIO pins, I2C, SPI, etc. 3) Optimized memory usage - designed to operate with very limited RAM. 4) Real-time capabilities - better support for timing-critical operations."
    },
    {
      id: 11,
      category: "Circuit Design",
      question: "What is a circuit and how does it work?",
      answer: "A circuit is a closed path that allows electricity to flow from a power source through various components and back to the source. For electricity to flow, the circuit must be complete (closed). Basic circuit concepts include: 1) Voltage - the electrical pressure that pushes current through the circuit (measured in volts, V). 2) Current - the flow of electrons through the circuit (measured in amperes, A). 3) Resistance - the opposition to current flow (measured in ohms, Ω)."
    },
    {
      id: 12,
      category: "Projects & Activities",
      question: "What's a good first project for learning electronics?",
      answer: "An excellent first electronics project is an LED circuit with a pushbutton. This simple project teaches fundamental concepts: 1) Basic circuit design - creating a complete path for electricity. 2) Component identification - working with resistors, LEDs, buttons, and wires. 3) Polarity - understanding which way components must be oriented. 4) Circuit analysis - learning how voltage, current, and resistance interact. 5) Input/output relationships - connecting user input (button) to visible output (LED)."
    },
    {
      id: 13,
      category: "Troubleshooting",
      question: "My code uploads but nothing happens - how do I troubleshoot?",
      answer: "When your code uploads but nothing happens: 1) Add print statements at key points to verify code execution and variable values. 2) Verify basic functionality with a simple test program (like blinking an LED). 3) Check hardware connections - ensure pins match your code and components are properly connected. 4) Verify power supply - ensure voltage levels are appropriate and stable. 5) Confirm pin configurations - double-check that pins are set to the correct mode (input/output)."
    },
    {
      id: 14,
      category: "Troubleshooting",
      question: "My microcontroller isn't recognized by my computer - what should I check?",
      answer: "If your microcontroller isn't recognized by your computer: 1) Try a different USB cable - many issues are caused by charge-only cables without data lines. 2) Check different USB ports on your computer - some ports might have power issues. 3) Verify the microcontroller isn't damaged - look for physical damage or overheating components. 4) For Raspberry Pi Pico or HERO board, enter bootloader mode by holding BOOTSEL button while connecting USB."
    },
    {
      id: 15,
      category: "Troubleshooting",
      question: "Why is my sensor giving inconsistent readings?",
      answer: "Inconsistent sensor readings are commonly caused by: 1) Noisy power supply - add decoupling capacitors near the sensor power pins to filter power fluctuations. 2) Interference - keep wires to sensitive analog sensors short and away from motors or high-current lines. 3) Poor grounding - ensure all components share a common ground. 4) Incorrect pull-up/pull-down resistors - check if required resistors are present and correct value."
    }
  ];

  // Filter questions by search and category
  const filteredQuestions = questions.filter(q => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === null || 
      q.category === categories.find(c => c.id === selectedCategory)?.name;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <HelpCircle className="mr-2" />
          <h2 className="text-xl font-bold">Help Center</h2>
        </div>
        <div className="flex">
          <button 
            onClick={onMinimize}
            className="p-1 hover:bg-blue-500 rounded mr-2"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-200 p-4 flex flex-col border-r border-gray-300 overflow-y-auto">
          {/* Search bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search help topics..."
              className="w-full p-2 pl-8 border border-gray-300 rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
          </div>

          {/* Categories */}
          <h3 className="font-bold mb-2 text-gray-700">Categories</h3>
          <div className="space-y-1">
            <div 
              className={`p-2 rounded cursor-pointer ${selectedCategory === null ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Topics
            </div>
            {categories.map(category => (
              <div 
                key={category.id}
                className={`p-2 rounded cursor-pointer ${selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedQuestion ? (
            <div>
              <button 
                onClick={() => setSelectedQuestion(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back to questions
              </button>
              <h3 className="text-xl font-bold mb-2">{selectedQuestion.question}</h3>
              <div className="bg-white p-4 rounded-lg shadow">
                {selectedQuestion.answer.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold mb-4">
                {selectedCategory 
                  ? `${categories.find(c => c.id === selectedCategory)?.name} (${filteredQuestions.length})` 
                  : `All Help Topics (${filteredQuestions.length})`}
              </h3>
              
              {filteredQuestions.length > 0 ? (
                <div className="space-y-2">
                  {filteredQuestions.map(q => (
                    <div 
                      key={q.id}
                      className="p-3 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow"
                      onClick={() => setSelectedQuestion(q)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-blue-700">{q.question}</h4>
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{q.category}</span>
                      </div>
                      <p className="text-gray-600 mt-1 truncate">
                        {q.answer.substring(0, 120)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <HelpCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No matching help topics found. Try adjusting your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenterWindow;