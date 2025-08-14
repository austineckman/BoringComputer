import { Question } from './questions-interface';

export const pythonQuestions: Question[] = [
  // ===== EASY OUTPUT QUESTIONS =====
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: `x = 5\ny = 3\nprint(x + y * 2)`,
    options: ['8', '11', '16', 'Error'],
    correctAnswer: 2,
    explanation: 'The expression evaluates to 5 + (3 * 2) = 5 + 6 = 11. Multiplication has higher precedence than addition.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: `def greet(name):\n    return f"Hello, {name}!"\n\nresult = greet("Gizbo")\nprint(result)`,
    options: ['Hello, Gizbo!', 'Hello, name!', 'Hello, "Gizbo"!', 'None'],
    correctAnswer: 1,
    explanation: 'The function returns a formatted string where {name} is replaced with the argument "Gizbo".'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Easy',
    code: `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)`,
    options: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'],
    correctAnswer: 2,
    explanation: 'Lists are mutable and passed by reference. b and a point to the same list object.'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Easy',
    code: `x = "Hello"\ny = x.upper()\nprint(x)`,
    options: ['HELLO', 'Hello', 'hello', 'None'],
    correctAnswer: 2,
    explanation: 'String methods return new strings; they don\'t modify the original string.'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Easy',
    code: `count = 0\nfor i in range(3):\n    count += i\nprint(count)`,
    options: ['0', '3', '6', '9'],
    correctAnswer: 2,
    explanation: 'range(3) gives [0, 1, 2]. Sum: 0 + 1 + 2 = 3.'
  },
  {
    id: 6,
    type: 'output',
    difficulty: 'Easy',
    code: `def mystery(x):\n    return x * 2\n\nresult = mystery(mystery(3))\nprint(result)`,
    options: ['6', '9', '12', '18'],
    correctAnswer: 3,
    explanation: 'mystery(3) returns 6, then mystery(6) returns 12.'
  },
  {
    id: 7,
    type: 'output',
    difficulty: 'Easy',
    code: `data = {'a': 1, 'b': 2}\nprint(data.get('c', 'default'))`,
    options: ['None', 'Error', 'default', '0'],
    correctAnswer: 3,
    explanation: 'The get() method returns the default value when the key doesn\'t exist.'
  },
  {
    id: 8,
    type: 'output',
    difficulty: 'Easy',
    code: `text = "python"\nprint(text[1:4])`,
    options: ['pyt', 'yth', 'ytho', 'tho'],
    correctAnswer: 2,
    explanation: 'String slicing [1:4] starts at index 1 and stops before index 4: y-t-h.'
  },
  {
    id: 9,
    type: 'output',
    difficulty: 'Easy',
    code: `nums = [1, 2, 3, 4, 5]\nprint(nums[-2])`,
    options: ['2', '3', '4', '5'],
    correctAnswer: 3,
    explanation: 'Negative indexing: -1 is the last element (5), -2 is second-to-last (4).'
  },
  {
    id: 10,
    type: 'output',
    difficulty: 'Easy',
    code: `x = 10\nif x > 5:\n    x = x // 3\nprint(x)`,
    options: ['3', '3.33', '4', '10'],
    correctAnswer: 1,
    explanation: 'Floor division // gives 10 // 3 = 3 (integer division).'
  },
  // ===== MEDIUM OUTPUT QUESTIONS =====
  {
    id: 11,
    type: 'output',
    difficulty: 'Medium',
    code: `numbers = [1, 2, 3, 4, 5]\nresult = [n * 2 for n in numbers if n % 2 == 0]\nprint(result)`,
    options: ['[2, 4, 6, 8, 10]', '[2, 6, 10]', '[4, 8]', '[2, 4, 6, 8]'],
    correctAnswer: 3,
    explanation: 'This list comprehension filters even numbers (2, 4) and then multiplies them by 2, resulting in [4, 8].'
  },
  {
    id: 12,
    type: 'output',
    difficulty: 'Medium',
    code: `def recursive_sum(n):\n    if n <= 1:\n        return n\n    return n + recursive_sum(n-1)\n\nprint(recursive_sum(5))`,
    options: ['5', '10', '15', '120'],
    correctAnswer: 3,
    explanation: 'The recursive function calculates 5 + 4 + 3 + 2 + 1 = 15.'
  },
  {
    id: 13,
    type: 'output',
    difficulty: 'Medium',
    code: `class Counter:\n    def __init__(self):\n        self.value = 0\n    def increment(self):\n        self.value += 1\n        return self\n\nc = Counter().increment().increment()\nprint(c.value)`,
    options: ['0', '1', '2', 'Error'],
    correctAnswer: 3,
    explanation: 'Method chaining works because increment() returns self. Two calls result in value = 2.'
  },
  {
    id: 14,
    type: 'output',
    difficulty: 'Medium',
    code: `def decorator(func):\n    def wrapper(*args, **kwargs):\n        print("Before")\n        result = func(*args, **kwargs)\n        print("After")\n        return result\n    return wrapper\n\n@decorator\ndef say_hello():\n    print("Hello")\n\nsay_hello()`,
    options: ['Hello', 'Before\\nHello\\nAfter', 'Before\\nAfter', 'Error'],
    correctAnswer: 2,
    explanation: 'The decorator wraps the function, printing "Before", then "Hello", then "After".'
  },
  {
    id: 15,
    type: 'output',
    difficulty: 'Medium',
    code: `data = [{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 30}]\nresult = [person['name'] for person in data if person['age'] > 26]\nprint(result)`,
    options: ['["Alice", "Bob"]', '["Bob"]', '["Alice"]', '[]'],
    correctAnswer: 2,
    explanation: 'Only Bob has age > 26, so result contains ["Bob"].'
  },
  {
    id: 16,
    type: 'output',
    difficulty: 'Medium',
    code: `x = [1, 2, 3]\ny = x.copy()\ny.append(4)\nprint(len(x), len(y))`,
    options: ['3 3', '4 4', '3 4', '4 3'],
    correctAnswer: 3,
    explanation: 'copy() creates a shallow copy. x remains [1,2,3] (length 3), y becomes [1,2,3,4] (length 4).'
  },
  {
    id: 17,
    type: 'output',
    difficulty: 'Medium',
    code: `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(6))`,
    options: ['5', '8', '13', '21'],
    correctAnswer: 2,
    explanation: 'Fibonacci sequence: 0,1,1,2,3,5,8. The 6th number is 8.'
  },
  {
    id: 18,
    type: 'output',
    difficulty: 'Medium',
    code: `text = "hello world"\nwords = text.split()\nresult = " ".join(word.capitalize() for word in words)\nprint(result)`,
    options: ['hello world', 'Hello World', 'HELLO WORLD', 'Hello world'],
    correctAnswer: 2,
    explanation: 'split() creates ["hello", "world"], capitalize() on each gives ["Hello", "World"], join with space gives "Hello World".'
  },
  {
    id: 19,
    type: 'output',
    difficulty: 'Medium',
    code: `nums = [1, 2, 3, 4, 5]\nfiltered = list(filter(lambda x: x % 2 == 0, nums))\nprint(sum(filtered))`,
    options: ['6', '9', '15', '30'],
    correctAnswer: 1,
    explanation: 'filter() gets even numbers [2, 4], sum([2, 4]) = 6.'
  },
  {
    id: 20,
    type: 'output',
    difficulty: 'Medium',
    code: `matrix = [[1, 2], [3, 4]]\nflat = [num for row in matrix for num in row]\nprint(flat)`,
    options: ['[[1, 2], [3, 4]]', '[1, 2, 3, 4]', '[1, 3, 2, 4]', 'Error'],
    correctAnswer: 2,
    explanation: 'Nested list comprehension flattens the matrix: [1, 2, 3, 4].'
  },
  // ===== HARD OUTPUT QUESTIONS =====
  {
    id: 21,
    type: 'output',
    difficulty: 'Hard',
    code: `x = 10\nif x > 5:\n    y = x + 2\nelif x < 5:\n    y = x - 2\nelse:\n    y = x * 2\n\ndef modify(y):\n    y = y + 5\n    return y\n    \nz = modify(y)\nprint(y)`,
    options: ['10', '12', '17', 'Error'],
    correctAnswer: 2,
    explanation: 'x is 10, so y becomes 12. The function modify creates a new local variable y, which doesn\'t affect the outer y. So print(y) shows 12.'
  },
  {
    id: 22,
    type: 'output',
    difficulty: 'Hard',
    code: `def closure_example():\n    x = 10\n    def inner():\n        nonlocal x\n        x += 5\n        return x\n    return inner\n\nfunc = closure_example()\nprint(func())\nprint(func())`,
    options: ['15\\n15', '15\\n20', '10\\n15', 'Error'],
    correctAnswer: 2,
    explanation: 'nonlocal allows inner() to modify x. First call: 10+5=15, second call: 15+5=20.'
  },
  {
    id: 23,
    type: 'output',
    difficulty: 'Hard',
    code: `class Parent:\n    def __init__(self):\n        self.value = 10\n    def show(self):\n        print(self.value)\n\nclass Child(Parent):\n    def __init__(self):\n        super().__init__()\n        self.value = 20\n\nc = Child()\nc.show()`,
    options: ['10', '20', 'Error', 'None'],
    correctAnswer: 2,
    explanation: 'Child inherits show() method from Parent, but overrides value to 20.'
  },
  {
    id: 24,
    type: 'output',
    difficulty: 'Hard',
    code: `def generator_func():\n    for i in range(3):\n        yield i * 2\n\ngen = generator_func()\nprint(next(gen))\nprint(next(gen))`,
    options: ['0\\n2', '0\\n1', '2\\n4', 'Error'],
    correctAnswer: 1,
    explanation: 'Generator yields 0*2=0, then 1*2=2 on successive next() calls.'
  },
  {
    id: 25,
    type: 'output',
    difficulty: 'Hard',
    code: `from functools import reduce\nnums = [1, 2, 3, 4]\nresult = reduce(lambda x, y: x * y, nums, 1)\nprint(result)`,
    options: ['10', '24', '1', 'Error'],
    correctAnswer: 2,
    explanation: 'reduce multiplies all numbers: 1*1*2*3*4 = 24.'
  },
  {
    id: 26,
    type: 'output',
    difficulty: 'Hard',
    code: `def memoize(func):\n    cache = {}\n    def wrapper(n):\n        if n not in cache:\n            cache[n] = func(n)\n        return cache[n]\n    return wrapper\n\n@memoize\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\nprint(fib(5))`,
    options: ['3', '5', '8', '13'],
    correctAnswer: 2,
    explanation: 'Memoized fibonacci: fib(5) = 5 (the 5th Fibonacci number).'
  },
  {
    id: 27,
    type: 'output',
    difficulty: 'Hard',
    code: `class Meta(type):\n    def __new__(cls, name, bases, attrs):\n        attrs['class_id'] = name.lower()\n        return super().__new__(cls, name, bases, attrs)\n\nclass MyClass(metaclass=Meta):\n    pass\n\nobj = MyClass()\nprint(obj.class_id)`,
    options: ['MyClass', 'myclass', 'Error', 'None'],
    correctAnswer: 2,
    explanation: 'Metaclass adds class_id attribute with lowercase class name: "myclass".'
  },
  {
    id: 28,
    type: 'output',
    difficulty: 'Hard',
    code: `def context_manager():\n    print("Enter")\n    try:\n        yield 42\n    finally:\n        print("Exit")\n\nwith context_manager() as value:\n    print(value)`,
    options: ['Enter\\n42\\nExit', '42\\nEnter\\nExit', 'Enter\\nExit\\n42', 'Error'],
    correctAnswer: 1,
    explanation: 'Context manager prints "Enter", yields 42, prints value, then "Exit" in finally block.'
  },
  {
    id: 29,
    type: 'output',
    difficulty: 'Hard',
    code: `import asyncio\n\nasync def async_func():\n    await asyncio.sleep(0)\n    return "Done"\n\nresult = asyncio.run(async_func())\nprint(result)`,
    options: ['Done', 'None', 'Error', 'coroutine object'],
    correctAnswer: 1,
    explanation: 'asyncio.run() executes the coroutine and returns "Done".'
  },
  {
    id: 30,
    type: 'output',
    difficulty: 'Hard',
    code: `def weird_default(x, lst=[]):\n    lst.append(x)\n    return lst\n\nprint(weird_default(1))\nprint(weird_default(2))`,
    options: ['[1]\\n[2]', '[1]\\n[1, 2]', '[1, 2]\\n[1, 2]', 'Error'],
    correctAnswer: 2,
    explanation: 'Mutable default arguments are shared between calls. lst accumulates values: [1], then [1, 2].'
  },

  // ===== EASY ERROR QUESTIONS =====
  {
    id: 31,
    type: 'error',
    difficulty: 'Easy',
    code: `def calculate_average(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total / count\n\navg = calculate_average([1, 2, 3, 4, 5])`,
    correctAnswer: 5,
    explanation: 'The variable "count" is used but never defined. It should be len(numbers) instead.'
  },
  {
    id: 32,
    type: 'error',
    difficulty: 'Easy',
    code: `fruits = ["apple", "banana", "cherry"]\nprint(fruits[3])`,
    correctAnswer: 2,
    explanation: 'List indices start at 0, so a list with 3 elements has indices 0, 1, and 2. Trying to access index 3 results in IndexError.'
  },
  {
    id: 33,
    type: 'error',
    difficulty: 'Easy',
    code: `def greet(name):\n    print(f"Hello, {name}")\n\ngreet()`,
    correctAnswer: 4,
    explanation: 'Function called without required argument. greet() requires a name parameter.'
  },
  {
    id: 34,
    type: 'error',
    difficulty: 'Easy',
    code: `x = 10\ny = 0\nresult = x / y\nprint(result)`,
    correctAnswer: 3,
    explanation: 'Division by zero raises ZeroDivisionError.'
  },
  {
    id: 35,
    type: 'error',
    difficulty: 'Easy',
    code: `data = {"name": "Alice", "age": 25}\nprint(data["city"])`,
    correctAnswer: 2,
    explanation: 'KeyError: "city" key doesn\'t exist in the dictionary.'
  },
  {
    id: 36,
    type: 'error',
    difficulty: 'Easy',
    code: `import math\nprint(math.sqert(16))`,
    correctAnswer: 2,
    explanation: 'AttributeError: "sqert" is misspelled. Should be "sqrt".'
  },
  {
    id: 37,
    type: 'error',
    difficulty: 'Easy',
    code: `nums = [1, 2, 3]\nfor i in range(len(nums)):\n    print(nums[i + 1])`,
    correctAnswer: 3,
    explanation: 'IndexError on final iteration: nums[3] doesn\'t exist for a 3-element list.'
  },
  {
    id: 38,
    type: 'error',
    difficulty: 'Easy',
    code: `def add_numbers(a, b)\n    return a + b`,
    correctAnswer: 1,
    explanation: 'SyntaxError: Missing colon (:) after function definition.'
  },
  {
    id: 39,
    type: 'error',
    difficulty: 'Easy',
    code: `if True\n    print("Hello")`,
    correctAnswer: 1,
    explanation: 'SyntaxError: Missing colon (:) after if statement.'
  },
  {
    id: 40,
    type: 'error',
    difficulty: 'Easy',
    code: `text = "Hello World"\nwords = text.split()\nprint(words.upper())`,
    correctAnswer: 3,
    explanation: 'AttributeError: Lists don\'t have upper() method. Should call upper() on individual strings.'
  },
  
  // ===== MEDIUM ERROR QUESTIONS =====
  {
    id: 41,
    type: 'error',
    difficulty: 'Medium',
    code: `def process_items(items):\n    result = []\n    for i in range(len(items)):\n        if items[i] > 10:\n            result.append(items[i])\n    return result\n\nnumbers = [5, 15, "20", 25]\nfiltered = process_items(numbers)`,
    correctAnswer: 4,
    explanation: 'The function tries to compare a string "20" with the integer 10, which causes a TypeError because these types can\'t be compared with >.'
  },
  {
    id: 42,
    type: 'error',
    difficulty: 'Medium',
    code: `class MyClass:\n    def __init__(self, value):\n        self.value = value\n    def display(self):\n        print(self.value)\n\nobj = MyClass()\nobj.display()`,
    correctAnswer: 7,
    explanation: 'TypeError: MyClass() missing required positional argument "value".'
  },
  {
    id: 43,
    type: 'error',
    difficulty: 'Medium',
    code: `def recursive_func(n):\n    if n == 0:\n        return 1\n    return n * recursive_func(n)\n\nprint(recursive_func(5))`,
    correctAnswer: 4,
    explanation: 'Infinite recursion: recursive_func(n) calls itself with the same n value, never reaching base case.'
  },
  {
    id: 44,
    type: 'error',
    difficulty: 'Medium',
    code: `with open("nonexistent.txt", "r") as file:\n    content = file.read()\n    print(content)`,
    correctAnswer: 1,
    explanation: 'FileNotFoundError: The file "nonexistent.txt" doesn\'t exist.'
  },
  {
    id: 45,
    type: 'error',
    difficulty: 'Medium',
    code: `def validate_age(age):\n    if age < 0:\n        raise ValueError("Age cannot be negative")\n    return True\n\nvalidate_age(-5)`,
    correctAnswer: 5,
    explanation: 'ValueError raised by the function when age is negative.'
  },
  
  // ===== HARD ERROR QUESTIONS =====
  {
    id: 46,
    type: 'error',
    difficulty: 'Hard',
    code: `import threading\n\ncount = 0\n\ndef increment():\n    global count\n    for i in range(1000):\n        count += 1\n\nthreads = [threading.Thread(target=increment) for _ in range(5)]\nfor t in threads:\n    t.start()\nfor t in threads:\n    t.join()\n\nprint(count)`,
    correctAnswer: 9,
    explanation: 'Race condition: Multiple threads accessing shared variable without proper synchronization.'
  },
  {
    id: 47,
    type: 'error',
    difficulty: 'Hard',
    code: `class Parent:\n    def __init__(self):\n        self.data = []\n\nclass Child(Parent):\n    def add_data(self, item):\n        super().data.append(item)\n\nc = Child()\nc.add_data("test")`,
    correctAnswer: 6,
    explanation: 'AttributeError: super() returns a proxy object, not the parent instance. Should use self.data.append(item).'
  },
  {
    id: 48,
    type: 'error',
    difficulty: 'Hard',
    code: `from functools import wraps\n\ndef decorator(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(args, kwargs)\n    return wrapper\n\n@decorator\ndef test_func(a, b):\n    return a + b\n\nprint(test_func(1, 2))`,
    correctAnswer: 5,
    explanation: 'TypeError: func() is called with tuple and dict instead of unpacked arguments. Should use *args, **kwargs.'
  },

  // ===== FIX QUESTIONS =====
  {
    id: 49,
    type: 'fix',
    difficulty: 'Easy',
    code: `def calculate_area(radius):\n    pi = 3.14159\n    area = pi * radius * radius\n    retrun area\n\nresult = calculate_area(5)`,
    lineToFix: 4,
    correctAnswer: 'return area',
    explanation: 'Fix the typo: "retrun" should be "return".'
  },
  {
    id: 50,
    type: 'fix',
    difficulty: 'Medium',
    code: `def find_max(numbers):\n    max_val = numbers[0]\n    for num in numbers:\n        if num > max_val:\n            max_val = num\n    return max_val\n\nresult = find_max([])`,
    lineToFix: 2,
    correctAnswer: 'max_val = numbers[0] if numbers else None',
    explanation: 'Handle empty list case to prevent IndexError.'
  }
];
