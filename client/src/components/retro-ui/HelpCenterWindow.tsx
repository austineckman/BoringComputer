import React, { useState } from 'react';
import { X, Minimize2, Search, HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';
import './retro-ui.css';

interface HelpCenterWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

interface HelpQuestion {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const picoQuestions: HelpQuestion[] = [
  // Getting Started
  {
    id: 1,
    category: "Getting Started",
    question: "What is the Raspberry Pi Pico?",
    answer: "The Raspberry Pi Pico is a microcontroller board built on the RP2040 chip designed by Raspberry Pi. It features a dual-core Arm Cortex-M0+ processor, 264KB of RAM, and 2MB of flash memory. It's designed for physical computing projects and embedded applications."
  },
  {
    id: 2,
    category: "Getting Started",
    question: "How do I power my Raspberry Pi Pico?",
    answer: "You can power your Raspberry Pi Pico in several ways: via micro USB, through the VSYS pin (1.8V to 5.5V), via the 3V3 pin (not recommended for most cases), or through the VBUS pin when using as a device. The most common method is via the micro USB connection."
  },
  {
    id: 3,
    category: "Getting Started",
    question: "What programming languages can I use with the Pico?",
    answer: "The Raspberry Pi Pico supports MicroPython, CircuitPython, and C/C++. MicroPython is the most accessible for beginners, while C/C++ offers better performance for advanced applications."
  },
  {
    id: 4,
    category: "Getting Started",
    question: "How do I install MicroPython on my Pico?",
    answer: "To install MicroPython: 1) Download the MicroPython UF2 file from the Raspberry Pi website. 2) Hold the BOOTSEL button while connecting the Pico to your computer. 3) Once connected, the Pico will appear as a USB drive. 4) Drag and drop the UF2 file onto the drive. 5) The Pico will automatically reboot with MicroPython installed."
  },
  {
    id: 5,
    category: "Getting Started",
    question: "What IDE can I use to program the Pico?",
    answer: "For MicroPython, you can use Thonny, VS Code with the PyMakr extension, or Mu Editor. For C/C++, you can use the official Raspberry Pi Pico SDK with VS Code, Eclipse, or other C/C++ IDEs."
  },
  
  // Hardware Specifics
  {
    id: 6,
    category: "Hardware Specifics",
    question: "What are the technical specifications of the Raspberry Pi Pico?",
    answer: "The Raspberry Pi Pico features: RP2040 microcontroller chip, Dual-core Arm Cortex-M0+ processor at up to 133 MHz, 264KB SRAM, 2MB Flash memory, 26 GPIO pins, 2 SPI, 2 I2C, 2 UART, 3 ADC (12-bit), 16 PWM channels, USB 1.1, and a temperature sensor."
  },
  {
    id: 7,
    category: "Hardware Specifics",
    question: "What's the difference between Raspberry Pi Pico and Pico W?",
    answer: "The main difference is that the Pico W includes wireless connectivity (2.4GHz 802.11n wireless LAN) via an Infineon CYW43439 chip. Otherwise, they share the same RP2040 microcontroller and pin layout, though the Pico W has a slightly different PCB design and an on-board antenna."
  },
  {
    id: 8,
    category: "Hardware Specifics",
    question: "How many GPIO pins does the Raspberry Pi Pico have?",
    answer: "The Raspberry Pi Pico has 26 multi-function GPIO pins. These can be used as regular GPIO, but many have specialized functions like SPI, I2C, UART, PWM, or ADC capabilities."
  },
  {
    id: 9,
    category: "Hardware Specifics",
    question: "Does the Raspberry Pi Pico have analog inputs?",
    answer: "Yes, the Raspberry Pi Pico has 3 ADC (Analog-to-Digital Converter) channels with 12-bit resolution on GPIO pins 26, 27, and 28. There's also a fourth ADC channel connected to the internal temperature sensor."
  },
  {
    id: 10,
    category: "Hardware Specifics",
    question: "Can the Raspberry Pi Pico connect to the internet?",
    answer: "The standard Raspberry Pi Pico doesn't have built-in internet connectivity. However, the Pico W variant comes with Wi-Fi capabilities. Alternatively, you can add internet connectivity to a standard Pico using external modules like Ethernet shields or ESP8266/ESP32 Wi-Fi modules."
  },
  
  // Programming & Development
  {
    id: 11,
    category: "Programming & Development",
    question: "How do I blink an LED with the Raspberry Pi Pico?",
    answer: "In MicroPython: ```python\nfrom machine import Pin\nimport time\n\nled = Pin(25, Pin.OUT)  # Built-in LED on Pico\n\nwhile True:\n    led.value(1)  # Turn on\n    time.sleep(0.5)\n    led.value(0)  # Turn off\n    time.sleep(0.5)\n```\nConnect an external LED to any GPIO pin and GND with a resistor."
  },
  {
    id: 12,
    category: "Programming & Development",
    question: "How do I read analog values with the Raspberry Pi Pico?",
    answer: "In MicroPython: ```python\nfrom machine import ADC, Pin\nimport time\n\nadc = ADC(Pin(26))  # ADC on GPIO 26\n\nwhile True:\n    reading = adc.read_u16()  # Read value (0-65535)\n    voltage = reading * 3.3 / 65535  # Convert to voltage\n    print(f'ADC: {reading}, Voltage: {voltage:.2f}V')\n    time.sleep(1)\n```\nConnect the analog device to one of the ADC pins (GPIO 26-28)."
  },
  {
    id: 13,
    category: "Programming & Development",
    question: "How do I use PWM with the Raspberry Pi Pico?",
    answer: "In MicroPython: ```python\nfrom machine import Pin, PWM\nimport time\n\npwm = PWM(Pin(15))  # PWM on GPIO 15\npwm.freq(1000)  # 1 kHz frequency\n\nwhile True:\n    for duty in range(0, 65535, 4096):  # Increase brightness\n        pwm.duty_u16(duty)\n        time.sleep(0.1)\n    for duty in range(65535, 0, -4096):  # Decrease brightness\n        pwm.duty_u16(duty)\n        time.sleep(0.1)\n```\nConnect an LED with a resistor to GPIO 15 and GND."
  },
  {
    id: 14,
    category: "Programming & Development",
    question: "How do I use I2C with the Raspberry Pi Pico?",
    answer: "In MicroPython: ```python\nfrom machine import Pin, I2C\nimport time\n\ni2c = I2C(0, scl=Pin(9), sda=Pin(8), freq=100000)  # I2C0 on GPIO 8/9\n\ndevices = i2c.scan()  # Scan for devices\nprint(f'Devices found: {devices}')\n\n# Example writing to an I2C device\n# i2c.writeto(device_address, data)\n\n# Example reading from an I2C device\n# data = i2c.readfrom(device_address, byte_count)\n```\nConnect I2C devices to the SDA and SCL pins with pull-up resistors."
  },
  {
    id: 15,
    category: "Programming & Development",
    question: "How do I connect the Raspberry Pi Pico to Wi-Fi (Pico W)?",
    answer: "In MicroPython (for Pico W): ```python\nimport network\nimport time\n\nssid = 'Your_WiFi_Name'\npassword = 'Your_WiFi_Password'\n\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect(ssid, password)\n\n# Wait for connection or failure\nmax_wait = 10\nwhile max_wait > 0:\n    if wlan.status() < 0 or wlan.status() >= 3:\n        break\n    max_wait -= 1\n    print('Waiting for connection...')\n    time.sleep(1)\n\nif wlan.status() == 3:  # Connection successful\n    print('Connected')\n    print(f'IP Address: {wlan.ifconfig()[0]}')\nelse:  # Connection failed\n    print(f'Connection failed with status: {wlan.status()}')\n```\nThis code is for the Pico W with wireless capabilities."
  },
  
  // Troubleshooting
  {
    id: 16,
    category: "Troubleshooting",
    question: "My Pico isn't recognized by my computer. What should I do?",
    answer: "Try these steps: 1) Check the USB cable - try a different one that supports data transfer. 2) Try a different USB port. 3) Hold down the BOOTSEL button while connecting the Pico. 4) Check if it appears as a USB drive. 5) If available, try connecting to a different computer. 6) Check if the Pico is damaged or if the USB connector is loose."
  },
  {
    id: 17,
    category: "Troubleshooting",
    question: "How do I reset my Raspberry Pi Pico?",
    answer: "To perform a soft reset, press the RUN pin to GND momentarily or call machine.reset() in MicroPython. To completely reset (reflash) the Pico: 1) Hold the BOOTSEL button while connecting it to your computer. 2) Once it shows up as a USB drive, drag and drop a new UF2 file onto it."
  },
  {
    id: 18,
    category: "Troubleshooting",
    question: "My MicroPython program doesn't run on startup. Why?",
    answer: "For a MicroPython program to run automatically on startup, you need to save it as 'main.py' on the Pico. Check that: 1) Your file is correctly named 'main.py' (case-sensitive). 2) You've properly saved it to the Pico, not just in your editor. 3) There are no syntax errors in your code. 4) You're not in bootloader mode (BOOTSEL pressed during power-up)."
  },
  {
    id: 19,
    category: "Troubleshooting",
    question: "Why is my Pico running hot?",
    answer: "The Pico might run warm during normal operation, but it shouldn't be hot. Possible causes: 1) Running the processor at high clock speeds (overclocking). 2) A short circuit in your project. 3) Excessive current draw from connected components. 4) Software busy-loops consuming power. 5) Damaged component. Disconnect external components to isolate the issue and check your code for infinite loops."
  },
  {
    id: 20,
    category: "Troubleshooting",
    question: "I'm getting inconsistent/unreliable behavior from my GPIO pins. Why?",
    answer: "Possible causes include: 1) Floating inputs - add pull-up/pull-down resistors. 2) Incorrect pin numbering - double-check your pin assignments. 3) Exceeding maximum current (3mA recommended per pin). 4) Not using a common ground between devices. 5) Interference from other components. 6) Software timing issues. 7) Powering issues - ensure stable power supply. 8) Using a pin for multiple functions simultaneously."
  },
  
  // Projects & Applications
  {
    id: 21,
    category: "Projects & Applications",
    question: "What are some beginner projects for the Raspberry Pi Pico?",
    answer: "Good beginner projects include: 1) LED blinking and patterns. 2) Button input and LED control. 3) Reading sensors (temperature, light, motion). 4) Simple LCD or OLED display projects. 5) Servo motor control. 6) Simple sound projects with buzzers. 7) Traffic light simulator. 8) Small game on an LED matrix. 9) Data logging projects. 10) Remote control LED using buttons."
  },
  {
    id: 22,
    category: "Projects & Applications",
    question: "Can I use the Raspberry Pi Pico for IoT projects?",
    answer: "Yes, especially with the Pico W which has Wi-Fi capability. IoT projects include: 1) Weather stations sending data to cloud services. 2) Remote monitoring systems. 3) Home automation controls. 4) Smart plant watering systems. 5) Energy monitoring. For the standard Pico, you'll need to add connectivity using modules like ESP8266/ESP32 or Ethernet shields."
  },
  {
    id: 23,
    category: "Projects & Applications",
    question: "How can I interface the Pico with different sensors?",
    answer: "For digital sensors: Connect to GPIO pins and use digital read/write. For analog sensors: Connect to ADC pins (GP26-28) and use analog read. For I2C sensors: Connect to I2C pins and use the I2C library. For SPI sensors: Connect to SPI pins and use the SPI library. Most sensors will have specific libraries in MicroPython/CircuitPython or code examples for C/C++."
  },
  {
    id: 24,
    category: "Projects & Applications",
    question: "Can I use the Raspberry Pi Pico for audio projects?",
    answer: "Yes, though with limitations. The Pico can generate simple tones and sounds using PWM output connected to a speaker or buzzer. With additional hardware like I2S DACs or audio shields, you can achieve better audio quality. Projects can include simple sound generators, music players, audio recorders (with ADC), MIDI controllers, and basic synthesizers. For high-quality audio, additional hardware is recommended."
  },
  {
    id: 25,
    category: "Projects & Applications",
    question: "Can I use the Raspberry Pi Pico for robotics?",
    answer: "Yes, the Pico is suitable for small to medium robotics projects. It can control motors (using motor drivers), read sensors, process inputs, and make decisions. You can build line-following robots, obstacle-avoiding robots, remote-controlled vehicles, robotic arms, or walking robots. For more complex robotics, you might need additional microcontrollers or a full Raspberry Pi computer."
  },
  
  // Integration & Expansion
  {
    id: 26,
    category: "Integration & Expansion",
    question: "Can I connect the Raspberry Pi Pico to a Raspberry Pi?",
    answer: "Yes, there are several ways to connect them: 1) Via USB - the simplest method, where the Pico appears as a USB device. 2) Via UART - connect Pico UART pins to Raspberry Pi UART/GPIO pins. 3) Via I2C or SPI - for more complex data exchange. 4) Using GPIO pins directly between devices with appropriate level shifting if needed. This combination can be powerful, with the Pico handling real-time I/O and the Raspberry Pi providing more processing power."
  },
  {
    id: 27,
    category: "Integration & Expansion",
    question: "What add-on boards are available for the Raspberry Pi Pico?",
    answer: "There are many add-on boards for the Pico: 1) Pico Display Pack - small LCD display. 2) Pico Audio Pack - audio output. 3) Pico Unicorn Pack - RGB LED matrix. 4) Pico Explorer Base - display, buttons, and prototyping area. 5) Pico Omnibus - multiple sensors. 6) Pico RGB Keypad. 7) Pico Wireless Pack (pre-Pico W). 8) Motor driver boards. 9) Sensor boards for various applications. 10) Breakout Garden boards from Pimoroni. 11) AdaFruit Feather-compatible boards."
  },
  {
    id: 28,
    category: "Integration & Expansion",
    question: "How do I add more memory to the Raspberry Pi Pico?",
    answer: "While you can't directly increase the internal RAM/flash, you can expand storage/memory through: 1) External SPI flash chips. 2) microSD card adapters via SPI. 3) External EEPROM or FRAM via I2C or SPI. 4) External SRAM chips via SPI. For code and data storage, microSD cards are often the most convenient option, though they require additional code to interface with the filesystem."
  },
  {
    id: 29,
    category: "Integration & Expansion",
    question: "Can I run a display with the Raspberry Pi Pico?",
    answer: "Yes, the Pico can drive various displays: 1) Character LCDs via GPIO or I2C. 2) OLED displays via I2C or SPI. 3) TFT/LCD displays via SPI. 4) E-ink/E-paper displays. 5) LED matrices. For simplicity, I2C displays like SSD1306 OLEDs are popular choices with readily available libraries. The Pico can also drive larger displays but may struggle with high-resolution or color-intensive applications."
  },
  {
    id: 30,
    category: "Integration & Expansion",
    question: "Can I connect multiple Picos together?",
    answer: "Yes, you can connect multiple Picos in several ways: 1) Via UART - simple serial communication. 2) Via I2C - one as master, others as slaves. 3) Via SPI - faster data transfer. 4) Using direct GPIO connections for simple signaling. 5) Using CAN bus interfaces for robust communication. 6) For Pico W, you can use WiFi for wireless communication. This allows for distributed processing and more complex systems."
  },
  
  // Performance & Limitations
  {
    id: 31,
    category: "Performance & Limitations",
    question: "How fast is the Raspberry Pi Pico's processor?",
    answer: "The RP2040 chip on the Pico has a dual-core Arm Cortex-M0+ processor that runs at up to 133 MHz by default. It can be overclocked to higher frequencies (up to around 250 MHz in some cases), though this is not officially supported and may cause stability issues or reduce the lifespan of the device."
  },
  {
    id: 32,
    category: "Performance & Limitations",
    question: "What are the power limitations of the Raspberry Pi Pico?",
    answer: "The Pico's GPIO pins should not source/sink more than 3mA per pin for reliable operation (absolute maximum is 12mA). Total current across all pins should be kept under 50mA. The 3.3V output pin can supply up to 300mA. When powered via USB, the total available current is typically around 500mA. For higher power requirements, external power management is necessary."
  },
  {
    id: 33,
    category: "Performance & Limitations",
    question: "Can the Raspberry Pi Pico run Linux?",
    answer: "No, the Raspberry Pi Pico cannot run Linux. The RP2040 has only 264KB of RAM, which is far too little for a Linux kernel. Additionally, it lacks the memory management hardware required by Linux. The Pico runs firmware directly on the processor without an operating system or with a lightweight RTOS (Real-Time Operating System) for specific applications."
  },
  {
    id: 34,
    category: "Performance & Limitations",
    question: "What's the difference between the Pico and a full Raspberry Pi?",
    answer: "The main differences are: 1) The Pico is a microcontroller while Raspberry Pi is a single-board computer. 2) The Pico has no operating system; Raspberry Pi runs Linux. 3) Pico has vastly less RAM/CPU power. 4) Pico has no video output, HDMI, or camera interfaces. 5) Pico focuses on GPIO and real-time control; Raspberry Pi offers broader computing capabilities. 6) Pico is much cheaper and uses significantly less power. 7) Pico offers deterministic timing for real-time applications."
  },
  {
    id: 35,
    category: "Performance & Limitations",
    question: "How much power does the Raspberry Pi Pico consume?",
    answer: "The Pico's power consumption varies based on usage: 1) At 3.3V, idle current is around 1.4mA. 2) When running code at full 133MHz, typically 20-25mA. 3) In sleep mode, around 0.5mA. 4) In dormant mode (deeper sleep), approximately 0.1mA. 5) The Pico W uses slightly more power due to the wireless chip, with WiFi operations adding 40-100mA when active. Power usage increases with higher clock speeds, GPIO usage, and connected peripherals."
  },
  
  // Interfaces & Communication
  {
    id: 36,
    category: "Interfaces & Communication",
    question: "How do I use SPI on the Raspberry Pi Pico?",
    answer: "In MicroPython: ```python\nfrom machine import Pin, SPI\n\n# Initialize SPI0 on default pins (SCK=GP18, MOSI=GP19, MISO=GP16)\nspi = SPI(0, baudrate=1000000, polarity=0, phase=0,\n         sck=Pin(18), mosi=Pin(19), miso=Pin(16))\n\n# Create a CS (chip select) pin\ncs = Pin(17, Pin.OUT)\ncs.value(1)  # Deselect device\n\n# Write data\ncs.value(0)  # Select device\nspi.write(bytes([0x01, 0x02, 0x03]))  # Send bytes\ncs.value(1)  # Deselect device\n\n# Read data\ncs.value(0)\ndata = spi.read(3)  # Read 3 bytes\ncs.value(1)\nprint(data)\n```\nConnect SPI devices to the appropriate pins with CS controlled separately."
  },
  {
    id: 37,
    category: "Interfaces & Communication",
    question: "How do I use UART on the Raspberry Pi Pico?",
    answer: "In MicroPython: ```python\nfrom machine import Pin, UART\nimport time\n\n# Initialize UART0 on pins GP0 (TX) and GP1 (RX)\nuart = UART(0, baudrate=9600, tx=Pin(0), rx=Pin(1))\n\n# Send data\nuart.write('Hello, UART\r\n')\n\n# Read data with timeout\ndef read_uart():\n    data = bytes()\n    start = time.ticks_ms()\n    # Wait for data with 1 second timeout\n    while (time.ticks_ms() - start < 1000):\n        if uart.any():\n            data += uart.read()\n    return data\n    \nprint(f'Received: {read_uart()}')\n```\nConnect TX to the receiver's RX and RX to the transmitter's TX, with a common ground."
  },
  {
    id: 38,
    category: "Interfaces & Communication",
    question: "Can the Raspberry Pi Pico communicate via Bluetooth?",
    answer: "The standard Raspberry Pi Pico and Pico W do not have built-in Bluetooth. However, you can add Bluetooth functionality by connecting an external Bluetooth module such as HC-05, HC-06, or other UART-based Bluetooth modules via the UART interface. For more advanced BLE (Bluetooth Low Energy) applications, you might use modules like the nRF52832 or ESP32 connected to the Pico."
  },
  {
    id: 39,
    category: "Interfaces & Communication",
    question: "How can I use the Raspberry Pi Pico with MQTT (for IoT)?",
    answer: "For the Pico W with MicroPython: ```python\nfrom umqtt.simple import MQTTClient\nimport network\nimport time\n\n# Connect to WiFi first (see WiFi example)\nssid = 'Your_WiFi'\npassword = 'Your_Password'\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect(ssid, password)\nwhile not wlan.isconnected():\n    time.sleep(1)\n\n# MQTT Setup\nclient_id = 'pico_w'\nmqtt_server = 'broker.hivemq.com'  # Public broker for testing\ntopic = b'pico/test'\n\ndef mqtt_connect():\n    client = MQTTClient(client_id, mqtt_server, keepalive=60)\n    client.connect()\n    print('Connected to MQTT broker')\n    return client\n\ndef publish_message():\n    client = mqtt_connect()\n    while True:\n        client.publish(topic, f'Hello from Pico W: {time.time()}')\n        time.sleep(10)\n\npublish_message()\n```\nFor the standard Pico, additional hardware for internet connectivity is required."
  },
  {
    id: 40,
    category: "Interfaces & Communication",
    question: "How do I communicate with the Pico using USB?",
    answer: "There are several USB communication methods: 1) USB Serial - The simplest, using Pico as a USB serial device. Use `machine.UART(0, 115200)` for REPL or `sys.stdin/stdout` for Python scripts. 2) USB CDC (Communications Device Class) - For custom serial communication. 3) USB MSC (Mass Storage Class) - Make Pico appear as a storage device. 4) USB HID (Human Interface Device) - Make Pico function as a keyboard, mouse, or game controller. For C/C++, use the TinyUSB library in the Pico SDK. For MicroPython, use built-in libraries or modules like `usb_hid`."
  },
  
  // HERO-Specific Questions
  {
    id: 41,
    category: "HERO Board Basics",
    question: "What is the HERO board?",
    answer: "The HERO (Hardware Educational Resource Organizer) board is an educational development platform based on the Raspberry Pi Pico. It's designed to teach electronics and programming by providing a wide range of built-in components and connectors in an easy-to-use format. It includes LEDs, buttons, sensors, and expansion capabilities while maintaining compatibility with the underlying Raspberry Pi Pico."
  },
  {
    id: 42,
    category: "HERO Board Basics",
    question: "What components are included on the HERO board?",
    answer: "The HERO board includes: RGB LEDs, regular LEDs, buttons, a photoresistor for light detection, a temperature sensor, a potentiometer, a buzzer for sound, multiple connectors for expansion (Grove, Qwiic, GPIO breakouts), a breadboard area for custom circuits, and the Raspberry Pi Pico (or Pico W) as its core processor. It's designed to provide a comprehensive learning platform without requiring additional components for basic projects."
  },
  {
    id: 43,
    category: "HERO Board Basics",
    question: "How do I power the HERO board?",
    answer: "The HERO board can be powered via: 1) The USB connector on the Raspberry Pi Pico (most common method). 2) The barrel jack connector on the HERO board (7-12V DC). 3) The BATT terminals using a battery pack (for portable projects). Always ensure you're using the correct voltage for your chosen power method to avoid damaging the board."
  },
  {
    id: 44,
    category: "HERO Board Basics",
    question: "Is the HERO board compatible with Arduino code?",
    answer: "While the HERO board is based on the Raspberry Pi Pico (RP2040) rather than an Arduino microcontroller, it can be programmed using the Arduino IDE with the appropriate board package for the RP2040. This allows you to use Arduino-style code and many Arduino libraries. However, some hardware-specific Arduino functions may require adaptation, and pin references will need to use the HERO/Pico pin numbering."
  },
  {
    id: 45,
    category: "HERO Board Basics",
    question: "How do I get started with my HERO board?",
    answer: "To get started: 1) Connect the board to your computer via USB. 2) Choose a programming language (MicroPython recommended for beginners). 3) Install MicroPython on the Pico if needed. 4) Install an IDE like Thonny. 5) Try basic examples like blinking the onboard LEDs. 6) Explore the built-in components one by one. 7) Check the HERO documentation for pin mappings and example code. 8) Join the community forums for support and project ideas. 9) Try the guided learning projects if available."
  },
  
  // HERO Programming
  {
    id: 46,
    category: "HERO Programming",
    question: "How do I control the onboard LEDs of the HERO board?",
    answer: "In MicroPython: ```python\nfrom machine import Pin\nimport time\n\n# Regular LED (example pin, check documentation for exact pin)\nled = Pin(15, Pin.OUT)\n\n# Basic on/off\nled.value(1)  # Turn on\ntime.sleep(1)\nled.value(0)  # Turn off\n\n# For RGB LED, control each color channel separately\nred = Pin(16, Pin.OUT)\ngreen = Pin(17, Pin.OUT)\nblue = Pin(18, Pin.OUT)\n\n# Make purple (red + blue)\nred.value(1)\ngreen.value(0)\nblue.value(1)\n```\nCheck the HERO documentation for the exact pin numbers assigned to each LED."
  },
  {
    id: 47,
    category: "HERO Programming",
    question: "How do I read the buttons on the HERO board?",
    answer: "In MicroPython: ```python\nfrom machine import Pin\nimport time\n\n# Connect button to a GPIO pin with pull-up enabled\nbutton = Pin(14, Pin.IN, Pin.PULL_UP)\n\n# Basic button read (pull-up means button pressed = 0)\nwhile True:\n    if button.value() == 0:\n        print('Button pressed!')\n    else:\n        print('Button released')\n    time.sleep(0.1)\n    \n# Debounced button read\ndef debounced_value(pin, delay_ms=20):\n    val = pin.value()\n    time.sleep_ms(delay_ms)\n    return val == pin.value() and val\n\nwhile True:\n    if not debounced_value(button):  # Remember pull-up (pressed = 0)\n        print('Button pressed (debounced)')\n    time.sleep(0.1)\n```\nCheck the HERO documentation for the exact pin numbers assigned to each button."
  },
  {
    id: 48,
    category: "HERO Programming",
    question: "How do I use the photoresistor on the HERO board?",
    answer: "In MicroPython: ```python\nfrom machine import ADC, Pin\nimport time\n\n# Connect photoresistor to an ADC pin (check documentation for exact pin)\nlight_sensor = ADC(Pin(26))\n\nwhile True:\n    # Read raw value (0-65535)\n    raw_value = light_sensor.read_u16()\n    # Calculate percentage (higher = more light)\n    percentage = raw_value / 65535 * 100\n    \n    print(f'Light level: {raw_value} raw, {percentage:.1f}%')\n    \n    # Basic light detection\n    if raw_value > 30000:\n        print('It\'s bright!')\n    else:\n        print('It\'s dark')\n        \n    time.sleep(1)\n```\nThe exact threshold values will depend on your specific board and environment."
  },
  {
    id: 49,
    category: "HERO Programming",
    question: "How do I use the temperature sensor on the HERO board?",
    answer: "In MicroPython (using the internal temperature sensor): ```python\nfrom machine import ADC\nimport time\n\n# The temperature sensor is connected to the internal ADC\ntemp_sensor = ADC(4)\n\nconversion_factor = 3.3 / 65535\n\nwhile True:\n    # Read sensor\n    reading = temp_sensor.read_u16() * conversion_factor\n    \n    # Convert to Celsius (see RP2040 datasheet for exact formula)\n    temperature_c = 27 - (reading - 0.706) / 0.001721\n    \n    # Convert to Fahrenheit if needed\n    temperature_f = temperature_c * 9/5 + 32\n    \n    print(f'Temperature: {temperature_c:.1f}°C, {temperature_f:.1f}°F')\n    time.sleep(2)\n```\nFor external temperature sensors on the HERO board, refer to the specific sensor documentation."
  },
  {
    id: 50,
    category: "HERO Programming",
    question: "How do I make sounds with the buzzer on the HERO board?",
    answer: "In MicroPython: ```python\nfrom machine import Pin, PWM\nimport time\n\n# Connect buzzer to a PWM-capable pin (check documentation)\nbuzzer_pin = Pin(20)\nbuzzer = PWM(buzzer_pin)\n\n# Play a simple tone\ndef play_tone(frequency, duration_ms):\n    buzzer.freq(frequency)\n    buzzer.duty_u16(32768)  # 50% duty cycle\n    time.sleep_ms(duration_ms)\n    buzzer.duty_u16(0)  # Turn off\n\n# Play a simple melody\nnotes = [262, 294, 330, 349, 392, 440, 494, 523]  # C4 to C5\nfor note in notes:\n    play_tone(note, 300)\n    time.sleep_ms(100)\n    \n# Play a beep pattern\nfor _ in range(3):\n    play_tone(1000, 200)  # Short beep\n    time.sleep_ms(200)\n\nbuzzer.deinit()  # Clean up PWM when done\n```\nAdjust the pin number based on your HERO board documentation."
  },
  
  // HERO Expansion & Projects
  {
    id: 51,
    category: "HERO Expansion & Projects",
    question: "How do I use the Grove connectors on the HERO board?",
    answer: "The Grove connectors provide standardized interfaces for sensors and actuators: 1) Identify which Grove port you want to use (digital, analog, I2C, etc.). 2) Connect your Grove module using the appropriate cable. 3) In code, use the corresponding pins for that port. For example, for I2C Grove: ```python\nfrom machine import Pin, I2C\ni2c = I2C(0, scl=Pin(17), sda=Pin(16))  # Use pins matching your Grove I2C port\ndevices = i2c.scan()  # Find connected I2C devices\nprint(devices)\n```\nCheck your HERO documentation for the exact pin mappings for each Grove connector."
  },
  {
    id: 52,
    category: "HERO Expansion & Projects",
    question: "How do I use the QWIIC/Stemma QT connector on the HERO board?",
    answer: "The QWIIC/Stemma QT connector provides an I2C interface using a standardized connector: 1) Connect your QWIIC module using the appropriate cable. 2) In code, use the I2C pins assigned to the QWIIC port. For example: ```python\nfrom machine import Pin, I2C\n\n# Use pins matching the QWIIC connector (usually I2C0 or I2C1)\ni2c = I2C(1, scl=Pin(19), sda=Pin(18))\n\n# Scan for connected devices\ndevices = i2c.scan()\nprint(f'Found devices at addresses: {[hex(d) for d in devices]}')\n\n# Access a specific device (example: SSD1306 display)\n# display = SSD1306_I2C(128, 64, i2c)\n```\nCheck your HERO documentation for the exact I2C pins used by the QWIIC connector."
  },
  {
    id: 53,
    category: "HERO Expansion & Projects",
    question: "What beginner projects can I do with just the HERO board?",
    answer: "The HERO board has enough onboard components for many beginner projects: 1) Light-responsive LED system using the photoresistor. 2) Temperature-based alarm with the temperature sensor and buzzer. 3) Musical instrument using buttons and buzzer. 4) Simple reaction game with LEDs and buttons. 5) Password entry system with button combinations. 6) Light meter with LEDs as indicators. 7) Morse code encoder/decoder. 8) Temperature-logging system. 9) Timer with visual and audio feedback. 10) Simple light animation sequences with multiple LEDs."
  },
  {
    id: 54,
    category: "HERO Expansion & Projects",
    question: "How do I connect servos to the HERO board?",
    answer: "Connecting servos to the HERO board: 1) Connect the servo's power wire (usually red) to 5V if it's a 5V servo, or to 3.3V if it's compatible. 2) Connect the ground wire (usually black or brown) to GND. 3) Connect the signal wire (usually yellow, orange, or white) to a PWM-capable GPIO pin. 4) In MicroPython: ```python\nfrom machine import Pin, PWM\nimport time\n\n# Initialize PWM for servo control\nservo = PWM(Pin(15))  # Choose a PWM-capable pin\nservo.freq(50)  # 50Hz frequency for standard servos\n\n# Function to set angle (0-180 degrees)\ndef set_angle(angle):\n    # Convert angle to duty cycle (typically 1ms-2ms pulse within 20ms period)\n    # Adjust these values for your specific servo\n    duty = int(3276 + (6553 * angle / 180))  # Maps 0-180 to roughly 1ms-2ms\n    servo.duty_u16(duty)\n\n# Move the servo to various positions\nfor angle in [0, 45, 90, 135, 180, 90, 0]:\n    set_angle(angle)\n    print(f'Moved to {angle}°')\n    time.sleep(1)\n\nservo.deinit()  # Clean up when done\n```\nUse an external power source for multiple servos to avoid overloading the board."
  },
  {
    id: 55,
    category: "HERO Expansion & Projects",
    question: "Can I build a robot with the HERO board?",
    answer: "Yes, the HERO board is well-suited for robotics projects: 1) For basic movement, connect motors through an H-bridge or motor driver. 2) Use the onboard buttons for manual control. 3) Incorporate the photoresistor for light-following behavior. 4) Use the GPIO pins to connect ultrasonic or IR sensors for obstacle detection. 5) The buzzer can provide audio feedback. 6) For more advanced projects, add servos for articulated parts or additional sensors via the expansion connectors. Remember that the HERO board itself can't supply enough current for motors, so use an external power source connected to the motor driver."
  },
  
  // HERO Software & Firmware
  {
    id: 56,
    category: "HERO Software & Firmware",
    question: "What programming languages can I use with the HERO board?",
    answer: "The HERO board supports the same languages as the Raspberry Pi Pico: 1) MicroPython - Most beginner-friendly, good documentation and libraries. 2) CircuitPython - AdaFruit's Python variant with excellent library support. 3) C/C++ - Using the Raspberry Pi Pico SDK for maximum performance. 4) Arduino C++ - Using the Arduino IDE with RP2040 board support. 5) Rust - For those interested in memory-safe systems programming. MicroPython is recommended for beginners, while C/C++ offers the best performance for advanced applications."
  },
  {
    id: 57,
    category: "HERO Software & Firmware",
    question: "Are there special libraries for the HERO board?",
    answer: "Yes, there are libraries designed specifically for the HERO board: 1) The HERO MicroPython library provides easy access to onboard components through simplified functions. 2) The HERO Arduino library offers similar functionality for Arduino IDE users. These libraries abstract the pin mappings and component specifics, allowing you to use functions like `hero.led1.on()` instead of needing to know the exact GPIO pin. Check the HERO documentation or GitHub repository for the latest libraries and installation instructions."
  },
  {
    id: 58,
    category: "HERO Software & Firmware",
    question: "How do I update the firmware on my HERO board?",
    answer: "To update firmware on the HERO board: 1) The firmware is actually on the Raspberry Pi Pico, so the process follows standard Pico firmware updates. 2) Download the desired firmware file (UF2 format) from the official sources. 3) Hold the BOOTSEL button on the Pico while connecting it to your computer. 4) The Pico will appear as a USB drive. 5) Drag and drop the UF2 file onto this drive. 6) The Pico will automatically reboot with the new firmware. Never disconnect power during the update process, and always use firmware from trusted sources."
  },
  {
    id: 59,
    category: "HERO Software & Firmware",
    question: "Where can I find example code for the HERO board?",
    answer: "You can find HERO board example code from several sources: 1) The official HERO documentation (likely includes basic examples for all components). 2) The HERO GitHub repository, which typically contains the most up-to-date examples. 3) The Inventr.io website and community forum. 4) Educational courses designed for the HERO board. 5) Community-created examples on platforms like GitHub, Hackster.io, or Instructables. Start with the basic examples that demonstrate each onboard component before moving to more complex projects."
  },
  {
    id: 60,
    category: "HERO Software & Firmware",
    question: "How do I save my code to run on HERO board startup?",
    answer: "To make your code run automatically when the HERO board powers on: 1) In MicroPython, save your program as 'main.py' in the root directory of the Pico. 2) In CircuitPython, save your program as 'code.py' in the root directory. 3) If using C/C++, your compiled program will automatically run on startup. For MicroPython, you can use Thonny to save files directly to the Pico by selecting 'Raspberry Pi Pico' as the target in the bottom-right corner of the IDE, then saving your file as 'main.py'."
  },
  
  // HERO Troubleshooting
  {
    id: 61,
    category: "HERO Troubleshooting",
    question: "My HERO board isn't being detected by my computer. What should I do?",
    answer: "Try these steps: 1) Check the USB cable - use a data-capable cable, not just a charging cable. 2) Try different USB ports on your computer. 3) Hold down the BOOTSEL button while connecting the board. 4) Check if the Pico appears as a USB mass storage device when in bootloader mode. 5) Try a different computer if available. 6) Make sure the Pico is properly seated in the HERO board. 7) Look for physical damage on the USB connector. 8) If using barrel jack power, try USB power instead. 9) If all else fails, the Pico may need to be reflashed or replaced."
  },
  {
    id: 62,
    category: "HERO Troubleshooting",
    question: "The onboard components on my HERO board aren't working. What should I check?",
    answer: "Check these potential issues: 1) Verify you're using the correct pin numbers for your board version (check documentation). 2) Ensure you've properly initialized the pins (input/output mode). 3) For analog components, verify you're using ADC pins correctly. 4) Check your power supply is adequate (5V USB or appropriate barrel jack voltage). 5) Look for physical damage to the board or components. 6) Try a simple test program (like LED blink) to verify basic functionality. 7) For I2C devices, try an I2C scanner to check connectivity. 8) Reset the board by power cycling or using the reset button if available. 9) Reflash MicroPython or your firmware if software issues are suspected."
  },
  {
    id: 63,
    category: "HERO Troubleshooting",
    question: "Why is my code not running on the HERO board?",
    answer: "Common reasons code doesn't run: 1) Not saved correctly - MicroPython code should be saved as 'main.py' to run automatically. 2) Syntax errors or exceptions in your code. 3) Incorrect pin assignments for your board version. 4) Missing required libraries or imports. 5) File saved in the wrong location (not in the root directory). 6) Board in bootloader mode (appears as USB drive). 7) Power issues causing resets or unstable operation. 8) Previous code still running in an infinite loop. Try reconnecting while holding BOOTSEL, then reload your code. Print debug statements to help identify where code execution stops."
  },
  {
    id: 64,
    category: "HERO Troubleshooting",
    question: "How do I debug my HERO board projects?",
    answer: "Debugging techniques for HERO projects: 1) Add print statements throughout your code to track execution flow and variable values. 2) Use LEDs as visual debug indicators (e.g., turn on an LED at different code stages). 3) Use the REPL (Read-Eval-Print Loop) in MicroPython/CircuitPython to test commands interactively. 4) In Thonny IDE, use the debugger to step through MicroPython code. 5) For hardware issues, use a multimeter to check voltages and connections. 6) Simplify your code to isolate problems - comment out sections to find where issues occur. 7) Check for common errors like pin mode initialization, pull-up/pull-down settings, or timing issues. 8) Read error messages carefully - they often point directly to the problem."
  },
  {
    id: 65,
    category: "HERO Troubleshooting",
    question: "Why does my HERO board reset unexpectedly?",
    answer: "Unexpected resets can be caused by: 1) Power issues - insufficient current from USB port or unstable power supply. 2) Voltage drops when activating high-current components like motors or multiple LEDs. 3) Short circuits in your wiring or connected components. 4) Memory errors or stack overflows in your code. 5) Watchdog timer activations if enabled in your code. 6) Thermal issues if the board is overheating. 7) Electromagnetic interference from nearby devices. Try using a powered USB hub or external power supply, simplify your circuit, add decoupling capacitors for stability, and check for code issues like infinite recursion or memory leaks."
  },
  
  // HERO Community & Support
  {
    id: 66,
    category: "HERO Community & Support",
    question: "Where can I get help with my HERO board?",
    answer: "Help resources for the HERO board include: 1) Official documentation and guides from Inventr.io. 2) The Inventr.io community forum where you can ask questions and share projects. 3) Discord servers dedicated to HERO/Pico development. 4) The Raspberry Pi Pico forums (for underlying hardware issues). 5) Stack Exchange or Reddit communities like r/raspberrypipico. 6) Tutorial sites and YouTube channels focused on Pico/HERO projects. 7) GitHub repositories with example code and issue trackers. 8) Local maker spaces or STEM education groups that might use the HERO board."
  },
  {
    id: 67,
    category: "HERO Community & Support",
    question: "Are there learning resources specifically for the HERO board?",
    answer: "Yes, there are dedicated learning resources for the HERO board: 1) Official tutorials and guides on the Inventr.io website. 2) The 30 Days Lost in Space curriculum - a narrative-based learning path. 3) Video tutorials on the official YouTube channel. 4) Downloadable project guides with step-by-step instructions. 5) Circuit diagrams and explanations for each onboard component. 6) Example code repositories on GitHub. 7) Community-created tutorials and project ideas. 8) Educational materials designed for classroom use with the HERO board. Most beginners start with the basic component examples before moving to the narrative-based challenges."
  },
  {
    id: 68,
    category: "HERO Community & Support",
    question: "Is there a curriculum available for teaching with the HERO board?",
    answer: "Yes, there are structured curricula for the HERO board: 1) The flagship '30 Days Lost in Space' curriculum - a narrative adventure where students complete missions using progressively more advanced electronics concepts. 2) Classroom-ready lesson plans with learning objectives, materials lists, and assessment opportunities. 3) Self-paced learning modules covering fundamentals through advanced topics. 4) STEM education packages with teacher guides and student workbooks. 5) Advanced project extensions for students who complete the basic curriculum. These materials are designed to make electronics education engaging and accessible for various age groups and skill levels."
  },
  {
    id: 69,
    category: "HERO Community & Support",
    question: "Can I share my HERO board projects with others?",
    answer: "Yes, there are several ways to share your HERO board projects: 1) The Inventr.io community forum has a projects section. 2) Create project pages on sites like Hackster.io, Instructables, or GitHub. 3) Share videos or build logs on YouTube, TikTok, or social media. 4) Participate in HERO board challenges or competitions. 5) Present at maker faires or STEM events. 6) Contribute to the official examples repository via pull requests. When sharing, include your code, clear wiring diagrams or photos, a parts list, and step-by-step instructions so others can reproduce your project."
  },
  {
    id: 70,
    category: "HERO Community & Support",
    question: "What is the '30 Days Lost in Space' curriculum?",
    answer: "'30 Days Lost in Space' is an educational curriculum built around the HERO board: 1) It's a narrative-based learning experience where students play the role of astronauts stranded on Mars. 2) Through 30 missions (days), students build increasingly complex electronic systems to survive and eventually escape. 3) Each day introduces new components and programming concepts in a contextual, problem-solving format. 4) Students learn about LEDs, buttons, sensors, motors, and more while applying them to specific challenges. 5) The curriculum includes detailed instructions, code examples, and explanations of the underlying concepts. It's designed to make electronics learning engaging through storytelling and progressive skill-building."
  },
  
  // HERO Advanced Topics
  {
    id: 71,
    category: "HERO Advanced Topics",
    question: "Can I use the HERO board for machine learning projects?",
    answer: "Yes, though with limitations due to the Pico's constraints: 1) TinyML frameworks like TensorFlow Lite for Microcontrollers can run on the Pico. 2) Simple ML models for classification, anomaly detection, or pattern recognition are feasible. 3) Models must be small (under ~200KB) and optimized for microcontrollers. 4) Training is done on a computer, then the model is deployed to the HERO board. 5) Applications include gesture recognition, simple voice commands, vibration analysis, or basic computer vision with external cameras. Example projects include sound recognition using the onboard microphone or custom gesture control using accelerometers connected to the expansion ports."
  },
  {
    id: 72,
    category: "HERO Advanced Topics",
    question: "How can I optimize my code for better performance on the HERO board?",
    answer: "Performance optimization techniques: 1) Use C/C++ instead of MicroPython for speed-critical applications. 2) Utilize both cores of the RP2040 with multithreading (using _thread in MicroPython or FreeRTOS in C/C++). 3) Use the PIO (Programmable I/O) for timing-critical operations. 4) Minimize floating-point operations; use fixed-point math where possible. 5) Optimize memory usage by reusing buffers and avoiding memory fragmentation. 6) Use direct register access rather than high-level functions when speed is critical. 7) Implement efficient algorithms with O(1) or O(log n) complexity where possible. 8) For MicroPython, pre-compile to bytecode using mpy-cross. 9) Use inline assembly for absolutely critical sections in C/C++."
  },
  {
    id: 73,
    category: "HERO Advanced Topics",
    question: "How do I use both cores of the RP2040 on the HERO board?",
    answer: "To use both cores: In MicroPython: ```python\nimport _thread\nimport time\n\n# Shared variables (consider synchronization mechanisms if needed)\ncounter = 0\n\n# Function for second core\ndef second_core_task():\n    global counter\n    while True:\n        counter += 1\n        print(f'Core 1: counter = {counter}')\n        time.sleep(1)\n\n# Start the second core\nsecond_thread = _thread.start_new_thread(second_core_task, ())\n\n# Main core continues with its work\nwhile True:\n    print(f'Core 0: counter = {counter}')\n    time.sleep(2)\n```\nIn C/C++ with the Pico SDK, use the multicore functions in `pico/multicore.h`. Be careful with shared resources and consider using mutexes, queues, or semaphores for synchronization."
  },
  {
    id: 74,
    category: "HERO Advanced Topics",
    question: "How do I use the PIO (Programmable I/O) feature with the HERO board?",
    answer: "The PIO (Programmable I/O) lets you create custom digital interfaces. In MicroPython: ```python\nfrom machine import Pin\nfrom rp2 import PIO, StateMachine, asm_pio\nimport time\n\n# Define a PIO program (example: blink LED fast)\n@asm_pio(set_init=PIO.OUT_LOW)\ndef blink_fast():\n    set(pins, 1) [1]  # Turn on for 2 cycles\n    set(pins, 0) [1]  # Turn off for 2 cycles\n\n# Initialize state machine with the program\nsm = StateMachine(0, blink_fast, freq=2000, set_base=Pin(25))\n\n# Start the state machine\nsm.active(1)\n\n# Main program continues - the PIO runs independently\nfor i in range(10):\n    print(f'Main program: {i}')\n    time.sleep(1)\n\n# Stop when done\nsm.active(0)\n```\nFor more complex PIO programs (WS2812 LEDs, custom protocols, precise timing), refer to the RP2040 datasheet and examples in the Pico SDK."
  },
  {
    id: 75,
    category: "HERO Advanced Topics",
    question: "Can I use the HERO board with MQTT for IoT applications?",
    answer: "Yes, especially with the Pico W version. In MicroPython (for Pico W): ```python\nfrom umqtt.simple import MQTTClient\nimport network\nimport time\nfrom machine import Pin, ADC\n\n# Connect to WiFi first\nssid = 'Your_WiFi'\npassword = 'Your_Password'\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect(ssid, password)\nwhile not wlan.isconnected():\n    time.sleep(1)\nprint(f'Connected to WiFi: {wlan.ifconfig()[0]}')\n\n# Set up temperature sensor (assuming internal temperature sensor)\nsensor_temp = ADC(4)\n\n# MQTT Configuration\nMQTT_BROKER = 'broker.emqx.io'  # Public test broker\nMQTT_CLIENT_ID = 'hero_board'\nMQTT_TOPIC = b'hero/temperature'\n\n# Connect to MQTT broker\nclient = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER)\nclient.connect()\nprint('Connected to MQTT broker')\n\n# Publish temperature readings\ntry:\n    while True:\n        # Read temperature\n        reading = sensor_temp.read_u16() * (3.3 / 65535)\n        temperature = 27 - (reading - 0.706) / 0.001721\n        \n        # Format as JSON string\n        message = '{{\'device\':\'hero_board\',\'temperature\':{:.2f}}}'.format(temperature)\n        \n        # Publish to MQTT topic\n        client.publish(MQTT_TOPIC, message)\n        print(f'Published: {message}')\n        \n        time.sleep(60)  # Update every minute\nfinally:\n    client.disconnect()\n```\nFor the standard Pico, add an ESP8266/ESP32 or Ethernet module for connectivity."
  },
  
  // HERO Hardware Expansion
  {
    id: 76,
    category: "HERO Hardware Expansion",
    question: "Can I add a display to my HERO board?",
    answer: "Yes, you can add various displays to the HERO board: 1) I2C OLED displays (SSD1306, SH1106) connect to the I2C or QWIIC ports. 2) SPI TFT displays connect to SPI pins. 3) Character LCDs typically connect via I2C or direct GPIO pins. For an I2C OLED display: ```python\nfrom machine import Pin, I2C\nfrom ssd1306 import SSD1306_I2C\n\n# Create I2C object (use pins matching your HERO board's I2C port)\ni2c = I2C(0, scl=Pin(17), sda=Pin(16))\n\n# Initialize display (128x64 pixels is common)\ndisplay = SSD1306_I2C(128, 64, i2c)\n\n# Basic drawing\ndisplay.fill(0)  # Clear (0=black)\ndisplay.text('HERO Board', 0, 0, 1)  # Text at position (0,0) in white (1)\ndisplay.rect(0, 15, 128, 20, 1)  # Draw rectangle\ndisplay.line(0, 40, 128, 63, 1)  # Draw line\ndisplay.show()  # Update display\n```\nYou'll need to download the appropriate library (e.g., ssd1306.py) for your display."
  },
  {
    id: 77,
    category: "HERO Hardware Expansion",
    question: "How do I connect a motor driver to the HERO board?",
    answer: "To connect a motor driver (e.g., L298N or DRV8833): 1) Connect the driver's power inputs to an external power source suitable for your motors (not the HERO board). 2) Connect the driver's ground to both the external power source and the HERO board's ground. 3) Connect the driver's control inputs (IN1, IN2, etc.) to GPIO pins on the HERO board. 4) In MicroPython: ```python\nfrom machine import Pin, PWM\nimport time\n\n# Motor A control pins\nmotorA_in1 = Pin(16, Pin.OUT)\nmotorA_in2 = Pin(17, Pin.OUT)\n\n# For speed control (optional)\nmotorA_en = PWM(Pin(18))\nmotorA_en.freq(1000)\n\n# Basic movement functions\ndef forward():\n    motorA_in1.value(1)\n    motorA_in2.value(0)\n    motorA_en.duty_u16(65535)  # Full speed\n    \ndef backward():\n    motorA_in1.value(0)\n    motorA_in2.value(1)\n    motorA_en.duty_u16(32768)  # Half speed\n    \ndef stop():\n    motorA_in1.value(0)\n    motorA_in2.value(0)\n    \n# Test movement\nforward()\ntime.sleep(2)\nbackward()\ntime.sleep(2)\nstop()\n```\nAdjust the pin numbers according to your specific HERO board configuration."
  },
  {
    id: 78,
    category: "HERO Hardware Expansion",
    question: "Can I add more sensors to the HERO board?",
    answer: "Yes, you can add various sensors to the HERO board using: 1) Direct GPIO connections for simple sensors. 2) ADC pins (26-28) for analog sensors. 3) I2C ports for digital sensors with I2C interfaces. 4) SPI connections for SPI sensors. 5) UART for serial sensors. 6) Grove connectors for Grove-compatible sensors. 7) QWIIC/Stemma QT port for those sensors. Popular additions include: BME280 (temperature/pressure/humidity), MPU6050 (accelerometer/gyroscope), ultrasonic distance sensors, PIR motion sensors, gas sensors, color sensors, and many more. Most sensors come with libraries and examples for MicroPython/CircuitPython or C/C++."
  },
  {
    id: 79,
    category: "HERO Hardware Expansion",
    question: "How do I connect an SD card to my HERO board?",
    answer: "Connect an SD card module via SPI: 1) Connect the module's VCC to 3.3V (not 5V as most SD cards use 3.3V logic). 2) Connect GND to ground. 3) Connect MOSI, MISO, SCK to the corresponding SPI pins on the HERO. 4) Connect CS (Chip Select) to an available GPIO pin. In MicroPython: ```python\nfrom machine import Pin, SPI\nimport os, sdcard\n\n# Set up SPI and GPIO pins (adjust pins to match your HERO board)\nspi = SPI(1, baudrate=10_000_000, polarity=0, phase=0,\n         sck=Pin(10), mosi=Pin(11), miso=Pin(12))\nsd_cs = Pin(13, Pin.OUT)\n\n# Initialize SD card\nsd = sdcard.SDCard(spi, sd_cs)\n\n# Mount filesystem\nvfs = os.VfsFat(sd)\nos.mount(vfs, '/sd')\n\n# Now you can use standard file operations on '/sd'\nwith open('/sd/test.txt', 'w') as f:\n    f.write('Hello from HERO board!')\n\n# List files on SD card\nprint(os.listdir('/sd'))\n\n# Read file\nwith open('/sd/test.txt', 'r') as f:\n    print(f.read())\n```\nYou'll need to install the `sdcard.py` library for MicroPython."
  },
  {
    id: 80,
    category: "HERO Hardware Expansion",
    question: "Can I connect a camera to the HERO board?",
    answer: "Yes, though with limitations: 1) The RP2040 lacks dedicated camera interfaces, so only limited camera functionality is possible. 2) Simple serial cameras like the OV7670 without FIFO or low-resolution serial cameras can be connected. 3) I2C camera modules can work for basic applications. 4) The Arducam Pico4ML board integrates an OV7740 camera with the RP2040 but requires specific code. 5) For streaming or higher resolution, consider using a separate processor (like ESP32-CAM) connected to the HERO board. The limited RAM and processing power means the HERO board is best suited for simple image capture or low-resolution applications rather than video processing."
  },
  
  // HERO Education
  {
    id: 81,
    category: "HERO Education",
    question: "How can I use the HERO board to teach programming to beginners?",
    answer: "The HERO board is excellent for teaching programming: 1) Start with MicroPython due to its simpler syntax. 2) Begin with the built-in LED for a 'Hello World' blinking program. 3) Progress to buttons and input/output concepts. 4) Introduce variables with the potentiometer or light sensor readings. 5) Teach conditional statements with threshold-based actions ("if light level is low, turn on LED"). 6) Use loops for patterns of lights or sounds. 7) Introduce functions for repeated tasks. 8) Teach timing concepts with delays and animations. 9) Move to more complex projects combining multiple components. The immediate physical feedback makes abstract programming concepts concrete and engaging."
  },
  {
    id: 82,
    category: "HERO Education",
    question: "What age group is the HERO board suitable for?",
    answer: "The HERO board is adaptable for multiple age groups: 1) Late elementary (8-10): Basic concepts with guided projects and block-based programming. 2) Middle school (11-13): Introduction to text-based programming with MicroPython, simple circuits, and guided projects. 3) High school (14-18): More advanced programming concepts, introducing C/C++, independent projects. 4) College/Adult: Advanced applications, optimization, system design, and complex projects. The board is particularly well-suited for middle and high school STEM education but can be scaled up or down based on the curriculum design and guidance provided."
  },
  {
    id: 83,
    category: "HERO Education",
    question: "How does the HERO board teach electronics concepts?",
    answer: "The HERO board teaches electronics by: 1) Providing a safe, solderless environment to experiment with real components. 2) Including a variety of components that demonstrate different electronic principles. 3) Allowing students to see cause-and-effect relationships between code and hardware. 4) Teaching concepts like voltage, current, resistance through practical applications. 5) Demonstrating digital vs. analog signals with the appropriate pins. 6) Showing input/output concepts with sensors and actuators. 7) Introducing communication protocols like I2C and SPI. 8) Enabling breadboard prototyping for custom circuits. The integrated nature removes initial barriers like incorrect wiring, allowing focus on the concepts themselves."
  },
  {
    id: 84,
    category: "HERO Education",
    question: "What STEM concepts can be taught with the HERO board?",
    answer: "The HERO board can teach numerous STEM concepts: Science: Light properties (LEDs, photoresistor), sound (buzzer), temperature and environmental sensing, experimental method, data collection. Technology: Programming languages, algorithms, debugging, interfaces, IoT concepts, data processing. Engineering: Circuit design, system architecture, problem-solving, iterative development, testing methodologies, user interface design. Mathematics: Variables and functions, coordinate systems (for displays), statistics (data analysis), geometry (for movement/robotics), logic operations, timing calculations. Additionally, it can support cross-disciplinary projects like environmental monitoring, robotics, smart devices, and interactive art."
  },
  {
    id: 85,
    category: "HERO Education",
    question: "How do I create my own curriculum with the HERO board?",
    answer: "To create a HERO board curriculum: 1) Define clear learning objectives (programming concepts, electronics principles, etc.). 2) Structure progressive skill-building, starting with basics like LEDs and buttons. 3) Create engaging project-based lessons that demonstrate specific concepts. 4) Include both guided and open-ended activities for different learning styles. 5) Develop assessment methods (code reviews, working projects, quizzes). 6) Create handouts with circuit diagrams, code examples, and explanations. 7) Include troubleshooting guides and common mistakes. 8) Consider a theme or narrative to connect lessons (like the '30 Days Lost in Space'). 9) Add extensions and challenges for advanced students. 10) Incorporate reflection and iteration in the engineering design process."
  },
  
  // HERO Accessories & Upgrades
  {
    id: 86,
    category: "HERO Accessories & Upgrades",
    question: "What accessories are available for the HERO board?",
    answer: "Popular accessories for the HERO board include: 1) Sensor kits with various digital and analog sensors. 2) Motor drivers and motor kits for robotics. 3) Display modules (OLED, LCD, TFT). 4) Expansion boards that add specific functionality. 5) Grove sensor modules that connect directly to the Grove ports. 6) QWIIC/Stemma QT modules for the I2C connector. 7) Servo motors and controllers. 8) Camera modules. 9) Advanced communication modules (LoRa, Bluetooth, additional WiFi). 10) Battery packs and power management accessories for portable projects. Many standard Raspberry Pi Pico accessories are also compatible with the HERO board."
  },
  {
    id: 87,
    category: "HERO Accessories & Upgrades",
    question: "Can I upgrade from the standard HERO board to the HERO W (with WiFi)?",
    answer: "Yes, you can upgrade to WiFi capability: 1) If your HERO board has a socketed Pico (not soldered directly), you can replace the standard Pico with a Pico W. 2) The Pico W is pin-compatible with the standard Pico, so all HERO board functionality will work the same. 3) After the hardware swap, you'll need to flash MicroPython for the Pico W specifically (different UF2 file). 4) Your existing code will work, but you'll now have access to network and WiFi libraries to add connectivity features. 5) If your HERO board has a soldered Pico, consider external options like ESP8266 modules connected via UART as an alternative WiFi solution."
  },
  {
    id: 88,
    category: "HERO Accessories & Upgrades",
    question: "What cases or enclosures work with the HERO board?",
    answer: "Several enclosure options exist: 1) Official HERO board cases designed specifically for the board's dimensions and component layout. 2) 3D printable cases - many community-designed options are available on sites like Thingiverse and Printables. 3) Custom project enclosures that integrate the HERO into specific applications. 4) Modular enclosure systems that allow for expansion. 5) Educational classroom storage solutions. For robotics projects, mounting plates and chassis systems compatible with the HERO's mounting holes are available. When selecting or designing an enclosure, ensure adequate access to all connectors, buttons, and expansion areas."
  },
  {
    id: 89,
    category: "HERO Accessories & Upgrades",
    question: "What power options are available for portable HERO board projects?",
    answer: "Portable power options include: 1) USB power banks - the simplest option, connects via the Pico's USB port. 2) LiPo batteries with appropriate voltage regulation (3.7V batteries with a boost converter to 5V). 3) AA or AAA battery packs (typically 3-4 cells) with voltage regulation. 4) Dedicated LiPo battery expansion boards designed for the Pico. 5) Solar panels with battery backup for outdoor projects. Consider adding a power switch and battery monitoring circuitry. For motor-heavy projects, use separate battery systems for logic and motors to prevent voltage drops affecting the HERO board."
  },
  {
    id: 90,
    category: "HERO Accessories & Upgrades",
    question: "Can I create custom expansion boards for the HERO?",
    answer: "Yes, you can create custom expansion boards: 1) Use the breakout pins on the HERO board or the pass-through pins if available. 2) Design PCBs that connect via the Grove or QWIIC connectors. 3) Create boards that connect to the breadboard area. 4) For advanced users, design custom Pico RP2040 carrier boards that replace the Pico entirely but maintain HERO compatibility. PCB design software like KiCAD, EasyEDA, or Fritzing can be used. For prototyping before PCB fabrication, use perfboard with pin headers. The Pico's design files are open-source, providing reference materials for custom designs."
  },
  
  // HERO vs Alternatives
  {
    id: 91,
    category: "HERO vs Alternatives",
    question: "How does the HERO board compare to Arduino for learning?",
    answer: "HERO board vs. Arduino for learning: HERO advantages: 1) All-in-one design with built-in components means less initial wiring. 2) More processing power and memory than basic Arduinos. 3) Structured curriculum with narrative ('30 Days Lost in Space'). 4) MicroPython support makes programming more accessible for beginners. 5) Dual-core processor enables more advanced applications. Arduino advantages: 1) More established ecosystem with extensive libraries and examples. 2) Wider variety of board options for specific needs. 3) More community resources due to longer market presence. 4) Potentially lower cost for basic models. Both are excellent platforms, but the HERO board generally offers a more integrated, beginner-friendly start while Arduino offers more flexibility for specific applications."
  },
  {
    id: 92,
    category: "HERO vs Alternatives",
    question: "Should I use the HERO board or plain Raspberry Pi Pico for my project?",
    answer: "HERO board vs. plain Pico: Choose HERO board when: 1) You're a beginner or teaching beginners. 2) You want built-in components without extra wiring. 3) You're following the HERO curriculum. 4) You need a breadboard and various connectors in one package. 5) Convenience is more important than size or cost. Choose plain Pico when: 1) You need the smallest possible form factor. 2) You're creating a permanent, embedded project. 3) You're comfortable with electronics and don't need integrated components. 4) Cost is a primary concern and you already have components. 5) You need to integrate the microcontroller into a custom PCB. Many start with the HERO board to learn, then transition to plain Picos for specific applications."
  },
  {
    id: 93,
    category: "HERO vs Alternatives",
    question: "How does the HERO board compare to micro:bit for education?",
    answer: "HERO board vs. micro:bit: HERO advantages: 1) More powerful processor and memory. 2) More expansion capabilities and connectors. 3) Standard programming languages (MicroPython, C/C++) vs. specialized blocks. 4) Built-in breadboard for custom circuits. 5) More suitable for advanced projects and growth. micro:bit advantages: 1) Smaller, more portable form factor. 2) Built-in LED matrix display. 3) Simplified programming interface may be better for very young beginners. 4) Lower cost for classroom deployments. 5) Radio capabilities for direct board-to-board communication. The HERO board provides a smoother path to real-world electronics, while the micro:bit offers a more simplified, contained introduction for younger students."
  },
  {
    id: 94,
    category: "HERO vs Alternatives",
    question: "Is the HERO board better than Adafruit Circuit Playground for learning?",
    answer: "HERO board vs. Circuit Playground: HERO advantages: 1) Exposes the microcontroller and pins more explicitly, better teaching actual electronics. 2) Includes a breadboard for custom circuit building. 3) Multiple expansion options (Grove, QWIIC, GPIO). 4) More processing power with the RP2040. 5) Narrative-based curriculum structure. Circuit Playground advantages: 1) More integrated sensors and actuators in a compact form. 2) NeoPixel LEDs for colorful visual feedback. 3) More plug-and-play for very beginners. 4) May be easier for very young children. 5) Direct CircuitPython support. The HERO board emphasizes building and understanding circuits, while Circuit Playground provides a more contained, immediate experience."
  },
  {
    id: 95,
    category: "HERO vs Alternatives",
    question: "How does the HERO board compare to Raspberry Pi for STEM education?",
    answer: "HERO board vs. Raspberry Pi: HERO advantages: 1) Focus on physical computing and electronics vs. general computing. 2) Easier integration with sensors and components through built-in connectors. 3) No operating system to configure or maintain. 4) Lower cost for hardware. 5) Lower power consumption and instant startup. 6) More resilient to power cycles and corruption. Raspberry Pi advantages: 1) Full-featured operating system for broader computing education. 2) Better for software development, networking, and web projects. 3) Can run more complex applications and programming environments. 4) Has display outputs for stand-alone operation. These are complementary tools - the HERO board excels for electronics and embedded programming, while Raspberry Pi is better for general computing education."
  },
  
  // Miscellaneous
  {
    id: 96,
    category: "Miscellaneous",
    question: "Can I use the HERO board for commercial projects?",
    answer: "Yes, you can use the HERO board in commercial projects: 1) The RP2040 chip and MicroPython are both available for commercial use. 2) For prototyping and small-scale production, the HERO board works well as-is. 3) For larger production, you might want to design a custom PCB that incorporates only the needed components from the HERO design. 4) Check the specific license of any third-party libraries you use in your project. 5) The HERO board's physical design may have copyright considerations if you're replicating it exactly. Most commercial restrictions would apply to reproducing and selling the HERO board itself, not to using it within your own product or service."
  },
  {
    id: 97,
    category: "Miscellaneous",
    question: "What is the power consumption of the HERO board?",
    answer: "The HERO board's power consumption varies based on usage: 1) Base consumption is primarily from the Raspberry Pi Pico (20-25mA when running). 2) Each active LED adds approximately 5-10mA. 3) The buzzer can draw 15-25mA when active. 4) External components connected to 3.3V or 5V pins add their own consumption. 5) WiFi operations on the Pico W version can add 40-100mA. For battery life calculations: A typical 2000mAh power bank would run a HERO board for roughly 40-80 hours with minimal component usage, or 10-20 hours with regular LED/sensor activity. For precise measurements for your specific application, use a USB power meter."
  },
  {
    id: 98,
    category: "Miscellaneous",
    question: "Can the HERO board be used for wearable projects?",
    answer: "Yes, though with some considerations: 1) The standard HERO board is relatively large for wearables - consider extracting just the Pico for the final project. 2) For prototyping, the HERO board works well, then transfer the circuit to a smaller implementation. 3) Power via small LiPo batteries with appropriate voltage regulation. 4) Use the I2C or QWIIC connector to add small sensors appropriate for wearables. 5) Consider waterproofing and ruggedization for practical wearable use. 6) The Pico's low power modes can be used to extend battery life. Example projects include: LED costume elements, fitness trackers, smart jewelry, interactive clothing, and environmental monitoring devices."
  },
  {
    id: 99,
    category: "Miscellaneous",
    question: "What resources exist for creating games on the HERO board?",
    answer: "Game development resources for the HERO board: 1) For display-based games, connect an OLED or LCD screen via I2C or SPI. 2) MicroPython libraries like `framebuf` provide basic graphics capabilities. 3) The `pygame` concepts can be adapted to MicroPython for simple games. 4) LED-based games can use the onboard LEDs with button inputs. 5) Sound effects are possible through the buzzer. 6) Simple multiplayer games can use I2C or SPI to connect boards. Example game projects include: LED reaction games, memory games with sequences of lights and sounds, simple text adventures on displays, maze games, and pong or snake variants with connected displays. The HERO's buttons, LEDs, and expansion capabilities provide a good foundation for simple game development."
  },
  {
    id: 100,
    category: "Miscellaneous",
    question: "How durable is the HERO board for classroom use?",
    answer: "The HERO board is designed with classroom durability in mind: 1) The PCB is generally robust, though the corners could chip with rough handling. 2) The Raspberry Pi Pico itself is well-protected in its mounted position. 3) Most components are surface-mounted and durable enough for regular use. 4) The micro USB port is typically the most vulnerable point - teach proper connection techniques. 5) Consider cases or protective enclosures for additional protection. 6) The breadboard area's insertion points will wear out eventually with frequent use. 7) For classroom settings, establish clear handling procedures, storage solutions, and cable management. 8) The boards can generally withstand several years of careful educational use. 9) Keep replacement Picos available, as they're easily swappable if damaged."
  }
];

const HelpCenterWindow: React.FC<HelpCenterWindowProps> = ({ onClose, onMinimize, isActive }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Getting Started": true
  });
  
  // Group questions by category
  const questionsByCategory = picoQuestions.reduce((grouped, question) => {
    if (!grouped[question.category]) {
      grouped[question.category] = [];
    }
    grouped[question.category].push(question);
    return grouped;
  }, {} as Record<string, HelpQuestion[]>);
  
  // Get categories
  const categories = Object.keys(questionsByCategory);
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Filter questions based on search term
  const filteredQuestions = searchTerm.trim() === "" 
    ? [] 
    : picoQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // State for expanded question
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  
  // Toggle question expansion
  const toggleQuestion = (id: number) => {
    setExpandedQuestion(prev => prev === id ? null : id);
  };
  
  return (
    <div className={`retroWindow ${isActive ? 'active' : ''}`}>
      <div className="windowTitleBar">
        <div className="windowTitle">Help Center</div>
        <div className="windowControls">
          <button onClick={onMinimize} className="controlButton minimizeButton">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose} className="controlButton closeButton">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="windowContent" style={{ height: 'calc(100% - 28px)', display: 'flex', flexDirection: 'column' }}>
        {/* Search Bar */}
        <div className="p-2 border-b border-gray-300 bg-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help topics..."
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
        
        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto">
          {searchTerm.trim() === "" ? (
            // Category View
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">Raspberry Pi Pico & HERO Board Help</h1>
              <p className="text-gray-600 mb-6">Browse categories or search for specific topics above.</p>
              
              {categories.map(category => (
                <div key={category} className="mb-4">
                  <button 
                    className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold flex justify-between items-center"
                    onClick={() => toggleCategory(category)}
                  >
                    <span>{category}</span>
                    {expandedCategories[category] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  
                  {expandedCategories[category] && (
                    <div className="ml-4 mt-2 space-y-1">
                      {questionsByCategory[category].map(question => (
                        <div key={question.id} className="border-l-2 border-gray-300 pl-3 py-1">
                          <button 
                            className="text-left w-full hover:text-blue-600 flex justify-between items-center"
                            onClick={() => toggleQuestion(question.id)}
                          >
                            <span>{question.question}</span>
                            {expandedQuestion === question.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          
                          {expandedQuestion === question.id && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                              {question.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Search Results View
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Search Results</h2>
              <p className="text-gray-600 mb-4">Found {filteredQuestions.length} results for "{searchTerm}"</p>
              
              {filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map(question => (
                    <div key={question.id} className="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg mb-1">{question.question}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{question.category}</span>
                      </div>
                      <div className="mt-2 text-sm whitespace-pre-wrap">
                        {expandedQuestion === question.id ? (
                          <>
                            <div>{question.answer}</div>
                            <button 
                              className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => setExpandedQuestion(null)}
                            >
                              Show Less
                            </button>
                          </>
                        ) : (
                          <>
                            <div>{question.answer.substring(0, 150)}...</div>
                            <button 
                              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => setExpandedQuestion(question.id)}
                            >
                              Read More
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <HelpCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No results found. Try a different search term.</p>
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
