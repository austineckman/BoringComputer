import { Question } from './questions-interface';

export const cppQuestions: Question[] = [
  // ===== EASY OUTPUT QUESTIONS =====
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 5;\n  int y = 3;\n  cout << x + y * 2;\n  return 0;\n}`,
    options: ['8', '11', '16', 'Error'],
    correctAnswer: 2,
    explanation: 'The expression evaluates to 5 + (3 * 2) = 5 + 6 = 11. Multiplication has higher precedence than addition.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nstring greet(string name) {\n  return "Hello, " + name + "!";\n}\n\nint main() {\n  string result = greet("Gizbo");\n  cout << result;\n  return 0;\n}`,
    options: ['Hello, Gizbo!', 'Hello, name!', 'Hello, "Gizbo"!', 'Error'],
    correctAnswer: 1,
    explanation: 'The function returns a string where name is replaced with the argument "Gizbo".'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<int> nums = {1, 2, 3};\n  vector<int> copy = nums;\n  copy.push_back(4);\n  cout << nums.size() << " " << copy.size();\n  return 0;\n}`,
    options: ['3 3', '4 4', '3 4', '4 3'],
    correctAnswer: 3,
    explanation: 'Vector copy creates a separate copy. nums remains size 3, copy becomes size 4.'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 10;\n  int y = x / 3;\n  cout << y;\n  return 0;\n}`,
    options: ['3', '3.33', '4', 'Error'],
    correctAnswer: 1,
    explanation: 'Integer division truncates the decimal: 10 / 3 = 3 (not 3.33).'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  char letter = 'A';\n  cout << letter + 1;\n  return 0;\n}`,
    options: ['A1', 'B', '66', 'Error'],
    correctAnswer: 3,
    explanation: 'Adding 1 to char performs arithmetic on ASCII value: A(65) + 1 = 66.'
  },
  {
    id: 6,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  bool flag = true;\n  cout << !flag << " " << flag;\n  return 0;\n}`,
    options: ['0 1', '1 0', 'false true', 'true false'],
    correctAnswer: 1,
    explanation: 'Boolean values print as 0 (false) and 1 (true). !true = false (0).'
  },
  {
    id: 7,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int arr[] = {10, 20, 30};\n  cout << arr[1];\n  return 0;\n}`,
    options: ['10', '20', '30', 'Error'],
    correctAnswer: 2,
    explanation: 'Array indexing starts at 0. arr[1] is the second element: 20.'
  },
  {
    id: 8,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 5;\n  cout << ++x << " " << x++;\n  return 0;\n}`,
    options: ['6 5', '5 6', '6 6', 'Error'],
    correctAnswer: 3,
    explanation: 'Pre-increment (++x) increments then returns 6. Post-increment (x++) returns 6 then increments. Both expressions see x as 6.'
  },
  {
    id: 9,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 8;\n  x %= 3;\n  cout << x;\n  return 0;\n}`,
    options: ['2', '2.67', '3', '5'],
    correctAnswer: 1,
    explanation: 'Modulo operator: 8 % 3 = 2 (remainder when 8 is divided by 3).'
  },
  {
    id: 10,
    type: 'output',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nvoid mystery(int& x) {\n  x *= 2;\n}\n\nint main() {\n  int num = 5;\n  mystery(num);\n  cout << num;\n  return 0;\n}`,
    options: ['5', '10', '25', 'Error'],
    correctAnswer: 2,
    explanation: 'Pass by reference (&) allows the function to modify the original variable: 5 * 2 = 10.'
  },
  // ===== MEDIUM OUTPUT QUESTIONS =====
  {
    id: 11,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<int> numbers = {1, 2, 3, 4, 5};\n  vector<int> result;\n  \n  for(int n : numbers) {\n    if(n % 2 == 0) {\n      result.push_back(n * 2);\n    }\n  }\n  \n  cout << "[";\n  for(int i = 0; i < result.size(); i++) {\n    cout << result[i];\n    if(i < result.size() - 1) cout << ", ";\n  }\n  cout << "]";\n  \n  return 0;\n}`,
    options: ['[2, 4, 6, 8, 10]', '[2, 6, 10]', '[4, 8]', '[2, 4, 6, 8]'],
    correctAnswer: 3,
    explanation: 'The loop filters even numbers (2, 4) and then multiplies them by 2, resulting in [4, 8].'
  },
  {
    id: 12,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nint recursiveSum(int n) {\n  if(n <= 1) return n;\n  return n + recursiveSum(n-1);\n}\n\nint main() {\n  cout << recursiveSum(5);\n  return 0;\n}`,
    options: ['5', '10', '15', '120'],
    correctAnswer: 3,
    explanation: 'The recursive function calculates 5 + 4 + 3 + 2 + 1 = 15.'
  },
  {
    id: 13,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Counter {\npublic:\n    int value;\n    Counter() : value(0) {}\n    Counter& increment() {\n        value++;\n        return *this;\n    }\n};\n\nint main() {\n    Counter c;\n    c.increment().increment();\n    cout << c.value;\n    return 0;\n}`,
    options: ['0', '1', '2', 'Error'],
    correctAnswer: 3,
    explanation: 'Method chaining: increment() returns *this, allowing two increments: 0 -> 1 -> 2.'
  },
  {
    id: 14,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <algorithm>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {5, 2, 8, 1, 9};\n    sort(nums.begin(), nums.end());\n    cout << nums[2];\n    return 0;\n}`,
    options: ['8', '5', '2', '1'],
    correctAnswer: 2,
    explanation: 'After sorting: [1, 2, 5, 8, 9]. Index 2 contains 5.'
  },
  {
    id: 15,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    virtual void show() { cout << "Base"; }\n};\n\nclass Derived : public Base {\npublic:\n    void show() override { cout << "Derived"; }\n};\n\nint main() {\n    Base* ptr = new Derived();\n    ptr->show();\n    delete ptr;\n    return 0;\n}`,
    options: ['Base', 'Derived', 'Error', 'BaseDerived'],
    correctAnswer: 2,
    explanation: 'Virtual function allows polymorphism. Base pointer to Derived object calls Derived::show().'
  },
  {
    id: 16,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <memory>\nusing namespace std;\n\nint main() {\n    unique_ptr<int> ptr1 = make_unique<int>(42);\n    unique_ptr<int> ptr2 = move(ptr1);\n    cout << (ptr1 == nullptr) << " " << *ptr2;\n    return 0;\n}`,
    options: ['0 42', '1 42', '1 0', 'Error'],
    correctAnswer: 2,
    explanation: 'move() transfers ownership. ptr1 becomes nullptr, ptr2 owns the value 42.'
  },
  {
    id: 17,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <map>\nusing namespace std;\n\nint main() {\n    map<string, int> scores;\n    scores["Alice"] = 95;\n    scores["Bob"] = 87;\n    scores["Alice"] = 92;\n    cout << scores.size() << " " << scores["Alice"];\n    return 0;\n}`,
    options: ['2 95', '3 95', '2 92', '3 92'],
    correctAnswer: 3,
    explanation: 'Map keys are unique. Setting scores["Alice"] = 92 overwrites the previous value. Size is 2.'
  },
  {
    id: 18,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    cout << getMax(5, 3) << " " << getMax(2.1, 4.7);\n    return 0;\n}`,
    options: ['5 4.7', '3 2.1', '5 2.1', 'Error'],
    correctAnswer: 1,
    explanation: 'Template function works with different types: max(5,3)=5, max(2.1,4.7)=4.7.'
  },
  {
    id: 19,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nstruct Point {\n    int x, y;\n    Point(int a, int b) : x(a), y(b) {}\n};\n\nint main() {\n    Point p1(3, 4);\n    Point p2 = p1;\n    p2.x = 5;\n    cout << p1.x << " " << p2.x;\n    return 0;\n}`,
    options: ['3 3', '5 5', '3 5', '5 3'],
    correctAnswer: 3,
    explanation: 'Struct copy creates separate objects. Modifying p2.x doesn\'t affect p1.x.'
  },
  {
    id: 20,
    type: 'output',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[3][2] = {{1, 2}, {3, 4}, {5, 6}};\n    cout << arr[1][0] << arr[2][1];\n    return 0;\n}`,
    options: ['24', '36', '14', '46'],
    correctAnswer: 2,
    explanation: '2D array: arr[1][0] is 3 (row 1, col 0), arr[2][1] is 6 (row 2, col 1). Output: 36.'
  },
  
  // ===== HARD OUTPUT QUESTIONS =====
  {
    id: 21,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\nint modify(int y) {\n  y = y + 5;\n  return y;\n}\n\nint main() {\n  int x = 10;\n  int y;\n  \n  if(x > 5) {\n    y = x + 2;\n  } else if(x < 5) {\n    y = x - 2;\n  } else {\n    y = x * 2;\n  }\n  \n  int z = modify(y);\n  cout << y;\n  return 0;\n}`,
    options: ['10', '12', '17', 'Error'],
    correctAnswer: 2,
    explanation: 'x is 10, so y becomes 12. The function modify creates a new local variable y, which doesn\'t affect the outer y. So cout << y shows 12.'
  },
  {
    id: 22,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>\n#include <functional>\nusing namespace std;\n\nfunction<int()> makeCounter() {\n    static int count = 0;\n    return [&]() { return ++count; };\n}\n\nint main() {\n    auto counter1 = makeCounter();\n    auto counter2 = makeCounter();\n    cout << counter1() << counter2() << counter1();\n    return 0;\n}`,
    options: ['121', '123', '111', 'Error'],
    correctAnswer: 2,
    explanation: 'Static variable shared between lambdas: counter1() returns 1, counter2() returns 2, counter1() returns 3.'
  },
  {
    id: 23,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\nclass A {\npublic:\n    virtual void f() { cout << "A"; }\n};\n\nclass B : public A {\npublic:\n    void f() override { cout << "B"; A::f(); }\n};\n\nint main() {\n    B obj;\n    obj.f();\n    return 0;\n}`,
    options: ['A', 'B', 'BA', 'AB'],
    correctAnswer: 3,
    explanation: 'B::f() prints "B" then calls A::f() which prints "A", resulting in "BA".'
  },
  {
    id: 24,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\ntemplate<int N>\nstruct Factorial {\n    static const int value = N * Factorial<N-1>::value;\n};\n\ntemplate<>\nstruct Factorial<0> {\n    static const int value = 1;\n};\n\nint main() {\n    cout << Factorial<4>::value;\n    return 0;\n}`,
    options: ['4', '10', '24', 'Error'],
    correctAnswer: 3,
    explanation: 'Template metaprogramming calculates factorial at compile time: 4! = 4*3*2*1 = 24.'
  },
  {
    id: 25,
    type: 'output',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\nclass RAII {\n    string name;\npublic:\n    RAII(string n) : name(n) { cout << "+" << name; }\n    ~RAII() { cout << "-" << name; }\n};\n\nint main() {\n    {\n        RAII obj1("A");\n        RAII obj2("B");\n    }\n    cout << "End";\n    return 0;\n}`,
    options: ['+A+B-A-BEnd', '+A+B-B-AEnd', '+A+BEnd-A-B', 'Error'],
    correctAnswer: 2,
    explanation: 'RAII objects destroyed in reverse order of construction: +A+B (creation), -B-A (destruction), End.'
  },

  // ===== EASY ERROR QUESTIONS =====
  {
    id: 26,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\ndouble calculateAverage(vector<int> numbers) {\n  int total = 0;\n  for(int num : numbers) {\n    total += num;\n  }\n  return total / count;\n}\n\nint main() {\n  vector<int> nums = {1, 2, 3, 4, 5};\n  double avg = calculateAverage(nums);\n  cout << avg << endl;\n  return 0;\n}`,
    correctAnswer: 9,
    explanation: 'The variable "count" is used but never defined. It should be numbers.size() instead.'
  },
  {
    id: 27,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<string> fruits = {"apple", "banana", "cherry"};\n  cout << fruits[3] << endl;\n  return 0;\n}`,
    correctAnswer: 6,
    explanation: 'Vector indices start at 0, so a vector with 3 elements has indices 0, 1, and 2. Trying to access index 3 results in an out-of-range error.'
  },
  {
    id: 28,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    int y = 0;\n    cout << x / y;\n    return 0;\n}`,
    correctAnswer: 6,
    explanation: 'Division by zero causes undefined behavior in C++.'
  },
  {
    id: 29,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nvoid test()\n    cout << "Hello";\n}\n\nint main() {\n    test();\n    return 0;\n}`,
    correctAnswer: 4,
    explanation: 'Missing opening brace { after function declaration.'
  },
  {
    id: 30,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[3] = {1, 2, 3};\n    cout << arr[5];\n    return 0;\n}`,
    correctAnswer: 5,
    explanation: 'Array index out of bounds. arr[5] accesses memory beyond the array.'
  },
  {
    id: 31,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    string text = "Hello";\n    cout << text.length\n    return 0;\n}`,
    correctAnswer: 6,
    explanation: 'Missing parentheses for function call: should be text.length().'
  },
  {
    id: 32,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int* ptr;\n    *ptr = 10;\n    cout << *ptr;\n    return 0;\n}`,
    correctAnswer: 5,
    explanation: 'Dereferencing uninitialized pointer. ptr doesn\'t point to valid memory.'
  },
  {
    id: 33,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    if (true) {\n        int x = 5;\n    }\n    cout << x;\n    return 0;\n}`,
    correctAnswer: 8,
    explanation: 'Variable x is out of scope. It was declared inside the if block.'
  },
  {
    id: 34,
    type: 'error',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nclass Test {\npublic:\n    Test() { cout << "Created"; }\n};\n\nint main() {\n    Test obj();\n    return 0;\n}`,
    correctAnswer: 10,
    explanation: 'Most vexing parse: Test obj() declares a function, not an object. Should be Test obj;.'
  },
  // ===== MEDIUM ERROR QUESTIONS =====
  {
    id: 35,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> processItems(vector<string> items) {\n  vector<int> result;\n  for(int i = 0; i < items.size(); i++) {\n    if(items[i] > 10) {\n      result.push_back(stoi(items[i]));\n    }\n  }\n  return result;\n}\n\nint main() {\n  vector<string> numbers = {"5", "15", "20", "25"};\n  vector<int> filtered = processItems(numbers);\n  return 0;\n}`,
    correctAnswer: 9,
    explanation: 'The function tries to compare a string with the integer 10, which causes an error because these types can\'t be compared with >.'
  },
  {
    id: 36,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nclass MyClass {\npublic:\n    MyClass(int val) : value(val) {}\n    void display() { cout << value; }\nprivate:\n    int value;\n};\n\nint main() {\n    MyClass obj;\n    obj.display();\n    return 0;\n}`,
    correctAnswer: 13,
    explanation: 'No default constructor available. MyClass requires an int parameter.'
  },
  {
    id: 37,
    type: 'error',
    difficulty: 'Medium',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    const int size = 5;\n    int arr[size];\n    for(int i = 0; i <= size; i++) {\n        arr[i] = i;\n    }\n    return 0;\n}`,
    correctAnswer: 7,
    explanation: 'Loop condition i <= size causes array bounds violation. Should be i < size.'
  },
  
  // ===== HARD ERROR QUESTIONS =====
  {
    id: 38,
    type: 'error',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    Base() { cout << "Base"; }\n    ~Base() { cout << "~Base"; }\n};\n\nclass Derived : public Base {\npublic:\n    Derived() { cout << "Derived"; }\n    ~Derived() { cout << "~Derived"; }\n};\n\nint main() {\n    Base* ptr = new Derived();\n    delete ptr;\n    return 0;\n}`,
    correctAnswer: 7,
    explanation: 'Missing virtual destructor in Base class. Derived destructor won\'t be called, causing resource leak.'
  },
  {
    id: 39,
    type: 'error',
    difficulty: 'Hard',
    code: `#include <iostream>\n#include <thread>\nusing namespace std;\n\nint counter = 0;\n\nvoid increment() {\n    for(int i = 0; i < 1000; i++) {\n        counter++;\n    }\n}\n\nint main() {\n    thread t1(increment);\n    thread t2(increment);\n    t1.join();\n    t2.join();\n    cout << counter;\n    return 0;\n}`,
    correctAnswer: 8,
    explanation: 'Race condition: Multiple threads accessing shared variable without synchronization.'
  },
  {
    id: 40,
    type: 'error',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\ntemplate<typename T>\nclass Container {\nprivate:\n    T* data;\n    size_t size;\npublic:\n    Container(size_t s) : size(s) {\n        data = new T[size];\n    }\n    ~Container() {\n        delete data;\n    }\n};\n\nint main() {\n    Container<int> c(10);\n    return 0;\n}`,
    correctAnswer: 13,
    explanation: 'Should use delete[] for arrays, not delete. Using delete causes undefined behavior.'
  },

  // ===== FIX QUESTIONS =====
  {
    id: 41,
    type: 'fix',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nint multiply(int a, int b) {\n  return a * B;\n}\n\nint main() {\n  int result = multiply(3, 4);\n  cout << result;\n  return 0;\n}`,
    lineToFix: 5,
    correctAnswer: 'return a * b;',
    explanation: 'Variable names are case-sensitive. Should use lowercase "b".'
  },
  {
    id: 42,
    type: 'fix',
    difficulty: 'Easy',
    code: `#include <iostream>\nusing namespace std;\n\nbool isEven(int number) {\n  if(number % 2 = 0) {\n    return true;\n  }\n  return false;\n}`,
    lineToFix: 5,
    correctAnswer: 'if(number % 2 == 0) {',
    explanation: 'Use == for comparison, = is assignment operator.'
  },
  {
    id: 43,
    type: 'fix',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums;\n    nums.push_back(1);\n    nums.push_back(2);\n    nums.push_back(3);\n    \n    for(int i = 0; i <= nums.size(); i++) {\n        cout << nums[i] << " ";\n    }\n    return 0;\n}`,
    lineToFix: 11,
    correctAnswer: 'for(int i = 0; i < nums.size(); i++) {',
    explanation: 'Loop should use < instead of <= to avoid accessing beyond array bounds.'
  },
  {
    id: 44,
    type: 'fix',
    difficulty: 'Medium',
    code: `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Person {\nprivate:\n    string name;\n    int age;\npublic:\n    Person(string n, int a) : name(n), age(a) {}\n    void display() const {\n        cout << "Name: " << name << ", Age: " << age;\n    }\n};\n\nint main(\n    Person p("Alice", 25);\n    p.display();\n    return 0;\n}`,
    lineToFix: 16,
    correctAnswer: 'int main() {',
    explanation: 'Missing closing parenthesis and opening brace for main function.'
  },
  {
    id: 45,
    type: 'fix',
    difficulty: 'Hard',
    code: `#include <iostream>\nusing namespace std;\n\nclass Resource {\npublic:\n    Resource() { cout << "Acquired"; }\n    ~Resource() { cout << "Released"; }\n};\n\nclass Manager {\nprivate:\n    Resource* res;\npublic:\n    Manager() : res(new Resource()) {}\n    ~Manager() { delete res; }\n    Manager(const Manager& other) : res(other.res) {}\n};\n\nint main() {\n    Manager m1;\n    Manager m2 = m1;\n    return 0;\n}`,
    lineToFix: 16,
    correctAnswer: 'Manager(const Manager& other) : res(new Resource(*other.res)) {}',
    explanation: 'Copy constructor should perform deep copy, not shallow copy to avoid double deletion.'
  }
];
