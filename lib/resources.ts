export const resourceCategories = [
  "All",
  "Documentation",
  "Courses",
  "Interactive",
  "Practice",
  "Projects",
  "Cheat Sheets",
  "Communities",
  "Reference",
  "Tools",
] as const;

export const resourceDifficulties = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export const resourceTypes = [
  "All",
  "Documentation",
  "Tutorial",
  "Course",
  "Practice",
  "Project",
  "Reference",
  "Community",
  "Cheat Sheet",
  "Tool",
] as const;

export type ResourceCategory = (typeof resourceCategories)[number];
export type ResourceDifficulty = (typeof resourceDifficulties)[number];
export type ResourceType = (typeof resourceTypes)[number];

export type LearningResource = {
  id: string;
  subjects: string[];
  provider: string;
  title: string;
  description: string;
  url: string;
  category: Exclude<ResourceCategory, "All">;
  type: Exclude<ResourceType, "All">;
  difficulty?: Exclude<ResourceDifficulty, "All">;
  featured?: boolean;
  icon: string;
};

const resource = (
  id: string,
  subjects: string[],
  provider: string,
  title: string,
  description: string,
  url: string,
  category: LearningResource["category"],
  type: LearningResource["type"],
  icon: string,
  difficulty?: LearningResource["difficulty"],
  featured = false,
): LearningResource => ({
  id,
  subjects,
  provider,
  title,
  description,
  url,
  category,
  type,
  icon,
  difficulty,
  featured,
});

