// Python debugging quiz questions

interface Question {
  id: number;
  type: 'output' | 'error' | 'fix';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  options?: string[];
  correctAnswer: string | number;
  lineToFix?: number;
  explanation: string;
}

export const pythonQuestions: Question[] = [
  // Output Prediction Questions (10)
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: 'x = 5\ny = 2\nprint(x * y + 1)',
    options: ['10', '11', '7', 'Error'],
    correctAnswer: 2,
    explanation: 'This code multiplies x (5) by y (2) to get 10, then adds 1 to get 11.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: 'message = "Hello"\nfor char in message:\n    print(char, end="-")\nprint("end")',
    options: ['H-e-l-l-o', 'H-e-l-l-o-end', 'Hello-end', 'H-e-l-l-o-\nend'],
    correctAnswer: 2,
    explanation: 'The loop prints each character followed by a hyphen. Then "end" is printed on the same line.'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Medium',
    code: 'def func(x, y=2):\n    return x + y\n\nprint(func(3))',
    options: ['3', '5', 'Error: missing required argument', 'None'],
    correctAnswer: 2,
    explanation: 'The function has a default parameter y=2, so calling func(3) uses x=3 and y=2, resulting in 5.'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Medium',
    code: 'data = [1, 2, 3]\nresult = []\nfor i in range(len(data)):\n    result.append(data[i] * 2)\nprint(result)',
    options: ['[1, 2, 3, 1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', '[1, 2, 3]'],
    correctAnswer: 2,
    explanation: 'The loop iterates through indices 0, 1, 2, multiplies each element by 2, and appends to result.'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Medium',
    code: 'text = "scraplight cartel"\nprint(text[0:5:2] + text[-1])',
    options: ['srl', 'scal', 'sral', 'scrl'],
    correctAnswer: 1,
    explanation: 'text[0:5:2] gets every 2nd character from index 0 to 4 ("sca"), and text[-1] gets the last character ("l").'
  },
  {
    id: 6,
    type: 'output',
    difficulty: 'Hard',
    code: 'def modify(items):\n    items.append(4)\n    items = [7, 8, 9]\n    return items\n\ndata = [1, 2, 3]\nresult = modify(data)\nprint(data, result)',
    options: ['[1, 2, 3] [7, 8, 9]', '[1, 2, 3, 4] [7, 8, 9]', '[7, 8, 9] [7, 8, 9]', '[1, 2, 3, 4] [1, 2, 3, 4]'],
    correctAnswer: 2,
    explanation: 'The function first modifies the original list by appending 4, then reassigns the local variable to a new list [7, 8, 9] which doesn\'t affect the original list.'
  },
  {
    id: 7,
    type: 'output',
    difficulty: 'Hard',
    code: 'class Counter:\n    def __init__(self, start=0):\n        self.count = start\n    \n    def increment(self):\n        self.count += 1\n        return self\n\nc = Counter(5)\nc.increment().increment()\nprint(c.count)',
    options: ['5', '6', '7', 'Error'],
    correctAnswer: 3,
    explanation: 'The increment method returns self, allowing for method chaining. It\'s called twice, incrementing the count from 5 to 7.'
  },
  {
    id: 8,
    type: 'output',
    difficulty: 'Hard',
    code: 'numbers = [1, 2, 3, 4, 5]\nfiltered = filter(lambda x: x % 2 == 0, numbers)\nmapped = map(lambda x: x * 2, filtered)\nprint(list(mapped))',
    options: ['[2, 4, 6, 8, 10]', '[4, 8]', '[2, 4]', '[4]'],
    correctAnswer: 2,
    explanation: 'First, filter retains only even numbers [2, 4], then map doubles each value to produce [4, 8].'
  },
  {
    id: 9,
    type: 'output',
    difficulty: 'Hard',
    code: 'import re\ntext = "Gizbo\'s code: ABC-123-XYZ"\npattern = r"[A-Z]+-\\d+-[A-Z]+"\nmatches = re.findall(pattern, text)\nprint(matches[0] if matches else "No match")',
    options: ['Gizbo\'s code:', 'ABC-123-XYZ', 'code: ABC-123-XYZ', 'No match'],
    correctAnswer: 2,
    explanation: 'The regex pattern matches uppercase letters, followed by a hyphen, digits, another hyphen, and more uppercase letters, which is "ABC-123-XYZ" in the text.'
  },
  {
    id: 10,
    type: 'output',
    difficulty: 'Hard',
    code: 'from functools import reduce\nnumbers = [1, 2, 3, 4]\nresult = reduce(lambda x, y: x * y, numbers)\nprint(result)',
    options: ['10', '24', '[1, 2, 3, 4]', 'Error'],
    correctAnswer: 2,
    explanation: 'The reduce function applies the lambda (multiplication) cumulatively: ((1*2)*3)*4 = 24.'
  },

  // Error Detection Questions (10)
  {
    id: 11,
    type: 'error',
    difficulty: 'Easy',
    code: 'def calculate_total(items):\n    total = 0\n    for item in items\n        total += item\n    return total\n\nprint(calculate_total([1, 2, 3]))',
    correctAnswer: 3,
    explanation: 'There\'s a missing colon after the for loop declaration. It should be "for item in items:"'
  },
  {
    id: 12,
    type: 'error',
    difficulty: 'Easy',
    code: 'message = "Hello World"\nprint(mesage)',
    correctAnswer: 2,
    explanation: 'There\'s a typo in the variable name. It\'s defined as "message" but referenced as "mesage".'
  },
  {
    id: 13,
    type: 'error',
    difficulty: 'Easy',
    code: 'x = 10\nif x > 5\n    print("x is greater than 5")',
    correctAnswer: 2,
    explanation: 'The if statement is missing a colon. It should be "if x > 5:"'
  },
  {
    id: 14,
    type: 'error',
    difficulty: 'Medium',
    code: 'def divide(a, b):\n    return a / b\n\nresult = divide(10, 0)\nprint(result)',
    correctAnswer: 4,
    explanation: 'Line 4 causes a ZeroDivisionError because you can\'t divide by zero.'
  },
  {
    id: 15,
    type: 'error',
    difficulty: 'Medium',
    code: 'data = [1, 2, 3, 4, 5]\nfor i in range(len(data)):\n    if data[i] % 2 == 0:\n        data.remove(data[i])\nprint(data)',
    correctAnswer: 2,
    explanation: 'Modifying a list while iterating through it using indices can cause index errors or skip elements. The loop should iterate over a copy or use a different approach.'
  },
  {
    id: 16,
    type: 'error',
    difficulty: 'Medium',
    code: 'def recursive_sum(n):\n    if n <= 0:\n        return 0\n    else:\n        return n + recursive_sum(n-1)\n\nprint(recursive_sum(5000))',
    correctAnswer: 7,
    explanation: 'This will likely cause a RecursionError due to exceeding the maximum recursion depth with such a large input.'
  },
  {
    id: 17,
    type: 'error',
    difficulty: 'Medium',
    code: 'items = {"name": "Circuit", "price": 50}\nitems["quantity"] += 1\nprint(items)',
    correctAnswer: 2,
    explanation: 'You can\'t use += on a key that doesn\'t exist in the dictionary yet. The "quantity" key should be initialized first.'
  },
  {
    id: 18,
    type: 'error',
    difficulty: 'Hard',
    code: 'class Device:\n    def __init__(self, name):\n        self.name = name\n    \n    def activate(self):\n        print(f"{self.name} activated")\n\ndef process_device(device):\n    device.activate()\n\nprocess_device("Quantum Circuit")',
    correctAnswer: 10,
    explanation: 'The process_device function expects a Device object, but a string is passed instead, causing an attribute error when trying to call the activate method.'
  },
  {
    id: 19,
    type: 'error',
    difficulty: 'Hard',
    code: 'import threading\n\ncount = 0\n\ndef increment():\n    global count\n    for _ in range(1000000):\n        count += 1\n\nthreads = []\nfor _ in range(2):\n    t = threading.Thread(target=increment)\n    threads.append(t)\n    t.start()\n\nfor t in threads:\n    t.join()\n\nprint(count)',
    correctAnswer: 7,
    explanation: 'There\'s a race condition when multiple threads try to increment the same global variable without proper synchronization.'
  },
  {
    id: 20,
    type: 'error',
    difficulty: 'Hard',
    code: 'class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\ndef create_cycle():\n    a = Node(1)\n    b = Node(2)\n    c = Node(3)\n    a.next = b\n    b.next = c\n    c.next = a  # Create a cycle\n    return a\n\ndef print_list(head, max_nodes=10):\n    current = head\n    while current:\n        print(current.value, end=" ")\n        current = current.next\n\nprint_list(create_cycle())',
    correctAnswer: 15,
    explanation: 'The linked list has a cycle (a->b->c->a), so the while loop in print_list never terminates because current is never None.'
  },

  // Code Fixing Questions (10)
  {
    id: 21,
    type: 'fix',
    difficulty: 'Easy',
    code: '1  def greet(name):\n2      return "Hello, " + name\n3\n4  message = greet("Gizbo"\n5  print(message)',
    lineToFix: 4,
    correctAnswer: 'message = greet("Gizbo")',
    explanation: 'There was a missing closing parenthesis after "Gizbo". The correct line should have the closing parenthesis.'
  },
  {
    id: 22,
    type: 'fix',
    difficulty: 'Easy',
    code: '1  numbers = [1, 2, 3, 4, 5]\n2  total = 0\n3  for num in numbers\n4      total += num\n5  print("Sum:", total)',
    lineToFix: 3,
    correctAnswer: 'for num in numbers:',
    explanation: 'The for loop declaration was missing a colon. In Python, a colon is required after loop declarations.'
  },
  {
    id: 23,
    type: 'fix',
    difficulty: 'Easy',
    code: '1  def calculate_price(price, discount):\n2      if discount > 0\n3          return price - (price * discount)\n4      return price\n5\n6  print(calculate_price(100, 0.2))',
    lineToFix: 2,
    correctAnswer: 'if discount > 0:',
    explanation: 'The if statement was missing a colon. In Python, a colon is required after conditional statements.'
  },
  {
    id: 24,
    type: 'fix',
    difficulty: 'Medium',
    code: '1  inventory = {"circuits": 5, "chips": 10}\n2  item = "batteries"\n3  quantity = inventory[item]\n4  print(f"We have {quantity} {item}")',
    lineToFix: 3,
    correctAnswer: 'quantity = inventory.get(item, 0)',
    explanation: 'Using dictionary[key] raises a KeyError if the key doesn\'t exist. inventory.get(item, 0) safely returns 0 if the key is not found.'
  },
  {
    id: 25,
    type: 'fix',
    difficulty: 'Medium',
    code: '1  def find_max(numbers):\n2      if len(numbers) == 0:\n3          return None\n4      max_value = numbers[0]\n5      for num in numbers:\n6          if num > max_value:\n7              max_value = num\n8      return max_value\n9\n10 result = find_max()\n11 print("Maximum value:", result)',
    lineToFix: 10,
    correctAnswer: 'result = find_max([10, 5, 20, 15])',
    explanation: 'The function find_max requires a list argument, but it was called without any arguments. The fixed line provides a sample list.'
  },
  {
    id: 26,
    type: 'fix',
    difficulty: 'Medium',
    code: '1  class Counter:\n2      def __init__(self, initial=0):\n3          self.count = initial\n4\n5      def increment(self):\n6          self.count += 1\n7\n8      def get_value(self):\n9          return self.value\n10\n11 counter = Counter(5)\n12 counter.increment()\n13 print(counter.get_value())',
    lineToFix: 9,
    correctAnswer: 'return self.count',
    explanation: 'The method tries to return self.value, but the instance variable is called self.count. The correct attribute should be returned.'
  },
  {
    id: 27,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  import threading\n2  import time\n3\n4  counter = 0\n5  lock = threading.Lock()\n6\n7  def increment():\n8      global counter\n9      for _ in range(100000):\n10         counter += 1\n11         time.sleep(0.00001)\n12\n13 # Create and start threads\n14 threads = []\n15 for _ in range(5):\n16     t = threading.Thread(target=increment)\n17     threads.append(t)\n18     t.start()\n19\n20 # Wait for all threads to complete\n21 for t in threads:\n22     t.join()\n23\n24 print(f"Final counter: {counter}")',
    lineToFix: 10,
    correctAnswer: 'with lock: counter += 1',
    explanation: 'Multiple threads incrementing a shared variable can cause race conditions. Using a lock ensures that only one thread can modify the counter at a time.'
  },
  {
    id: 28,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  class CircuitBoard:\n2      def __init__(self, components=[]):\n3          self.components = components\n4\n5  board1 = CircuitBoard()\n6  board1.components.append("resistor")\n7  board2 = CircuitBoard()\n8  print(board2.components)',
    lineToFix: 2,
    correctAnswer: 'def __init__(self, components=None):',
    explanation: 'Using mutable default arguments (like lists) in Python is problematic because the same list is used for all instances. Using None and initializing inside the method is the proper approach.'
  },
  {
    id: 29,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  import json\n2\n3  def process_data(file_path):\n4      with open(file_path, "r") as file:\n5          data = json.load(file)\n6          return data["results"]\n7\n8  def save_results(results, output_file):\n9      with open(output_file, "w") as file:\n10         json.dump(results, file)\n11\n12 # Process and save data\n13 try:\n14     results = process_data("data.json")\n15     save_results(results, "output.json")\n16     print("Processing complete!")\n17 except:\n18     print("An error occurred")',
    lineToFix: 17,
    correctAnswer: 'except Exception as e:',
    explanation: 'Using a bare except clause catches all exceptions, including keyboard interrupts and system exits, which is bad practice. Specifying the exception type and capturing the error details allows for better error handling.'
  },
  {
    id: 30,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  import numpy as np\n2\n3  def optimize_circuit(parameters, iterations=100):\n4      results = []\n5      best_score = float(\'inf\')\n6      best_params = None\n7\n8      for i in range(iterations):\n9          # Simulate with current parameters\n10         score = simulate_circuit(parameters)\n11         results.append(score)\n12\n13         # Update best parameters\n14         if score < best_score:\n15             best_score = score\n16             best_params = parameters\n17\n18         # Mutate parameters slightly\n19         parameters = parameters + np.random.normal(0, 0.1, len(parameters))\n20\n21     return best_params, best_score\n22\n23 def simulate_circuit(params):\n24     # Simplified simulation function\n25     return sum(p**2 for p in params)\n26\n27 # Initial parameters\n28 initial_params = np.array([1.0, 2.0, 3.0])\n29 best_params, best_score = optimize_circuit(initial_params)\n30 print(f"Best parameters: {best_params}, Score: {best_score}")',
    lineToFix: 16,
    correctAnswer: 'best_params = parameters.copy()',
    explanation: 'The code is storing a reference to the parameters array, which is then modified in each iteration. This means best_params is actually the final parameters, not the ones that gave the best score. Using .copy() creates an independent copy of the array.'
  }
];
