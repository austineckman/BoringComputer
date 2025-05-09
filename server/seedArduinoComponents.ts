import { db } from "./db";
import { arduinoComponents } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedArduinoComponents() {
  try {
    console.log("Seeding Arduino components...");

    // Define basic Arduino components
    const components = [
      {
        id: "led",
        name: "LED",
        description: "Light Emitting Diode - a simple light source that illuminates when current flows through it.",
        category: "output",
        iconPath: "/images/components/led.icon.svg",
        pins: [
          {
            name: "Anode",
            type: "power" as const,
            description: "Connect to power (longer leg)"
          },
          {
            name: "Cathode",
            type: "ground" as const,
            description: "Connect to ground through a resistor (shorter leg)"
          }
        ],
        properties: {
          color: "red",
          maxCurrent: "20mA",
          forwardVoltage: "1.8V"
        },
        exampleCode: `
// LED Blink Example
const int ledPin = 13;  // Built-in LED on pin 13

void setup() {
  // Initialize the digital pin as an output
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn on the LED
  delay(1000);                  // Wait for a second
  digitalWrite(ledPin, LOW);    // Turn off the LED
  delay(1000);                  // Wait for a second
}
`
      },
      {
        id: "button",
        name: "Push Button",
        description: "A momentary switch that connects two points in a circuit when pressed.",
        category: "input",
        iconPath: "/images/components/button.icon.svg",
        pins: [
          {
            name: "Pin 1",
            type: "input" as const,
            description: "Connect to input pin and pullup resistor"
          },
          {
            name: "Pin 2",
            type: "ground" as const,
            description: "Connect to ground"
          }
        ],
        properties: {
          type: "momentary",
          pullup: "required"
        },
        exampleCode: `
// Button Example
const int buttonPin = 2;  // Pushbutton connected to pin 2
const int ledPin = 13;    // LED connected to pin 13

// Variables will change:
int buttonState = 0;      // Variable for reading the pushbutton status

void setup() {
  // Initialize the LED pin as an output:
  pinMode(ledPin, OUTPUT);
  // Initialize the pushbutton pin as an input:
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  // Read the state of the pushbutton:
  buttonState = digitalRead(buttonPin);

  // Check if the pushbutton is pressed (LOW when pressed with pullup):
  if (buttonState == LOW) {
    // Turn LED on:
    digitalWrite(ledPin, HIGH);
  } else {
    // Turn LED off:
    digitalWrite(ledPin, LOW);
  }
}
`
      },
      {
        id: "resistor",
        name: "Resistor",
        description: "A passive component that creates resistance in the flow of electric current.",
        category: "passive",
        iconPath: "/images/components/resistor.icon.svg",
        pins: [
          {
            name: "Terminal 1",
            type: "input" as const,
            description: "Connect to any point in circuit"
          },
          {
            name: "Terminal 2",
            type: "output" as const,
            description: "Connect to any point in circuit"
          }
        ],
        properties: {
          resistance: "220Ω",
          tolerance: "5%",
          powerRating: "0.25W"
        },
        exampleCode: null
      },
      {
        id: "oled-display",
        name: "OLED Display",
        description: "A small, efficient display using organic light-emitting diodes for pixel illumination.",
        category: "output",
        iconPath: "/images/components/oled-display.icon.svg",
        pins: [
          {
            name: "VCC",
            type: "power" as const,
            description: "Connect to 3.3V or 5V power"
          },
          {
            name: "GND",
            type: "ground" as const,
            description: "Connect to ground"
          },
          {
            name: "SCL",
            type: "input" as const,
            description: "Connect to I2C clock (A5 on Uno)"
          },
          {
            name: "SDA",
            type: "input" as const,
            description: "Connect to I2C data (A4 on Uno)"
          }
        ],
        properties: {
          interface: "I2C",
          resolution: "128x64",
          controller: "SSD1306"
        },
        exampleCode: `
// OLED Display Example
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(9600);

  // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }

  // Show initial display buffer contents on the screen
  display.display();
  delay(2000); // Pause for 2 seconds

  // Clear the buffer
  display.clearDisplay();

  // Draw a single pixel in white
  display.drawPixel(10, 10, SSD1306_WHITE);

  // Show the display buffer on the screen
  display.display();
}

void loop() {
  // Draw text
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Hello, world!");
  display.setCursor(0, 20);
  display.println("Time: " + String(millis()/1000) + "s");
  display.display();
  delay(1000);
}
`
      },
      {
        id: "potentiometer",
        name: "Potentiometer",
        description: "A variable resistor that allows manual adjustment of resistance.",
        category: "input",
        iconPath: "/images/components/potentiometer.icon.svg",
        pins: [
          {
            name: "Terminal 1",
            type: "power" as const,
            description: "Connect to power (VCC)"
          },
          {
            name: "Wiper",
            type: "output" as const,
            description: "Connect to analog input pin"
          },
          {
            name: "Terminal 2",
            type: "ground" as const,
            description: "Connect to ground"
          }
        ],
        properties: {
          resistance: "10kΩ",
          type: "rotary"
        },
        exampleCode: `
// Potentiometer Example
const int potPin = A0;  // Potentiometer connected to analog pin A0
const int ledPin = 9;   // LED connected to digital pin 9 (PWM)
int potValue = 0;       // Variable to store the value from the potentiometer

void setup() {
  pinMode(ledPin, OUTPUT);  // Sets the ledPin as output
  Serial.begin(9600);       // Initialize serial communication
}

void loop() {
  // Read the value from the potentiometer
  potValue = analogRead(potPin);
  
  // Convert the analog reading (0-1023) to a brightness (0-255)
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // Use the value to set the LED brightness
  analogWrite(ledPin, brightness);
  
  // Print the values to the serial monitor
  Serial.print("Potentiometer value: ");
  Serial.print(potValue);
  Serial.print(" | LED brightness: ");
  Serial.println(brightness);
  
  delay(100);  // Short delay for stability
}
`
      }
    ];

    // Insert components into the database
    for (const component of components) {
      // Check if component already exists
      const [existingComponent] = await db.select().from(arduinoComponents).where(eq(arduinoComponents.id, component.id));
      
      if (existingComponent) {
        console.log(`Component ${component.id} already exists. Updating...`);
        await db.update(arduinoComponents)
          .set({
            name: component.name,
            description: component.description,
            category: component.category,
            iconPath: component.iconPath,
            pins: component.pins,
            properties: component.properties,
            exampleCode: component.exampleCode,
            updatedAt: new Date()
          })
          .where(eq(arduinoComponents.id, component.id));
      } else {
        console.log(`Adding new component: ${component.id}`);
        await db.insert(arduinoComponents).values({
          id: component.id,
          name: component.name,
          description: component.description,
          category: component.category,
          iconPath: component.iconPath,
          pins: component.pins,
          properties: component.properties,
          exampleCode: component.exampleCode
        });
      }
    }
    
    console.log("Successfully seeded Arduino components");
  } catch (error) {
    console.error("Error seeding Arduino components:", error);
    throw error;
  }
}

seedArduinoComponents()
  .then(() => {
    console.log("Components seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed components:", error);
    process.exit(1);
  });