export const learningResources: LearningResource[] = [
  resource("python-docs", ["python"], "Python", "Python 3 Documentation", "The official language reference, tutorial, and library documentation for Python.", "https://docs.python.org/3/", "Documentation", "Documentation", "PY", "Beginner", true),
  resource("real-python", ["python"], "Real Python", "Python Tutorials", "Practical Python articles, projects, and explanations for every stage of learning.", "https://realpython.com/", "Courses", "Tutorial", "RP", "Beginner", true),
  resource("python-programiz", ["python"], "Programiz", "Learn Python", "Clear lessons and examples covering Python syntax, data structures, and functions.", "https://www.programiz.com/python-programming", "Courses", "Tutorial", "P", "Beginner"),
  resource("python-w3schools", ["python"], "W3Schools", "Python Tutorial", "A concise, searchable Python tutorial with examples you can run and adapt.", "https://www.w3schools.com/python/", "Courses", "Tutorial", "W3", "Beginner"),
  resource("python-freecodecamp", ["python"], "freeCodeCamp", "Scientific Computing with Python", "A project-based curriculum that builds Python fundamentals through practice.", "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "Interactive", "Course", "FC", "Intermediate", true),
  resource("python-exercism", ["python"], "Exercism", "Python Track", "Solve mentored Python exercises with progressively harder concepts.", "https://exercism.org/tracks/python", "Practice", "Practice", "EX", "Intermediate"),
  resource("python-hackerrank", ["python"], "HackerRank", "Python Skills", "Practice Python syntax and problem solving with short coding challenges.", "https://www.hackerrank.com/domains/python", "Practice", "Practice", "HR", "Intermediate"),
  resource("python-kaggle", ["python", "data analytics", "machine learning"], "Kaggle", "Python Course", "Learn Python for data work through short lessons and hands-on exercises.", "https://www.kaggle.com/learn/python", "Interactive", "Course", "K", "Beginner", true),
  resource("python-github", ["python"], "GitHub", "Python GitHub Topics", "Explore real Python repositories and project ideas from the open-source community.", "https://github.com/topics/python", "Projects", "Project", "GH", "Advanced"),

  resource("javascript-mdn", ["javascript", "web development"], "MDN Web Docs", "JavaScript Guide", "A dependable guide to the JavaScript language and browser APIs.", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "Documentation", "Documentation", "MDN", "Beginner", true),
  resource("javascript-info", ["javascript"], "JavaScript.info", "The Modern JavaScript Tutorial", "A detailed, progressive tutorial from language basics to advanced browser concepts.", "https://javascript.info/", "Courses", "Tutorial", "JS", "Beginner", true),
  resource("javascript-freecodecamp", ["javascript"], "freeCodeCamp", "JavaScript Algorithms and Data Structures", "Build JavaScript fluency through interactive lessons and projects.", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "Interactive", "Course", "FC", "Intermediate"),
  resource("javascript-frontend-mentor", ["javascript", "web development"], "Frontend Mentor", "Frontend Challenges", "Build realistic frontend projects from design briefs and improve your implementation skills.", "https://www.frontendmentor.io/challenges", "Projects", "Project", "FM", "Intermediate", true),
  resource("javascript-exercism", ["javascript"], "Exercism", "JavaScript Track", "Practice JavaScript with focused exercises and optional mentor feedback.", "https://exercism.org/tracks/javascript", "Practice", "Practice", "EX", "Intermediate"),
  resource("javascript-hackerrank", ["javascript"], "HackerRank", "JavaScript Practice", "Sharpen JavaScript fundamentals with timed and untimed challenges.", "https://www.hackerrank.com/domains/javascript", "Practice", "Practice", "HR", "Intermediate"),
  resource("javascript-github", ["javascript", "web development"], "GitHub", "JavaScript GitHub Topics", "Find open-source JavaScript projects to read, fork, and learn from.", "https://github.com/topics/javascript", "Communities", "Community", "GH", "Advanced"),

  resource("html-mdn", ["html", "css", "web development"], "MDN Web Docs", "Learn Web Development", "Structured lessons for HTML, CSS, accessibility, and the web platform.", "https://developer.mozilla.org/en-US/docs/Learn", "Documentation", "Documentation", "MDN", "Beginner", true),
  resource("html-freecodecamp", ["html", "css", "web development"], "freeCodeCamp", "Responsive Web Design", "Learn HTML and CSS by building responsive pages and portfolio projects.", "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "Projects", "Course", "FC", "Beginner", true),
  resource("css-tricks", ["css", "web development"], "CSS-Tricks", "CSS Almanac", "A practical reference for CSS properties, patterns, and layout techniques.", "https://css-tricks.com/almanac/", "Reference", "Reference", "CT", "Intermediate"),
  resource("webdev", ["html", "css", "web development"], "web.dev", "Learn Web Development", "Google-authored guidance on performance, accessibility, and modern web development.", "https://web.dev/learn/", "Courses", "Course", "WD", "Intermediate"),

  resource("sql-postgresql", ["sql", "database management"], "PostgreSQL", "SQL Tutorial", "The official PostgreSQL tutorial for relational concepts and SQL queries.", "https://www.postgresql.org/docs/current/tutorial.html", "Documentation", "Documentation", "PG", "Beginner", true),
  resource("sql-mysql", ["sql", "database management"], "MySQL", "MySQL Reference Manual", "Official documentation for MySQL SQL syntax, administration, and features.", "https://dev.mysql.com/doc/", "Documentation", "Reference", "MY", "Intermediate"),
  resource("sqlbolt", ["sql", "database management"], "SQLBolt", "Interactive SQL Lessons", "Learn SQL with short interactive lessons and exercises in the browser.", "https://sqlbolt.com/", "Interactive", "Practice", "SB", "Beginner", true),
  resource("sql-mode", ["sql", "data analytics"], "Mode", "SQL Tutorial", "Learn SQL through data-analysis examples and realistic query problems.", "https://mode.com/sql-tutorial/", "Courses", "Tutorial", "MO", "Intermediate"),
  resource("sql-hackerrank", ["sql"], "HackerRank", "SQL Practice", "Practice SQL queries across basic, intermediate, and advanced challenge sets.", "https://www.hackerrank.com/domains/sql", "Practice", "Practice", "HR", "Intermediate"),
  resource("sql-leetcode", ["sql"], "LeetCode", "Database Problems", "Solve SQL interview problems covering joins, aggregation, and data modeling.", "https://leetcode.com/problemset/database/", "Practice", "Practice", "LC", "Advanced"),
  resource("sql-w3schools", ["sql"], "W3Schools", "SQL Tutorial", "A searchable introduction to SQL statements, joins, and database operations.", "https://www.w3schools.com/sql/", "Courses", "Tutorial", "W3", "Beginner"),

  resource("analytics-kaggle", ["data analytics", "machine learning"], "Kaggle", "Kaggle Learn", "Short practical courses for Python, pandas, data visualization, and machine learning.", "https://www.kaggle.com/learn", "Interactive", "Course", "K", "Beginner", true),
  resource("analytics-microsoft", ["data analytics", "database management"], "Microsoft Learn", "Power BI Learning Paths", "Structured modules for learning data modeling, visualization, and Power BI workflows.", "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/", "Courses", "Course", "MS", "Intermediate"),
  resource("analytics-freecodecamp", ["data analytics"], "freeCodeCamp", "Data Analysis with Python", "Build data analysis skills with Python, pandas, NumPy, and real datasets.", "https://www.freecodecamp.org/learn/data-analysis-with-python/", "Projects", "Course", "FC", "Intermediate"),
  resource("analytics-w3schools", ["data analytics"], "W3Schools", "Data Analytics Tutorial", "A gentle introduction to data analysis concepts and common tools.", "https://www.w3schools.com/datascience/", "Courses", "Tutorial", "W3", "Beginner"),

  resource("ml-google", ["machine learning", "ai"], "Google for Developers", "Machine Learning Crash Course", "Visual explanations, exercises, and practical foundations for machine learning.", "https://developers.google.com/machine-learning/crash-course", "Interactive", "Course", "G", "Beginner", true),
  resource("ml-kaggle", ["machine learning", "ai"], "Kaggle", "Intro to Machine Learning", "Practice model building and evaluation through concise interactive lessons.", "https://www.kaggle.com/learn/intro-to-machine-learning", "Interactive", "Course", "K", "Beginner"),
  resource("ml-fastai", ["machine learning", "ai"], "fast.ai", "Practical Deep Learning", "A hands-on deep learning course for people who want to build useful models.", "https://course.fast.ai/", "Courses", "Course", "FA", "Advanced", true),
  resource("ml-huggingface", ["machine learning", "ai"], "Hugging Face", "Hugging Face Learn", "Learn modern machine learning and natural language processing with open tools.", "https://huggingface.co/learn", "Courses", "Course", "HF", "Advanced"),
  resource("ml-pytorch", ["machine learning", "ai"], "PyTorch", "PyTorch Tutorials", "Official tutorials for building and training deep learning models.", "https://pytorch.org/tutorials/", "Documentation", "Tutorial", "PT", "Advanced"),
  resource("ml-sklearn", ["machine learning", "ai", "python"], "scikit-learn", "User Guide", "Reference documentation and examples for classical machine learning in Python.", "https://scikit-learn.org/stable/user_guide.html", "Documentation", "Reference", "SK", "Intermediate"),

  resource("security-portswigger", ["cybersecurity"], "PortSwigger", "Web Security Academy", "Free interactive labs for learning web vulnerabilities and defensive techniques.", "https://portswigger.net/web-security", "Interactive", "Practice", "PS", "Intermediate", true),
  resource("security-owasp", ["cybersecurity", "web development"], "OWASP", "OWASP Top 10", "A foundational reference for the most important web application security risks.", "https://owasp.org/www-project-top-ten/", "Documentation", "Reference", "OW", "Intermediate", true),
  resource("security-tryhackme", ["cybersecurity"], "TryHackMe", "Cyber Security Training", "Guided rooms and learning paths for hands-on security practice.", "https://tryhackme.com/paths", "Interactive", "Course", "TH", "Beginner"),
  resource("security-overthewire", ["cybersecurity", "linux"], "OverTheWire", "Wargames", "Security-focused challenges that teach Linux and exploitation fundamentals.", "https://overthewire.org/wargames/", "Practice", "Practice", "OT", "Intermediate"),
  resource("security-cisco", ["cybersecurity", "networking"], "Cisco Networking Academy", "Cybersecurity Essentials", "Foundational security learning from Cisco's education platform.", "https://www.netacad.com/courses/cybersecurity", "Courses", "Course", "CN", "Beginner"),

  resource("networking-cisco", ["networking"], "Cisco Networking Academy", "Networking Basics", "Build a foundation in networks, protocols, devices, and troubleshooting.", "https://www.netacad.com/courses/networking", "Courses", "Course", "CN", "Beginner", true),
  resource("networking-cloudflare", ["networking", "cybersecurity"], "Cloudflare", "Learning Center", "Plain-language explanations of DNS, HTTP, TLS, and modern internet infrastructure.", "https://www.cloudflare.com/learning/", "Documentation", "Reference", "CF", "Beginner"),
  resource("networking-rfc", ["networking"], "RFC Editor", "RFC Index", "The primary archive for internet standards and protocol specifications.", "https://www.rfc-editor.org/", "Reference", "Reference", "RFC", "Advanced"),

  resource("git-docs", ["git", "github"], "Git", "Git Documentation", "Official documentation for Git commands, concepts, and workflows.", "https://git-scm.com/doc", "Documentation", "Documentation", "GIT", "Beginner", true),
  resource("github-docs", ["git", "github"], "GitHub", "GitHub Docs", "Learn repositories, pull requests, Actions, and collaboration on GitHub.", "https://docs.github.com/en", "Documentation", "Documentation", "GH", "Beginner"),
  resource("github-skills", ["git", "github"], "GitHub", "GitHub Skills", "Interactive courses that teach GitHub workflows inside real repositories.", "https://skills.github.com/", "Interactive", "Course", "GH", "Beginner", true),
  resource("git-atlassian", ["git", "github"], "Atlassian", "Git Tutorials", "Visual guides to Git concepts, branching, merging, and team workflows.", "https://www.atlassian.com/git/tutorials", "Courses", "Tutorial", "AT", "Beginner"),

  resource("linux-docs", ["linux"], "Linux", "Linux Documentation", "The Linux kernel and community documentation archive.", "https://docs.kernel.org/", "Documentation", "Reference", "LX", "Advanced"),
  resource("linux-ubuntu", ["linux"], "Ubuntu", "Ubuntu Documentation", "Official guides for installing, using, and administering Ubuntu systems.", "https://documentation.ubuntu.com/", "Documentation", "Documentation", "UB", "Beginner", true),
  resource("linux-redhat", ["linux"], "Red Hat", "Red Hat Documentation", "Enterprise Linux guides covering administration, containers, and security.", "https://docs.redhat.com/", "Documentation", "Reference", "RH", "Advanced"),
  resource("linux-journey", ["linux"], "Linux Journey", "Linux Journey", "A friendly path through the command line, processes, and system fundamentals.", "https://linuxjourney.com/", "Courses", "Tutorial", "LJ", "Beginner"),

  resource("java-dev", ["java"], "dev.java", "Learn Java", "Official Java learning material from language basics through modern development.", "https://dev.java/learn/", "Documentation", "Course", "JV", "Beginner", true),
  resource("java-oracle", ["java"], "Oracle", "Java Documentation", "Reference material and guides for the Java platform and APIs.", "https://docs.oracle.com/en/java/", "Documentation", "Reference", "OR", "Advanced"),
  resource("java-codingbat", ["java"], "CodingBat", "Java Practice", "Short Java coding problems for building fluency through repetition.", "https://codingbat.com/java", "Practice", "Practice", "CB", "Beginner"),
  resource("java-hackerrank", ["java"], "HackerRank", "Java Practice", "Practice object-oriented programming and Java problem solving.", "https://www.hackerrank.com/domains/java", "Practice", "Practice", "HR", "Intermediate"),

  resource("cpp-reference", ["c++", "c"], "cppreference", "C++ Reference", "A comprehensive reference for the C++ language and standard library.", "https://en.cppreference.com/w/", "Reference", "Reference", "C++", "Advanced", true),
  resource("cpp-learn", ["c++"], "LearnCpp.com", "Learn C++", "A free, structured tutorial for learning modern C++ from the ground up.", "https://www.learncpp.com/", "Courses", "Tutorial", "C++", "Beginner", true),
  resource("cpp-hackerrank", ["c++", "c"], "HackerRank", "C++ Practice", "Build problem-solving skills with C and C++ coding challenges.", "https://www.hackerrank.com/domains/cpp", "Practice", "Practice", "HR", "Intermediate"),

  resource("generic-github", ["general"], "GitHub", "Explore Open Source", "Browse real projects and documentation when you are learning a new subject.", "https://github.com/explore", "Communities", "Community", "GH", "Intermediate"),
  resource("generic-edx", ["general"], "edX", "Online Courses", "Explore university-backed courses across technology, science, and business.", "https://www.edx.org/learn", "Courses", "Course", "edX", "Beginner", true),
  resource("generic-coursera", ["general"], "Coursera", "Browse Courses", "Find structured courses and specializations from universities and companies.", "https://www.coursera.org/browse", "Courses", "Course", "CO", "Beginner"),
];

export function normalizeResourceSubject(subject: string) {
  return subject.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resourcesForSubject(subject: string) {
  const normalized = normalizeResourceSubject(subject);
  const subjectResources = learningResources.filter((item) => item.subjects.includes(normalized));
  return subjectResources.length > 0
    ? subjectResources
    : learningResources.filter((item) => item.subjects.includes("general"));
}
