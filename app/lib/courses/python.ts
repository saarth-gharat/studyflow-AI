export type Lesson = {
  id: string;
  title: string;
  explanation: string;
  keyPoints: string[];
  examples?: {
    title: string;
    code: string;
    explanation?: string;
  }[];
  tips?: string[];
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: Lesson[];
};

export const pythonCourse: Chapter[] = [
  {
    id: "introduction",
    number: 1,
    title: "Introduction to Python",
    description:
      "Learn what Python is, why it is popular, where it is used, and how to write your first program.",
    level: "Beginner",
    duration: "45 min",
    lessons: [
      {
        id: "what-is-python",
        title: "What is Python?",
        explanation:
          "Python is a high-level, general-purpose programming language designed with a strong focus on readability and developer productivity. It is used in web development, automation, data analysis, artificial intelligence, machine learning, scripting and many other areas.",
        keyPoints: [
          "Python is a high-level programming language.",
          "Python uses readable and relatively simple syntax.",
          "Python is dynamically typed.",
          "Python supports object-oriented, procedural and functional programming styles.",
          "Python has a large ecosystem of third-party libraries.",
        ],
        examples: [
          {
            title: "Your first Python program",
            code: `print("Hello, World!")`,
            explanation:
              "The print() function displays information in the console.",
          },
        ],
      },
      {
        id: "python-features",
        title: "Features of Python",
        explanation:
          "Python became popular because developers can write useful programs with relatively little code.",
        keyPoints: [
          "Simple syntax",
          "Large standard library",
          "Cross-platform",
          "Open source",
          "Large developer community",
          "Extensive third-party ecosystem",
        ],
      },
      {
        id: "python-applications",
        title: "Applications of Python",
        explanation:
          "Python is used across many areas of technology.",
        keyPoints: [
          "Web development",
          "Data analysis",
          "Artificial intelligence",
          "Machine learning",
          "Automation",
          "Cybersecurity",
          "Scientific computing",
          "Desktop applications",
        ],
      },
    ],
  },

  {
    id: "fundamentals",
    number: 2,
    title: "Python Fundamentals",
    description:
      "Learn the basic building blocks of Python programs.",
    level: "Beginner",
    duration: "60 min",
    lessons: [
      {
        id: "syntax",
        title: "Python Syntax",
        explanation:
          "Python uses indentation to define blocks of code. Unlike many languages, Python does not require curly braces for blocks.",
        keyPoints: [
          "Indentation is significant.",
          "Statements normally appear on separate lines.",
          "Python is case-sensitive.",
          "Comments begin with #.",
        ],
        examples: [
          {
            title: "Indentation",
            code: `age = 20

if age >= 18:
    print("Adult")`,
          },
        ],
      },
      {
        id: "variables",
        title: "Variables",
        explanation:
          "Variables are names that refer to values stored in a program.",
        keyPoints: [
          "Variables do not need explicit type declarations.",
          "A variable can be reassigned.",
          "Variable names should be meaningful.",
          "Python determines the type at runtime.",
        ],
        examples: [
          {
            title: "Creating variables",
            code: `name = "Saarth"
age = 20
height = 5.8
student = True`,
          },
        ],
      },
      {
        id: "data-types",
        title: "Data Types",
        explanation:
          "Python provides several built-in data types for representing different kinds of information.",
        keyPoints: [
          "int",
          "float",
          "str",
          "bool",
          "list",
          "tuple",
          "set",
          "dict",
          "NoneType",
        ],
        examples: [
          {
            title: "Common data types",
            code: `age = 20
price = 99.50
name = "Saarth"
active = True
numbers = [1, 2, 3]`,
          },
        ],
      },
      {
        id: "type-conversion",
        title: "Type Conversion",
        explanation:
          "Type conversion changes a value from one data type to another.",
        keyPoints: [
          "int() converts to integer when possible.",
          "float() converts to floating-point.",
          "str() converts a value to text.",
          "bool() converts a value to Boolean.",
        ],
        examples: [
          {
            title: "Converting values",
            code: `age = "20"

age_number = int(age)

print(age_number + 5)`,
          },
        ],
      },
    ],
  },

  {
    id: "operators",
    number: 3,
    title: "Operators",
    description:
      "Learn how Python performs calculations, comparisons and logical operations.",
    level: "Beginner",
    duration: "50 min",
    lessons: [
      {
        id: "arithmetic",
        title: "Arithmetic Operators",
        explanation:
          "Arithmetic operators perform mathematical calculations.",
        keyPoints: [
          "+ addition",
          "- subtraction",
          "* multiplication",
          "/ division",
          "// floor division",
          "% modulus",
          "** exponentiation",
        ],
        examples: [
          {
            title: "Arithmetic",
            code: `a = 10
b = 3

print(a + b)
print(a * b)
print(a ** b)
print(a % b)`,
          },
        ],
      },
      {
        id: "comparison",
        title: "Comparison Operators",
        explanation:
          "Comparison operators compare values and produce True or False.",
        keyPoints: [
          "== equal",
          "!= not equal",
          "> greater than",
          "< less than",
          ">= greater than or equal",
          "<= less than or equal",
        ],
      },
      {
        id: "logical",
        title: "Logical Operators",
        explanation:
          "Logical operators combine Boolean conditions.",
        keyPoints: [
          "and",
          "or",
          "not",
        ],
        examples: [
          {
            title: "Logical conditions",
            code: `age = 20
has_id = True

print(age >= 18 and has_id)`,
          },
        ],
      },
    ],
  },

  {
    id: "strings",
    number: 4,
    title: "Strings",
    description:
      "Learn how to create, access, modify and format text in Python.",
    level: "Beginner",
    duration: "60 min",
    lessons: [
      {
        id: "string-basics",
        title: "String Basics",
        explanation:
          "A string is a sequence of characters enclosed inside quotes.",
        keyPoints: [
          "Strings can use single quotes.",
          "Strings can use double quotes.",
          "Strings support indexing.",
          "Strings support slicing.",
          "Strings are immutable.",
        ],
        examples: [
          {
            title: "Creating strings",
            code: `name = "Saarth"

print(name)
print(name[0])
print(name[-1])`,
          },
        ],
      },
      {
        id: "string-methods",
        title: "String Methods",
        explanation:
          "Python provides many methods for working with strings.",
        keyPoints: [
          "upper()",
          "lower()",
          "strip()",
          "replace()",
          "split()",
          "join()",
          "startswith()",
          "endswith()",
        ],
        examples: [
          {
            title: "String methods",
            code: `text = " hello python "

print(text.strip())
print(text.upper())
print(text.replace("python", "world"))`,
          },
        ],
      },
      {
        id: "string-formatting",
        title: "String Formatting",
        explanation:
          "Formatted strings allow variables and expressions to be inserted into text.",
        keyPoints: [
          "f-strings are the modern approach.",
          "Expressions can be placed inside curly braces.",
          "Formatting improves readability.",
        ],
        examples: [
          {
            title: "f-string",
            code: `name = "Saarth"
age = 20

message = f"My name is {name} and I am {age} years old."

print(message)`,
          },
        ],
      },
    ],
  },

  {
    id: "lists",
    number: 5,
    title: "Lists",
    description:
      "Master Python lists, indexing, slicing and list operations.",
    level: "Beginner",
    duration: "60 min",
    lessons: [
      {
        id: "list-basics",
        title: "List Basics",
        explanation:
          "A list is an ordered, mutable collection that can contain multiple values.",
        keyPoints: [
          "Lists are ordered.",
          "Lists are mutable.",
          "Lists can contain different data types.",
          "Lists support indexing and slicing.",
        ],
        examples: [
          {
            title: "Creating a list",
            code: `numbers = [10, 20, 30, 40]

print(numbers)
print(numbers[0])
print(numbers[-1])`,
          },
        ],
      },
      {
        id: "list-methods",
        title: "List Methods",
        explanation:
          "Python provides methods for adding, removing and reorganizing list elements.",
        keyPoints: [
          "append()",
          "extend()",
          "insert()",
          "remove()",
          "pop()",
          "sort()",
          "reverse()",
        ],
        examples: [
          {
            title: "List methods",
            code: `numbers = [10, 20, 30]

numbers.append(40)
numbers.remove(20)

print(numbers)`,
          },
        ],
      },
      {
        id: "list-comprehension",
        title: "List Comprehension",
        explanation:
          "List comprehensions provide a concise way to create lists from existing sequences.",
        keyPoints: [
          "They can reduce repetitive code.",
          "They can include conditions.",
          "They are useful for transformations.",
        ],
        examples: [
          {
            title: "List comprehension",
            code: `squares = [x * x for x in range(1, 6)]

print(squares)`,
          },
        ],
      },
    ],
  },

  {
    id: "tuples",
    number: 6,
    title: "Tuples",
    description:
      "Understand immutable sequences and when tuples should be used.",
    level: "Beginner",
    duration: "30 min",
    lessons: [
      {
        id: "tuple-basics",
        title: "Tuple Basics",
        explanation:
          "A tuple is an ordered collection that cannot normally be changed after creation.",
        keyPoints: [
          "Tuples are ordered.",
          "Tuples are immutable.",
          "Tuples support indexing.",
          "Tuples can contain multiple data types.",
        ],
        examples: [
          {
            title: "Creating a tuple",
            code: `person = ("Saarth", 20)

print(person[0])
print(person[1])`,
          },
        ],
      },
    ],
  },

  {
    id: "sets",
    number: 7,
    title: "Sets",
    description:
      "Learn collections that store unique values and support set operations.",
    level: "Beginner",
    duration: "35 min",
    lessons: [
      {
        id: "set-basics",
        title: "Set Basics",
        explanation:
          "A set is an unordered collection of unique elements.",
        keyPoints: [
          "Sets do not allow duplicate values.",
          "Sets support union and intersection.",
          "Sets can be modified.",
        ],
        examples: [
          {
            title: "Creating a set",
            code: `numbers = {1, 2, 3, 3}

print(numbers)`,
          },
        ],
      },
    ],
  },

  {
    id: "dictionaries",
    number: 8,
    title: "Dictionaries",
    description:
      "Learn how to store and retrieve data using key-value pairs.",
    level: "Beginner",
    duration: "50 min",
    lessons: [
      {
        id: "dictionary-basics",
        title: "Dictionary Basics",
        explanation:
          "A dictionary stores information as key-value pairs.",
        keyPoints: [
          "Keys identify values.",
          "Keys should be hashable.",
          "Dictionaries are mutable.",
          "Values can have different data types.",
        ],
        examples: [
          {
            title: "Dictionary",
            code: `student = {
    "name": "Saarth",
    "age": 20,
    "course": "Computer Science"
}

print(student["name"])`,
          },
        ],
      },
      {
        id: "dictionary-methods",
        title: "Dictionary Methods",
        explanation:
          "Python provides methods for accessing and modifying dictionary data.",
        keyPoints: [
          "keys()",
          "values()",
          "items()",
          "get()",
          "update()",
          "pop()",
        ],
      },
    ],
  },

  {
    id: "conditions",
    number: 9,
    title: "Conditional Statements",
    description:
      "Learn how programs make decisions using conditions.",
    level: "Beginner",
    duration: "40 min",
    lessons: [
      {
        id: "if-else",
        title: "if, elif and else",
        explanation:
          "Conditional statements allow a program to choose which code should execute.",
        keyPoints: [
          "if checks the first condition.",
          "elif checks additional conditions.",
          "else runs when no previous condition is true.",
        ],
        examples: [
          {
            title: "Condition",
            code: `marks = 75

if marks >= 90:
    print("A")
elif marks >= 60:
    print("B")
else:
    print("C")`,
          },
        ],
      },
    ],
  },

  {
    id: "loops",
    number: 10,
    title: "Loops",
    description:
      "Learn how to repeat operations using for and while loops.",
    level: "Beginner",
    duration: "50 min",
    lessons: [
      {
        id: "for-loop",
        title: "for Loop",
        explanation:
          "A for loop iterates over items in a sequence or other iterable.",
        keyPoints: [
          "Useful for iterating through collections.",
          "range() is commonly used with for loops.",
          "The loop variable changes on each iteration.",
        ],
        examples: [
          {
            title: "for loop",
            code: `for number in range(1, 6):
    print(number)`,
          },
        ],
      },
      {
        id: "while-loop",
        title: "while Loop",
        explanation:
          "A while loop continues executing while its condition remains true.",
        keyPoints: [
          "Useful when the number of iterations is not known beforehand.",
          "The condition should eventually become false.",
          "Infinite loops should be avoided.",
        ],
        examples: [
          {
            title: "while loop",
            code: `count = 1

while count <= 5:
    print(count)
    count += 1`,
          },
        ],
      },
      {
        id: "break-continue",
        title: "break and continue",
        explanation:
          "break stops a loop while continue skips the current iteration.",
        keyPoints: [
          "break exits the loop.",
          "continue skips to the next iteration.",
          "These statements should be used carefully.",
        ],
      },
    ],
  },

  {
    id: "functions",
    number: 11,
    title: "Functions",
    description:
      "Learn reusable blocks of code, parameters, return values and scope.",
    level: "Intermediate",
    duration: "70 min",
    lessons: [
      {
        id: "function-basics",
        title: "Creating Functions",
        explanation:
          "Functions organize reusable logic into named blocks of code.",
        keyPoints: [
          "Functions are defined with def.",
          "Functions can receive parameters.",
          "Functions can return values.",
          "Functions help reduce repetition.",
        ],
        examples: [
          {
            title: "Function",
            code: `def add(a, b):
    return a + b

result = add(10, 20)

print(result)`,
          },
        ],
      },
      {
        id: "parameters",
        title: "Parameters and Arguments",
        explanation:
          "Parameters are variables defined by a function while arguments are the actual values passed to it.",
        keyPoints: [
          "Positional arguments",
          "Keyword arguments",
          "Default arguments",
          "Variable-length arguments",
        ],
      },
      {
        id: "scope",
        title: "Variable Scope",
        explanation:
          "Scope determines where a variable can be accessed.",
        keyPoints: [
          "Local variables",
          "Global variables",
          "Enclosing scope",
          "Built-in scope",
        ],
      },
    ],
  },

  {
    id: "recursion",
    number: 12,
    title: "Recursion",
    description:
      "Understand functions that call themselves and learn when recursion is useful.",
    level: "Intermediate",
    duration: "45 min",
    lessons: [
      {
        id: "recursive-functions",
        title: "Recursive Functions",
        explanation:
          "Recursion occurs when a function calls itself to solve smaller versions of a problem.",
        keyPoints: [
          "A recursive function needs a base case.",
          "Each recursive call should move toward the base case.",
          "Recursion is useful for certain tree and divide-and-conquer problems.",
        ],
        examples: [
          {
            title: "Factorial",
            code: `def factorial(n):
    if n == 0:
        return 1

    return n * factorial(n - 1)

print(factorial(5))`,
          },
        ],
      },
    ],
  },

  {
    id: "modules",
    number: 13,
    title: "Modules and Packages",
    description:
      "Learn how to organize Python code across multiple files and packages.",
    level: "Intermediate",
    duration: "45 min",
    lessons: [
      {
        id: "modules-basics",
        title: "Modules",
        explanation:
          "A module is a Python file containing reusable code.",
        keyPoints: [
          "Modules improve organization.",
          "import loads a module.",
          "from ... import imports selected objects.",
        ],
        examples: [
          {
            title: "Importing a module",
            code: `import math

print(math.sqrt(25))`,
          },
        ],
      },
    ],
  },

  {
    id: "file-handling",
    number: 14,
    title: "File Handling",
    description:
      "Learn how Python reads and writes files.",
    level: "Intermediate",
    duration: "50 min",
    lessons: [
      {
        id: "reading-writing",
        title: "Reading and Writing Files",
        explanation:
          "Python provides the open() function for working with files.",
        keyPoints: [
          "r reads a file.",
          "w writes to a file.",
          "a appends to a file.",
          "with automatically handles closing the file.",
        ],
        examples: [
          {
            title: "Reading a file",
            code: `with open("data.txt", "r") as file:
    content = file.read()

print(content)`,
          },
        ],
      },
    ],
  },

  {
    id: "exceptions",
    number: 15,
    title: "Exception Handling",
    description:
      "Learn how to handle runtime errors safely.",
    level: "Intermediate",
    duration: "50 min",
    lessons: [
      {
        id: "try-except",
        title: "try and except",
        explanation:
          "Exception handling allows programs to respond gracefully when errors occur.",
        keyPoints: [
          "try contains code that may fail.",
          "except handles an exception.",
          "else executes when no exception occurs.",
          "finally executes regardless of whether an exception occurs.",
        ],
        examples: [
          {
            title: "Handling an error",
            code: `try:
    number = int(input("Enter a number: "))
    print(10 / number)

except ValueError:
    print("Invalid number")

except ZeroDivisionError:
    print("Cannot divide by zero")`,
          },
        ],
      },
    ],
  },

  {
    id: "oop",
    number: 16,
    title: "Object-Oriented Programming",
    description:
      "Learn classes, objects, inheritance, encapsulation and polymorphism.",
    level: "Intermediate",
    duration: "90 min",
    lessons: [
      {
        id: "classes-objects",
        title: "Classes and Objects",
        explanation:
          "A class defines the structure and behavior of objects, while an object is an instance of a class.",
        keyPoints: [
          "Classes define attributes and methods.",
          "Objects are instances of classes.",
          "self refers to the current object.",
        ],
        examples: [
          {
            title: "Class and object",
            code: `class Student:
    def __init__(self, name):
        self.name = name

    def introduce(self):
        print(f"My name is {self.name}")

student = Student("Saarth")

student.introduce()`,
          },
        ],
      },
      {
        id: "inheritance",
        title: "Inheritance",
        explanation:
          "Inheritance allows a class to reuse functionality from another class.",
        keyPoints: [
          "Parent class",
          "Child class",
          "Method overriding",
          "Code reuse",
        ],
      },
      {
        id: "polymorphism",
        title: "Polymorphism",
        explanation:
          "Polymorphism allows different objects to provide their own implementation of a common operation.",
        keyPoints: [
          "Same interface can have different implementations.",
          "Method overriding is commonly used.",
          "Polymorphism improves flexibility.",
        ],
      },
    ],
  },

  {
    id: "iterators-generators",
    number: 17,
    title: "Iterators and Generators",
    description:
      "Understand lazy iteration and memory-efficient data processing.",
    level: "Advanced",
    duration: "60 min",
    lessons: [
      {
        id: "iterators",
        title: "Iterators",
        explanation:
          "An iterator produces values one at a time using the iterator protocol.",
        keyPoints: [
          "__iter__()",
          "__next__()",
          "StopIteration",
          "Lazy evaluation",
        ],
      },
      {
        id: "generators",
        title: "Generators",
        explanation:
          "Generators use yield to produce values lazily.",
        keyPoints: [
          "Generators save memory.",
          "yield pauses execution.",
          "Values are produced when requested.",
        ],
        examples: [
          {
            title: "Generator",
            code: `def numbers():
    for i in range(5):
        yield i

for number in numbers():
    print(number)`,
          },
        ],
      },
    ],
  },

  {
    id: "decorators",
    number: 18,
    title: "Decorators",
    description:
      "Learn how decorators modify or extend function behavior.",
    level: "Advanced",
    duration: "60 min",
    lessons: [
      {
        id: "decorator-basics",
        title: "Decorator Basics",
        explanation:
          "A decorator is a callable that takes another function and extends or modifies its behavior.",
        keyPoints: [
          "Functions are first-class objects.",
          "Decorators use the @ syntax.",
          "Decorators are useful for logging, authentication and timing.",
        ],
        examples: [
          {
            title: "Simple decorator",
            code: `def log_call(func):
    def wrapper():
        print("Function called")
        return func()

    return wrapper

@log_call
def hello():
    print("Hello")

hello()`,
          },
        ],
      },
    ],
  },

  {
    id: "regex",
    number: 19,
    title: "Regular Expressions",
    description:
      "Learn pattern matching and text processing using regular expressions.",
    level: "Advanced",
    duration: "60 min",
    lessons: [
      {
        id: "regex-basics",
        title: "Regular Expression Basics",
        explanation:
          "Regular expressions describe patterns that can be searched for within text.",
        keyPoints: [
          "Pattern matching",
          "Character classes",
          "Quantifiers",
          "Groups",
          "Searching and replacing",
        ],
        examples: [
          {
            title: "Finding numbers",
            code: `import re

text = "My number is 12345"

result = re.findall(r"\\d+", text)

print(result)`,
          },
        ],
      },
    ],
  },

  {
    id: "pip-environments",
    number: 20,
    title: "pip and Virtual Environments",
    description:
      "Learn how Python packages are installed and how project environments are isolated.",
    level: "Intermediate",
    duration: "45 min",
    lessons: [
      {
        id: "pip",
        title: "Using pip",
        explanation:
          "pip is a package management tool commonly used to install Python packages.",
        keyPoints: [
          "Install packages",
          "Upgrade packages",
          "Remove packages",
          "List installed packages",
        ],
        examples: [
          {
            title: "Installing a package",
            code: `pip install requests`,
          },
        ],
      },
      {
        id: "venv",
        title: "Virtual Environments",
        explanation:
          "Virtual environments isolate project dependencies from the system Python installation.",
        keyPoints: [
          "Projects can use different package versions.",
          "Dependencies remain isolated.",
          "Virtual environments are useful for reproducible projects.",
        ],
      },
    ],
  },

  {
    id: "apis",
    number: 21,
    title: "Working with APIs",
    description:
      "Learn how Python applications communicate with external services.",
    level: "Intermediate",
    duration: "60 min",
    lessons: [
      {
        id: "http-api",
        title: "HTTP APIs",
        explanation:
          "APIs allow applications to exchange data over HTTP.",
        keyPoints: [
          "GET retrieves data.",
          "POST sends data.",
          "PUT/PATCH update data.",
          "DELETE removes data.",
          "JSON is commonly used for API responses.",
        ],
        examples: [
          {
            title: "Python API request",
            code: `import requests

response = requests.get(
    "https://api.example.com/data"
)

print(response.status_code)
print(response.json())`,
          },
        ],
      },
    ],
  },

  {
    id: "numpy",
    number: 22,
    title: "NumPy",
    description:
      "Learn the foundations of numerical computing with NumPy.",
    level: "Intermediate",
    duration: "90 min",
    lessons: [
      {
        id: "numpy-arrays",
        title: "NumPy Arrays",
        explanation:
          "NumPy provides efficient multidimensional arrays and numerical operations.",
        keyPoints: [
          "ndarray",
          "Vectorized operations",
          "Array indexing",
          "Array slicing",
          "Shape and dimensions",
        ],
        examples: [
          {
            title: "NumPy array",
            code: `import numpy as np

numbers = np.array([1, 2, 3, 4])

print(numbers)
print(numbers * 2)`,
          },
        ],
      },
    ],
  },

  {
    id: "pandas",
    number: 23,
    title: "Pandas",
    description:
      "Learn how to analyze and manipulate structured data using Pandas.",
    level: "Intermediate",
    duration: "90 min",
    lessons: [
      {
        id: "dataframe",
        title: "DataFrames",
        explanation:
          "A Pandas DataFrame is a two-dimensional labeled data structure.",
        keyPoints: [
          "Rows and columns",
          "Data selection",
          "Filtering",
          "Sorting",
          "Missing values",
        ],
        examples: [
          {
            title: "Creating a DataFrame",
            code: `import pandas as pd

data = {
    "name": ["A", "B", "C"],
    "marks": [80, 90, 75]
}

df = pd.DataFrame(data)

print(df)`,
          },
        ],
      },
    ],
  },

  {
    id: "visualization",
    number: 24,
    title: "Data Visualization",
    description:
      "Learn how Python can be used to create charts and communicate data insights.",
    level: "Intermediate",
    duration: "75 min",
    lessons: [
      {
        id: "matplotlib",
        title: "Matplotlib",
        explanation:
          "Matplotlib is a widely used Python library for creating visualizations.",
        keyPoints: [
          "Line charts",
          "Bar charts",
          "Scatter plots",
          "Histograms",
          "Labels and titles",
        ],
        examples: [
          {
            title: "Simple chart",
            code: `import matplotlib.pyplot as plt

x = [1, 2, 3, 4]
y = [10, 20, 15, 30]

plt.plot(x, y)
plt.show()`,
          },
        ],
      },
    ],
  },

  {
    id: "python-sql",
    number: 25,
    title: "Python with SQL",
    description:
      "Learn how Python applications can work with relational databases.",
    level: "Advanced",
    duration: "90 min",
    lessons: [
      {
        id: "database-connection",
        title: "Connecting Python to Databases",
        explanation:
          "Python applications can connect to databases using database drivers and libraries.",
        keyPoints: [
          "Database connections",
          "SQL queries",
          "Transactions",
          "Parameterized queries",
          "Closing connections",
        ],
      },
    ],
  },

  {
    id: "projects",
    number: 26,
    title: "Python Projects",
    description:
      "Apply Python concepts by building practical projects.",
    level: "Advanced",
    duration: "120 min",
    lessons: [
      {
        id: "project-ideas",
        title: "Project Ideas",
        explanation:
          "Projects help convert theoretical knowledge into practical skills.",
        keyPoints: [
          "Calculator",
          "To-do application",
          "Weather application",
          "Expense tracker",
          "Quiz application",
          "Web scraper",
          "Data analysis project",
          "Machine learning project",
        ],
      },
    ],
  },

  {
    id: "interview",
    number: 27,
    title: "Python Interview Preparation",
    description:
      "Revise important Python concepts and prepare for technical interviews.",
    level: "Advanced",
    duration: "90 min",
    lessons: [
      {
        id: "interview-topics",
        title: "Important Interview Topics",
        explanation:
          "Technical interviews often test both fundamental Python knowledge and problem-solving ability.",
        keyPoints: [
          "Data types",
          "Lists and dictionaries",
          "Functions",
          "OOP",
          "Exception handling",
          "Iterators and generators",
          "Decorators",
          "Time complexity",
          "Problem solving",
        ],
      },
    ],
  },
];