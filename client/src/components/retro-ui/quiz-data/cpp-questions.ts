// C++ debugging quiz questions

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

export const cppQuestions: Question[] = [
  // Output Prediction Questions (10)
  {
    id: 1,
    type: 'output',
    difficulty: 'Easy',
    code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    int y = 2;\n    cout << x * y + 1;\n    return 0;\n}',
    options: ['10', '11', '7', 'Error'],
    correctAnswer: 2,
    explanation: 'This code multiplies x (5) by y (2) to get 10, then adds 1 to get 11.'
  },
  {
    id: 2,
    type: 'output',
    difficulty: 'Easy',
    code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10;\n    int b = 3;\n    cout << a % b;\n    return 0;\n}',
    options: ['3.33', '3', '1', 'Error'],
    correctAnswer: 3,
    explanation: 'The modulo operator (%) returns the remainder of division. 10 divided by 3 gives 3 with a remainder of 1.'
  },
  {
    id: 3,
    type: 'output',
    difficulty: 'Medium',
    code: '#include <iostream>\nusing namespace std;\n\nint func(int x, int y = 2) {\n    return x + y;\n}\n\nint main() {\n    cout << func(3);\n    return 0;\n}',
    options: ['3', '5', 'Error: missing required argument', 'None'],
    correctAnswer: 2,
    explanation: 'The function has a default parameter y=2, so calling func(3) uses x=3 and y=2, resulting in 5.'
  },
  {
    id: 4,
    type: 'output',
    difficulty: 'Medium',
    code: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> data = {1, 2, 3};\n    vector<int> result;\n    for (int i = 0; i < data.size(); i++) {\n        result.push_back(data[i] * 2);\n    }\n    for (int i = 0; i < result.size(); i++) {\n        cout << result[i] << " ";\n    }\n    return 0;\n}',
    options: ['1 2 3 1 2 3', '2 4 6', '1 4 9', '1 2 3'],
    correctAnswer: 2,
    explanation: 'The loop iterates through indices 0, 1, 2, multiplies each element by 2, and appends to result.'
  },
  {
    id: 5,
    type: 'output',
    difficulty: 'Medium',
    code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string text = "scraplight cartel";\n    cout << text.substr(0, 1) << text.substr(2, 1) << text.substr(4, 1) << text.back();\n    return 0;\n}',
    options: ['srl', 'scal', 'sral', 'scrl'],
    correctAnswer: 1,
    explanation: 'text.substr(0, 1) gets "s", text.substr(2, 1) gets "r", text.substr(4, 1) gets "a", and text.back() gets the last character "l".'
  },
  {
    id: 6,
    type: 'output',
    difficulty: 'Hard',
    code: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> modify(vector<int> items) {\n    items.push_back(4);\n    items = {7, 8, 9};\n    return items;\n}\n\nint main() {\n    vector<int> data = {1, 2, 3};\n    vector<int> result = modify(data);\n    cout << "data: ";\n    for (int num : data) cout << num << " ";\n    cout << "\nresult: ";\n    for (int num : result) cout << num << " ";\n    return 0;\n}',
    options: ['data: 1 2 3 \nresult: 7 8 9', 'data: 1 2 3 4 \nresult: 7 8 9', 'data: 7 8 9 \nresult: 7 8 9', 'data: 1 2 3 4 \nresult: 1 2 3 4'],
    correctAnswer: 1,
    explanation: 'In C++, vectors are passed by value unless specifically passed by reference. The original vector remains unchanged, while the function returns a new vector with values {7, 8, 9}.'
  },
  {
    id: 7,
    type: 'output',
    difficulty: 'Hard',
    code: '#include <iostream>\nusing namespace std;\n\nclass Counter {\nprivate:\n    int count;\n\npublic:\n    Counter(int start = 0) {\n        count = start;\n    }\n    \n    Counter& increment() {\n        count++;\n        return *this;\n    }\n    \n    int getValue() {\n        return count;\n    }\n};\n\nint main() {\n    Counter c(5);\n    c.increment().increment();\n    cout << c.getValue();\n    return 0;\n}',
    options: ['5', '6', '7', 'Error'],
    correctAnswer: 3,
    explanation: 'The increment method returns a reference to the current object (*this), allowing for method chaining. It\'s called twice, incrementing the count from 5 to 7.'
  },
  {
    id: 8,
    type: 'output',
    difficulty: 'Hard',
    code: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> numbers = {1, 2, 3, 4, 5};\n    vector<int> filtered;\n    copy_if(numbers.begin(), numbers.end(), back_inserter(filtered),\n        [](int x) { return x % 2 == 0; });\n    \n    vector<int> mapped;\n    transform(filtered.begin(), filtered.end(), back_inserter(mapped),\n        [](int x) { return x * 2; });\n    \n    for (int num : mapped) cout << num << " ";\n    return 0;\n}',
    options: ['2 4 6 8 10', '4 8', '2 4', '4'],
    correctAnswer: 2,
    explanation: 'First, copy_if filters and retains only even numbers [2, 4], then transform doubles each value to produce [4, 8].'
  },
  {
    id: 9,
    type: 'output',
    difficulty: 'Hard',
    code: '#include <iostream>\n#include <regex>\n#include <string>\nusing namespace std;\n\nint main() {\n    string text = "Gizbo\'s code: ABC-123-XYZ";\n    regex pattern("[A-Z]+-\\d+-[A-Z]+");\n    smatch matches;\n    regex_search(text, matches, pattern);\n    if (matches.size() > 0) {\n        cout << matches[0].str();\n    } else {\n        cout << "No match";\n    }\n    return 0;\n}',
    options: ['Gizbo\'s code:', 'ABC-123-XYZ', 'code: ABC-123-XYZ', 'No match'],
    correctAnswer: 2,
    explanation: 'The regex pattern matches uppercase letters, followed by a hyphen, digits, another hyphen, and more uppercase letters, which is "ABC-123-XYZ" in the text.'
  },
  {
    id: 10,
    type: 'output',
    difficulty: 'Hard',
    code: '#include <iostream>\n#include <numeric>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> numbers = {1, 2, 3, 4};\n    int result = accumulate(numbers.begin(), numbers.end(), 1,\n        [](int a, int b) { return a * b; });\n    cout << result;\n    return 0;\n}',
    options: ['10', '24', '1 2 3 4', '0'],
    correctAnswer: 2,
    explanation: 'The accumulate function with the lambda multiplies all numbers together, starting with the initial value 1: ((((1*1)*2)*3)*4) = 24.'
  },

  // Error Detection Questions (10)
  {
    id: 11,
    type: 'error',
    difficulty: 'Easy',
    code: '#include <iostream>\nusing namespace std;\n\nint calculateTotal(int items[], int size) {\n    int total = 0;\n    for (int i = 0; i < size)\n        total += items[i];\n    return total;\n}\n\nint main() {\n    int numbers[] = {1, 2, 3};\n    cout << calculateTotal(numbers, 3);\n    return 0;\n}',
    correctAnswer: 6,
    explanation: 'The for loop condition is missing the increment part. It should be "for (int i = 0; i < size; i++)"'
  },
  {
    id: 12,
    type: 'error',
    difficulty: 'Easy',
    code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string message = "Hello World";\n    cout << mesage;\n    return 0;\n}',
    correctAnswer: 7,
    explanation: 'There\'s a typo in the variable name. It\'s defined as "message" but referenced as "mesage".'
  },
  {
    id: 13,
    type: 'error',
    difficulty: 'Easy',
    code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    if (x > 5)\n        cout << "x is greater than 5"\n    return 0;\n}',
    correctAnswer: 7,
    explanation: 'There\'s a missing semicolon after the cout statement.'
  },
  {
    id: 14,
    type: 'error',
    difficulty: 'Medium',
    code: '#include <iostream>\nusing namespace std;\n\nint divide(int a, int b) {\n    return a / b;\n}\n\nint main() {\n    int result = divide(10, 0);\n    cout << result;\n    return 0;\n}',
    correctAnswer: 9,
    explanation: 'Line 9 causes a division by zero error, which is undefined behavior in C++.'
  },
  {
    id: 15,
    type: 'error',
    difficulty: 'Medium',
    code: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> data = {1, 2, 3, 4, 5};\n    for (int i = 0; i < data.size(); i++) {\n        if (data[i] % 2 == 0) {\n            data.erase(data.begin() + i);\n        }\n    }\n    for (int num : data) {\n        cout << num << " ";\n    }\n    return 0;\n}',
    correctAnswer: 7,
    explanation: 'Modifying a vector while iterating through it using indices can cause index errors or skip elements. The iterator is invalidated after erase(), and the loop should be modified to handle this.'
  },
  {
    id: 16,
    type: 'error',
    difficulty: 'Medium',
    code: '#include <iostream>\nusing namespace std;\n\nint recursiveSum(int n) {\n    if (n <= 0) {\n        return 0;\n    } else {\n        return n + recursiveSum(n-1);\n    }\n}\n\nint main() {\n    cout << recursiveSum(50000);\n    return 0;\n}',
    correctAnswer: 13,
    explanation: 'This will likely cause a stack overflow due to too deep recursion with such a large input. C++ has default stack size limitations.'
  },
  {
    id: 17,
    type: 'error',
    difficulty: 'Medium',
    code: '#include <iostream>\n#include <map>\n#include <string>\nusing namespace std;\n\nint main() {\n    map<string, int> items;\n    items["name"] = "Circuit";\n    items["price"] = 50;\n    items["quantity"] += 1;\n    cout << items["quantity"];\n    return 0;\n}',
    correctAnswer: 8,
    explanation: 'Line 8 attempts to store a string "Circuit" in a map that requires int values.'
  },
  {
    id: 18,
    type: 'error',
    difficulty: 'Hard',
    code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Device {\nprivate:\n    string name;\n\npublic:\n    Device(string name) {\n        this->name = name;\n    }\n    \n    void activate() {\n        cout << name << " activated" << endl;\n    }\n};\n\nvoid processDevice(Device device) {\n    device.activate();\n}\n\nint main() {\n    processDevice("Quantum Circuit");\n    return 0;\n}',
    correctAnswer: 24,
    explanation: 'The processDevice function expects a Device object, but a string is passed instead. There\'s no implicit conversion from string to Device.'
  },
  {
    id: 19,
    type: 'error',
    difficulty: 'Hard',
    code: '#include <iostream>\n#include <thread>\n#include <vector>\nusing namespace std;\n\nint count = 0;\n\nvoid increment() {\n    for (int i = 0; i < 1000000; i++) {\n        count++;\n    }\n}\n\nint main() {\n    vector<thread> threads;\n    for (int i = 0; i < 2; i++) {\n        threads.push_back(thread(increment));\n    }\n    \n    for (auto& t : threads) {\n        t.join();\n    }\n    \n    cout << "Final count: " << count << endl;\n    return 0;\n}',
    correctAnswer: 10,
    explanation: 'There\'s a race condition when multiple threads try to increment the same global variable without proper synchronization, like a mutex.'
  },
  {
    id: 20,
    type: 'error',
    difficulty: 'Hard',
    code: '#include <iostream>\nusing namespace std;\n\nclass Node {\npublic:\n    int value;\n    Node* next;\n    \n    Node(int val, Node* nxt = nullptr) {\n        value = val;\n        next = nxt;\n    }\n};\n\nNode* createCycle() {\n    Node* a = new Node(1);\n    Node* b = new Node(2);\n    Node* c = new Node(3);\n    a->next = b;\n    b->next = c;\n    c->next = a;  // Create a cycle\n    return a;\n}\n\nvoid printList(Node* head, int maxNodes = 10) {\n    Node* current = head;\n    while (current) {\n        cout << current->value << " ";\n        current = current->next;\n    }\n    cout << endl;\n}\n\nint main() {\n    Node* head = createCycle();\n    printList(head);\n    return 0;\n}',
    correctAnswer: 29,
    explanation: 'The linked list has a cycle (a->b->c->a), so the while loop in printList never terminates because current is never nullptr. Also, there\'s a memory leak since the nodes are never deleted.'
  },

  // Code Fixing Questions (10)
  {
    id: 21,
    type: 'fix',
    difficulty: 'Easy',
    code: '1  #include <iostream>\n2  #include <string>\n3  using namespace std;\n4\n5  string greet(string name) {\n6      return "Hello, " + name;\n7  }\n8\n9  int main() {\n10     string message = greet("Gizbo"\n11     cout << message << endl;\n12     return 0;\n13 }',
    lineToFix: 10,
    correctAnswer: 'string message = greet("Gizbo");',
    explanation: 'There was a missing closing parenthesis after "Gizbo". The correct line should have the closing parenthesis.'
  },
  {
    id: 22,
    type: 'fix',
    difficulty: 'Easy',
    code: '1  #include <iostream>\n2  #include <vector>\n3  using namespace std;\n4\n5  int main() {\n6      vector<int> numbers = {1, 2, 3, 4, 5};\n7      int total = 0;\n8      for (int num : numbers)\n9          total += num;\n10     cout << "Sum: " << total << endl;\n11     return 0;\n12 }',
    lineToFix: 8,
    correctAnswer: 'for (int num : numbers) {',
    explanation: 'The for loop is missing braces. While not always required for single statements, it\'s good practice to include them for clarity and to prevent logic errors when adding more code.'
  },
  {
    id: 23,
    type: 'fix',
    difficulty: 'Easy',
    code: '1  #include <iostream>\n2  using namespace std;\n3\n4  double calculatePrice(double price, double discount) {\n5      if (discount > 0)\n6          return price - (price * discount)\n7      return price;\n8  }\n9\n10 int main() {\n11     cout << calculatePrice(100, 0.2) << endl;\n12     return 0;\n13 }',
    lineToFix: 6,
    correctAnswer: 'return price - (price * discount);',
    explanation: 'The return statement was missing a semicolon. In C++, statements must end with a semicolon.'
  },
  {
    id: 24,
    type: 'fix',
    difficulty: 'Medium',
    code: '1  #include <iostream>\n2  #include <map>\n3  #include <string>\n4  using namespace std;\n5\n6  int main() {\n7      map<string, int> inventory = {{"circuits", 5}, {"chips", 10}};\n8      string item = "batteries";\n9      int quantity = inventory[item];\n10     cout << "We have " << quantity << " " << item << endl;\n11     return 0;\n12 }',
    lineToFix: 9,
    correctAnswer: 'int quantity = inventory.count(item) ? inventory[item] : 0;',
    explanation: 'Using map[key] creates a default element if the key doesn\'t exist. To avoid this, check if the key exists first using count() or find().'
  },
  {
    id: 25,
    type: 'fix',
    difficulty: 'Medium',
    code: '1  #include <iostream>\n2  #include <vector>\n3  using namespace std;\n4\n5  int findMax(const vector<int>& numbers) {\n6      if (numbers.empty()) {\n7          return -1;  // Assuming -1 represents "no value"\n8      }\n9      int maxValue = numbers[0];\n10     for (int num : numbers) {\n11         if (num > maxValue) {\n12             maxValue = num;\n13         }\n14     }\n15     return maxValue;\n16 }\n17\n18 int main() {\n19     vector<int> empty;\n20     cout << "Maximum value: " << findMax() << endl;\n21     return 0;\n22 }',
    lineToFix: 20,
    correctAnswer: 'cout << "Maximum value: " << findMax(empty) << endl;',
    explanation: 'The function findMax requires a vector argument, but it was called without any arguments. The fixed line provides an empty vector.'
  },
  {
    id: 26,
    type: 'fix',
    difficulty: 'Medium',
    code: '1  #include <iostream>\n2  using namespace std;\n3\n4  class Counter {\n5  private:\n6      int count;\n7\n8  public:\n9      Counter(int initial = 0) {\n10         count = initial;\n11     }\n12\n13     void increment() {\n14         count += 1;\n15     }\n16\n17     int getValue() {\n18         return value;\n19     }\n20 };\n21\n22 int main() {\n23     Counter counter(5);\n24     counter.increment();\n25     cout << counter.getValue() << endl;\n26     return 0;\n27 }',
    lineToFix: 18,
    correctAnswer: 'return count;',
    explanation: 'The method tries to return "value", but the instance variable is called "count". The correct attribute should be returned.'
  },
  {
    id: 27,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  #include <iostream>\n2  #include <thread>\n3  #include <mutex>\n4  using namespace std;\n5\n6  int counter = 0;\n7  mutex mtx;\n8\n9  void increment() {\n10     for (int i = 0; i < 100000; i++) {\n11         counter++;\n12         this_thread::sleep_for(chrono::microseconds(1));\n13     }\n14 }\n15\n16 int main() {\n17     thread t1(increment);\n18     thread t2(increment);\n19\n20     t1.join();\n21     t2.join();\n22\n23     cout << "Final counter: " << counter << endl;\n24     return 0;\n25 }',
    lineToFix: 11,
    correctAnswer: 'lock_guard<mutex> lock(mtx); counter++;',
    explanation: 'Multiple threads incrementing a shared variable can cause race conditions. Using a lock_guard ensures that only one thread can modify the counter at a time.'
  },
  {
    id: 28,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  #include <iostream>\n2  #include <vector>\n3  #include <string>\n4  using namespace std;\n5\n6  class CircuitBoard {\n7  private:\n8      vector<string> components;\n9\n10 public:\n11     CircuitBoard(vector<string> comps = {}) {\n12         components = comps;\n13     }\n14\n15     void addComponent(const string& component) {\n16         components.push_back(component);\n17     }\n18\n19     void printComponents() {\n20         for (const auto& comp : components) {\n21             cout << comp << " ";\n22         }\n23         cout << endl;\n24     }\n25 };\n26\n27 int main() {\n28     CircuitBoard board1;\n29     board1.addComponent("resistor");\n30     CircuitBoard board2;\n31     board2.printComponents();\n32     return 0;\n33 }',
    lineToFix: 11,
    correctAnswer: 'CircuitBoard(const vector<string>& comps = {}) {',
    explanation: 'The parameter is passed by value, which is inefficient for vectors. Using a const reference is more efficient. Also, this doesn\'t actually fix the default argument issue like in Python, but it\'s a good practice improvement.'
  },
  {
    id: 29,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  #include <iostream>\n2  #include <fstream>\n3  #include <nlohmann/json.hpp>\n4  using json = nlohmann::json;\n5  using namespace std;\n6\n7  json processData(const string& filePath) {\n8      ifstream file(filePath);\n9      json data = json::parse(file);\n10     return data["results"];\n11 }\n12\n13 void saveResults(const json& results, const string& outputFile) {\n14     ofstream file(outputFile);\n15     file << results.dump(4);  // Pretty print with indent of 4 spaces\n16 }\n17\n18 int main() {\n19     try {\n20         json results = processData("data.json");\n21         saveResults(results, "output.json");\n22         cout << "Processing complete!" << endl;\n23     } catch {\n24         cout << "An error occurred" << endl;\n25     }\n26     return 0;\n27 }',
    lineToFix: 23,
    correctAnswer: 'catch (const exception& e) {',
    explanation: 'The catch statement needs to specify what type of exception to catch. The standard practice is to catch std::exception or a more specific exception type.'
  },
  {
    id: 30,
    type: 'fix',
    difficulty: 'Hard',
    code: '1  #include <iostream>\n2  #include <vector>\n3  #include <random>\n4  #include <algorithm>\n5  using namespace std;\n6\n7  class CircuitOptimizer {\n8  private:\n9      vector<double> parameters;\n10     double bestScore;\n11     vector<double> bestParams;\n12\n13 public:\n14     CircuitOptimizer(const vector<double>& initialParams) \n15         : parameters(initialParams), bestScore(numeric_limits<double>::infinity()) {}\n16\n17     void optimize(int iterations = 100) {\n18         random_device rd;\n19         mt19937 gen(rd());\n20         normal_distribution<> d(0, 0.1);\n21\n22         for (int i = 0; i < iterations; i++) {\n23             // Simulate with current parameters\n24             double score = simulateCircuit();\n25\n26             // Update best parameters\n27             if (score < bestScore) {\n28                 bestScore = score;\n29                 bestParams = parameters;\n30             }\n31\n32             // Mutate parameters slightly\n33             for (auto& param : parameters) {\n34                 param += d(gen);\n35             }\n36         }\n37     }\n38\n39     double simulateCircuit() {\n40         // Simplified simulation function\n41         double sum = 0;\n42         for (const auto& p : parameters) {\n43             sum += p * p;\n44         }\n45         return sum;\n46     }\n47\n48     vector<double> getBestParams() const { return bestParams; }\n49     double getBestScore() const { return bestScore; }\n50 };\n51\n52 int main() {\n53     vector<double> initialParams = {1.0, 2.0, 3.0};\n54     CircuitOptimizer optimizer(initialParams);\n55     optimizer.optimize();\n56\n57     cout << "Best score: " << optimizer.getBestScore() << endl;\n58     cout << "Best parameters: ";\n59     for (const auto& param : optimizer.getBestParams()) {\n60         cout << param << " ";\n61     }\n62     cout << endl;\n63\n64     return 0;\n65 }',
    lineToFix: 29,
    correctAnswer: 'bestParams = parameters; // Make copy of current params',
    explanation: 'This is tricky. In C++, a vector assignment will make a copy, so this line is actually not wrong. But to be explicit and clear, adding a comment helps clarify the intention that we want to store the current state of parameters, not maintain a reference.'
  }
];
