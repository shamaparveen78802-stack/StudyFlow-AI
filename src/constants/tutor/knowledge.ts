import { ChatMessage } from '../../types';

export interface KnowledgeEntry {
  keywords: string[];
  patterns?: RegExp[];
  topicTitle: string;
  category: 'math' | 'science' | 'writing' | 'study_skill' | 'general';
  response: string;
  suggestedQuestions: string[];
}

// ----------------------------------------------------
// HELPER: Simple Arithmetic & Math Parser
// ----------------------------------------------------
function tryEvaluateArithmetic(input: string): { isMath: boolean; result?: number | string; formatted?: string; opName?: string } | null {
  const clean = input
    .toLowerCase()
    .replace(/^(what is|calculate|solve|evaluate|compute|what's|find)\s+/i, '')
    .replace(/[?=]$/g, '')
    .trim();

  // Pattern: "2 + 2", "5 * 12", "100 / 4", "15 - 8", "2^5", "9 % 2"
  const basicMathRegex = /^([+-]?\d+(?:\.\d+)?)\s*([\+\-\*\/x×÷\^%])\s*([+-]?\d+(?:\.\d+)?)$/i;
  const match = clean.match(basicMathRegex);

  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);

    let res: number;
    let opName = 'calculation';

    if (op === '+') {
      res = num1 + num2;
      opName = 'addition';
    } else if (op === '-') {
      res = num1 - num2;
      opName = 'subtraction';
    } else if (op === '*' || op === 'x' || op === '×') {
      res = num1 * num2;
      opName = 'multiplication';
    } else if (op === '/' || op === '÷') {
      if (num2 === 0) return { isMath: true, result: 'Undefined (division by zero is not allowed)', opName: 'division' };
      res = num1 / num2;
      opName = 'division';
    } else if (op === '^') {
      res = Math.pow(num1, num2);
      opName = 'exponentiation';
    } else if (op === '%') {
      res = num1 % num2;
      opName = 'modulo';
    } else {
      return null;
    }

    const formattedRes = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(4)).toString();
    return {
      isMath: true,
      result: formattedRes,
      formatted: `${num1} ${op} ${num2} = ${formattedRes}`,
      opName,
    };
  }

  // Square root pattern: "sqrt(16)" or "square root of 25"
  const sqrtMatch = clean.match(/^(?:sqrt|square root of)\s*\(?(\d+(?:\.\d+)?)\)?$/i);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    const res = Math.sqrt(val);
    const formattedRes = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(4)).toString();
    return {
      isMath: true,
      result: formattedRes,
      formatted: `√${val} = ${formattedRes}`,
      opName: 'square root',
    };
  }

  return null;
}

// ----------------------------------------------------
// SMART KNOWLEDGE BASE (Short, friendly, senior-tutor tone)
// Format: Answer in 2-3 lines -> Small example -> "Want more detail?"
// ----------------------------------------------------
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // Greetings & Casual
  {
    keywords: ['hi', 'hello', 'hey', 'sup', 'yo', 'greetings', 'good morning', 'good evening', 'good afternoon'],
    patterns: [/^(hi|hello|hey|yo|sup|howdy|good morning|good evening|good afternoon)[\s!.]*$/i],
    topicTitle: 'Friendly Greeting',
    category: 'general',
    response: `Hey! 👋 Great to see you. I'm your study buddy and senior tutor.

What are we tackling today? Whether it's a tricky math equation, debugging code, breaking down an essay topic, or getting your study routine in shape, I'm here to help!

**Quick pick:** Drop a question or try one of the topic chips below!`,
    suggestedQuestions: [
      'Explain the Feynman Technique',
      'How do I solve calculus derivatives with Chain Rule?',
      'How to write a strong thesis statement?',
      'How to cram for an exam in 3 days?',
    ],
  },
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate it', 'awesome', 'great', 'got it'],
    patterns: [/^(thanks|thank you|thx|tysm|awesome|great|got it|perfect)[\s!.]*$/i],
    topicTitle: 'Acknowledgment',
    category: 'general',
    response: `Anytime! You're doing great. Keep up the momentum! 🚀

Got another problem or concept you want to quickly clear up?`,
    suggestedQuestions: [
      'Give me a quick active recall quiz',
      'What is the Pomodoro technique?',
      'How does binary search work?',
    ],
  },
  {
    keywords: ['who are you', 'what can you do', 'help', 'features'],
    topicTitle: 'AI Tutor Introduction',
    category: 'general',
    response: `I'm your AI Study Tutor! Think of me as a friendly senior who explains things simply without textbook fluff.

I can help you solve math problems step-by-step, explain code with snippets, break down complex theories with real-world examples, and share high-yield study hacks.

**Try asking me:** "Explain Newton's 2nd law", "How does Binary Search work?", or "Chain Rule in calculus". Want to try one?`,
    suggestedQuestions: [
      'Explain the Feynman Technique',
      'How do I solve calculus derivatives with Chain Rule?',
      'Explain Newton’s Laws and Free Body Diagrams',
    ],
  },

  // ---------------- STUDY METHODS ----------------
  {
    keywords: ['feynman', 'feynman technique', 'teach to learn', 'explain simply'],
    topicTitle: 'The Feynman Technique',
    category: 'study_skill',
    response: `The Feynman Technique means mastering any hard topic by explaining it in plain, simple words as if teaching a 12-year-old.

**Here are the 4 steps:**
1. Pick a concept and write down an explanation using zero jargon.
2. Spot where you got stuck or used complex words to hide confusion.
3. Re-read your notes to fix that exact gap.
4. Simplify and create a real-life analogy.

**Quick Example:** Instead of saying *"mitosis is somatic eukaryotic cell division"*, say *"it's a cell making an exact clone copy of itself"*.

Want me to help you practice the Feynman technique on one of your subjects?`,
    suggestedQuestions: [
      'What is Active Recall and how do I do it?',
      'How does Spaced Repetition work?',
      'How to prepare for an exam in 3 days?',
    ],
  },
  {
    keywords: ['active recall', 'testing effect', 'flashcards', 'quiz myself', 'blurting'],
    topicTitle: 'Active Recall',
    category: 'study_skill',
    response: `Active Recall is testing your brain to pull information out from memory instead of passively re-reading or highlighting.

**How to do it simply:**
- **The Blurting Method:** Read a page for 5 minutes, close the book, and write down everything you remember on a blank sheet.
- **Question-First Notes:** Turn textbook subheadings into questions, then answer them without looking.

**Quick Example:** Don't re-read "Newton's 2nd Law = F=ma". Look at a blank paper and ask: *"What equation links force, mass, and acceleration and why?"*

Want more detail or a custom flashcard strategy?`,
    suggestedQuestions: [
      'How do I schedule spaced repetition reviews?',
      'Explain the Feynman Technique',
      'How to prepare for an exam in 3 days?',
    ],
  },
  {
    keywords: ['spaced repetition', 'forgetting curve', 'ebbinghaus', 'anki', 'leitner'],
    topicTitle: 'Spaced Repetition',
    category: 'study_skill',
    response: `Spaced Repetition schedules your review sessions right when your brain is about to forget the material, locking it into long-term memory.

**Simple Rule of Thumb:**
- Review 1: 24 hours later
- Review 2: 3 days later
- Review 3: 1 week later
- Review 4: 2 weeks later

**Quick Example:** If you learn 10 calculus formulas on Monday, review them quickly Tuesday night, Friday afternoon, and next Monday.

Want me to show you how to set up the 5-box Leitner system?`,
    suggestedQuestions: [
      'What is Active Recall and how do I do it?',
      'Explain the Feynman Technique',
      'How to stop procrastinating on homework?',
    ],
  },
  {
    keywords: ['procrastination', 'procrastinating', 'cant focus', 'distracted', 'lazy', 'motivation'],
    topicTitle: 'Beating Procrastination',
    category: 'study_skill',
    response: `Procrastination happens when a task feels too big, so your brain seeks quick dopamine. The secret is lowering the barrier to start.

**Try the 5-Minute Rule:**
Tell yourself: *"I will only work on this for 5 minutes. If I still hate it, I can stop."* In 90% of cases, breaking the initial friction keeps you going.

**Quick Example:** Don't sit down to "write a 10-page paper". Sit down to "write 2 messy sentences".

Want to start a 25-minute Pomodoro focus block right now?`,
    suggestedQuestions: [
      'What is the Pomodoro Technique?',
      'How to prepare for an exam in 3 days?',
      'Explain Active Recall',
    ],
  },
  {
    keywords: ['exam', 'cramming', 'finals', 'midterm', '3 days', 'test in a few days', 'exam prep'],
    topicTitle: 'Emergency Exam Prep',
    category: 'study_skill',
    response: `When you have only 2–3 days before an exam, stop reading textbooks cover-to-cover and switch to high-yield triage:

**3-Day Action Plan:**
1. **Day 1 (80/20 Rule):** Identify the 5 most recurring problem types from past exams and write a 1-page formula sheet from memory.
2. **Day 2 (Timed Practice):** Solve past exam questions under strict timed conditions. Make an error log for every mistake.
3. **Day 3 (Recharge & Review):** Review your formula sheet, sleep at least 7 hours (sleep cements memory), and do light active recall.

**Quick Tip:** Never pull an all-nighter before an exam—it lowers test accuracy by over 30%!

Want a study schedule tailored to your specific exam subject?`,
    suggestedQuestions: [
      'What is Active Recall and how do I do it?',
      'Explain the Feynman Technique',
      'How to write a strong thesis statement?',
    ],
  },

  // ---------------- MATH & CALCULUS ----------------
  {
    keywords: ['chain rule', 'chain rule derivative', 'composite derivative'],
    topicTitle: 'Calculus: Chain Rule',
    category: 'math',
    response: `The Chain Rule is for differentiating composite functions (a function inside another function). The rule: **Derivative of the outside × Derivative of the inside**.

Formula: [f(g(x))]' = f'(g(x)) · g'(x)

**Quick Example:** Differentiate y = sin(x²):
1. Outside function: sin(u) → cos(u) = cos(x²)
2. Inside function: x² → 2x
3. Multiply them: **2x · cos(x²)**

Want me to walk through another problem with you?`,
    suggestedQuestions: [
      'Explain the Product Rule and Quotient Rule',
      'How do I solve Integration by Parts?',
      'What are Eigenvalues and Eigenvectors?',
    ],
  },
  {
    keywords: ['derivative', 'derivatives', 'product rule', 'quotient rule', 'power rule', 'differentiation'],
    topicTitle: 'Calculus: Core Differentiation Rules',
    category: 'math',
    response: `A derivative is just the instantaneous rate of change (the slope of the tangent line at any point).

**Key Rules:**
- **Power Rule:** d/dx[xⁿ] = n · xⁿ⁻¹ *(e.g. x³ → 3x²)*
- **Product Rule:** (uv)' = u'v + uv'
- **Quotient Rule:** (u/v)' = (u'v - uv') / v²
- **Chain Rule:** [f(g(x))]' = f'(g(x)) · g'(x)

**Quick Example:** For f(x) = 4x³ + 5x:
f'(x) = 4(3x²) + 5 = 12x² + 5

Want more detail or want to solve a specific derivative together?`,
    suggestedQuestions: [
      'Explain the Chain Rule with an example',
      'How does Integration by Substitution work?',
      'What is the derivative of e^x and ln(x)?',
    ],
  },
  {
    keywords: ['integral', 'integration', 'antiderivative', 'u substitution', 'by parts'],
    topicTitle: 'Calculus: Integration Techniques',
    category: 'math',
    response: `Integration is finding the accumulated area under a curve (the reverse of differentiation).

**When to use what:**
1. **Power Rule:** ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C
2. **U-Substitution:** Use when you see a function and its derivative inside (e.g. ∫ 2x · e^(x²) dx).
3. **Integration by Parts:** Formula ∫ u dv = uv - ∫ v du (Use LIATE to choose u: Log, Inverse trig, Algebraic, Trig, Exponential).

**Quick Example:**
∫ (3x² + 2x) dx = x³ + x² + C

Want me to solve a specific integral step-by-step?`,
    suggestedQuestions: [
      'Show an example of Integration by Parts',
      'Explain U-Substitution with an example',
      'What is the Fundamental Theorem of Calculus?',
    ],
  },
  {
    keywords: ['quadratic', 'quadratic formula', 'parabola', 'factoring'],
    topicTitle: 'Algebra: Quadratic Formula',
    category: 'math',
    response: `To find the roots of any quadratic equation ax² + bx + c = 0, use the Quadratic Formula:

x = (-b ± √(b² - 4ac)) / (2a)

**Quick Example:** Solve x² - 5x + 6 = 0 (a=1, b=-5, c=6):
1. Discriminant: (-5)² - 4(1)(6) = 25 - 24 = 1
2. x = (5 ± √1) / 2 = (5 ± 1) / 2
3. Roots are **x = 3** and **x = 2**.

Want more detail or another example?`,
    suggestedQuestions: [
      'How to factor polynomials quickly?',
      'Explain completing the square',
      'What is the vertex form of a parabola?',
    ],
  },
  {
    keywords: ['eigenvalue', 'eigenvector', 'linear algebra', 'determinant', 'matrix'],
    topicTitle: 'Linear Algebra: Eigenvalues & Eigenvectors',
    category: 'math',
    response: `An eigenvector is a vector whose direction does not change when multiplied by a matrix A—it only gets scaled by a factor called the eigenvalue λ:

A · v = λ · v  ⇔  (A - λI)v = 0

**How to find them in 2 steps:**
1. Solve det(A - λI) = 0 to get the eigenvalues λ.
2. Plug each λ back into (A - λI)v = 0 to find the eigenvector v.

**Quick Analogy:** Think of stretching a rubber sheet—the vectors along the stretch axes don't rotate, they just lengthen or shrink.

Want a worked 2×2 matrix example?`,
    suggestedQuestions: [
      'How to calculate matrix determinants?',
      'What is Dot Product vs Cross Product?',
      'Explain Gaussian Elimination',
    ],
  },

  // ---------------- COMPUTER SCIENCE & CODING ----------------
  {
    keywords: ['binary search', 'binary search python', 'search algorithm'],
    topicTitle: 'Coding: Binary Search',
    category: 'science',
    response: `Binary Search finds an element in a **sorted array** in O(log n) time by repeatedly cutting the search space in half.

Python Implementation:
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid  # Found index
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # Not found
\`\`\`

**Quick Example:** Searching for 7 in [1, 3, 5, 7, 9, 11] takes only 2 comparisons instead of scanning all 6 items!

Want to see recursive vs iterative binary search or edge cases?`,
    suggestedQuestions: [
      'Explain Big-O time complexity simply',
      'How does Merge Sort work?',
      'Explain Two Pointer technique in Python',
    ],
  },
  {
    keywords: ['big o', 'time complexity', 'space complexity', 'o(n)', 'o(1)', 'o(log n)'],
    topicTitle: 'Computer Science: Big-O Complexity',
    category: 'science',
    response: `Big-O measures how your code's runtime or memory grows as the input size N gets larger.

**Quick Hierarchy (Fastest to Slowest):**
- **O(1) (Constant):** Instant lookup (e.g. dict/hash map lookup dict[key]).
- **O(log N) (Logarithmic):** Halving each step (e.g. Binary Search).
- **O(N) (Linear):** Single loop scanning through an array.
- **O(N log N):** Efficient sorting (e.g. MergeSort, QuickSort).
- **O(N²) (Quadratic):** Nested loops over the same data.

**Quick Example:** A loop inside a loop over a list of size 100 runs 100 × 100 = 10,000 operations (O(N²)).

Want me to analyze the Big-O of your code? Paste it here!`,
    suggestedQuestions: [
      'How does Binary Search work in Python?',
      'Explain Dynamic Programming simply',
      'What is the difference between Stack and Queue?',
    ],
  },
  {
    keywords: ['recursion', 'recursive', 'base case'],
    topicTitle: 'Coding: Recursion',
    category: 'science',
    response: `Recursion is when a function calls itself to break a problem into smaller subproblems until it hits a stopping condition called the **base case**.

Python Implementation:
\`\`\`python
def factorial(n):
    # Base case: stop when n reaches 1
    if n <= 1:
        return 1
    # Recursive step
    return n * factorial(n - 1)

print(factorial(4))  # 4 * 3 * 2 * 1 = 24
\`\`\`

**Rule to remember:** Every recursive function MUST have a base case, otherwise you get a RecursionError (Stack Overflow)!

Want me to show you how to convert recursion to loops or memoization?`,
    suggestedQuestions: [
      'What is Dynamic Programming and Memoization?',
      'Explain Binary Search in Python',
      'What is Big-O complexity?',
    ],
  },

  // ---------------- SCIENCE & PHYSICS ----------------
  {
    keywords: ['newton', 'newton laws', 'free body diagram', 'f=ma', 'mechanics', 'physics'],
    topicTitle: 'Physics: Newton’s Laws',
    category: 'science',
    response: `Newton's 3 Laws describe how forces create motion in the universe:

1. **Inertia:** An object stays at rest or constant velocity unless an external force acts on it.
2. **F = ma:** Net Force equals Mass × Acceleration (ΣF = ma).
3. **Action-Reaction:** For every force, there is an equal and opposite reaction force.

**Quick Example:** If you push a 10 kg box with 50 N of force (ignoring friction):
a = F / m = 50 / 10 = 5 m/s²

Want me to help you draw a Free Body Diagram for an inclined plane problem?`,
    suggestedQuestions: [
      'Explain Work-Energy Theorem and Conservation of Energy',
      'What is the difference between speed and velocity?',
      'How to solve projectile motion problems?',
    ],
  },
  {
    keywords: ['energy', 'work energy', 'conservation of energy', 'kinetic energy', 'potential energy'],
    topicTitle: 'Physics: Conservation of Energy',
    category: 'science',
    response: `Energy cannot be created or destroyed; it only transforms from one form to another (E_initial = E_final).

**Key Formulas:**
- **Kinetic Energy:** K = ½mv² (Energy of motion)
- **Gravitational Potential:** U = mgh (Stored energy from height)
- **Work:** W = F · d · cos(θ)

**Quick Example:** Dropping a ball from height h: at the top it has 100% potential energy (mgh); right before hitting the ground, all of it converted into kinetic energy (½mv²).

Want me to solve an energy conservation physics problem with you?`,
    suggestedQuestions: [
      'Explain Newton’s Laws and Free Body Diagrams',
      'What is Momentum and Impulse?',
      'Explain Ohm’s Law and Electrical Circuits',
    ],
  },

  // ---------------- WRITING & ESSAYS ----------------
  {
    keywords: ['thesis', 'thesis statement', 'essay', 'argumentative', 'essay writing'],
    topicTitle: 'Writing: Strong Thesis Statements',
    category: 'writing',
    response: `A strong thesis statement makes a specific, debatable claim with clear reasoning—not just a statement of fact.

**The 3-Part Winning Formula:**
[Although Counter-argument] + [Your Core Claim] + [Because Key Reasons]

**Weak Example:** *"Social media is bad for teens."* (Too vague, not specific)
**Strong Example:** *"Although social media enables global connectivity, excessive usage among teens increases anxiety because algorithmic feeds encourage unhealthy social comparison."*

Want me to critique or improve your essay thesis? Paste it here!`,
    suggestedQuestions: [
      'How to structure a 5-paragraph argumentative essay?',
      'How do I cite sources in APA vs MLA format?',
      'Explain the Feynman Technique',
    ],
  },
];

// ----------------------------------------------------
// INTELLIGENT ROUTER & DYNAMIC GENERATOR
// Senior-tutor style: Short, clear, example, follow-up prompt
// ----------------------------------------------------
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `Hey there! 👋 I'm your AI Study Tutor. Think of me as a friendly senior ready to help you crack homework and exams.

I keep explanations short, simple, and straight to the point:
• 🧮 **Math & Calculus:** Step-by-step solutions without textbook confusion.
• 💻 **Coding:** Clean code snippets & intuition (Python, JS, C++, Big-O).
• 🔬 **Science & Physics:** Core formulas with clear real-world examples.
• ✍️ **Essays & Study Hacks:** Fast thesis formulas, Feynman technique & Active Recall.

What are you working on right now? Ask me anything!`,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    suggestedQuestions: [
      'Explain the Feynman Technique',
      'What is 2+2?',
      'How do I solve calculus derivatives with Chain Rule?',
      'How to write a strong thesis statement?',
    ],
  },
];

export function queryLocalAITutor(userPrompt: string): { 
  response: string; 
  suggestedQuestions: string[]; 
  category: 'math' | 'science' | 'writing' | 'study_skill' | 'general' 
} {
  const raw = userPrompt.trim();
  const normalized = raw.toLowerCase().replace(/\s+/g, ' ');

  if (!normalized) {
    return {
      response: "Hey! Drop a question or pick one of the study topics below and let's get to work! 🚀",
      suggestedQuestions: ['Explain the Feynman Technique', 'How does Spaced Repetition work?', 'Calculus Chain Rule'],
      category: 'general',
    };
  }

  // 1. FAST PATH: Check simple arithmetic (e.g., "2+2", "what is 2 + 3", "15 * 4")
  const mathEval = tryEvaluateArithmetic(normalized);
  if (mathEval && mathEval.isMath) {
    let friendlyName = 'addition';
    if (mathEval.opName) friendlyName = mathEval.opName;

    return {
      response: `${mathEval.result} — simple ${friendlyName}! Want me to explain how?`,
      suggestedQuestions: [
        'How does the order of operations (PEMDAS) work?',
        'Show me a trick for mental math',
        'Help me with Calculus derivatives',
      ],
      category: 'math',
    };
  }

  // 2. CHECK REGEX PATTERNS & KNOWLEDGE BASE
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns) {
      for (const pattern of entry.patterns) {
        if (pattern.test(normalized)) {
          return {
            response: entry.response,
            suggestedQuestions: entry.suggestedQuestions,
            category: entry.category,
          };
        }
      }
    }
  }

  // 3. KEYWORD SCORING FOR HARDCODED HIGH-YIELD TOPICS
  let bestMatch: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized === kwLower) {
        score += 25;
      } else if (normalized.includes(kwLower)) {
        score += kwLower.length * 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore >= 5) {
    return {
      response: bestMatch.response,
      suggestedQuestions: bestMatch.suggestedQuestions,
      category: bestMatch.category,
    };
  }

  // 4. SMART DYNAMIC GENERATOR: Short, Friendly Senior Tone (2-3 lines + example + prompt)
  const cleanedTopic = raw
    .replace(/^(what is|explain|how to|how do i|tell me about|solve|how does|what are)\s+/i, '')
    .replace(/[?!.]+$/g, '')
    .trim();

  const isMathQuery = /(solve|derivative|integral|equation|algebra|calculus|matrix|limit|formula|x\^|sin|cos|tan|\d+\s*[\+\-\*\/])/i.test(normalized);
  const isCodingQuery = /(code|python|javascript|typescript|function|array|loop|bug|class|java|c\+\+|html|sql|algorithm)/i.test(normalized);
  const isStudySkillQuery = /(study|focus|memorize|exam|notes|schedule|time|learn|read|habit)/i.test(normalized);

  if (isMathQuery) {
    return {
      response: `Here is the simple step-by-step approach for **${cleanedTopic || 'this problem'}**:

1. Identify your knowns and the target variable.
2. Apply the core formula or isolation rule (keep both sides balanced).
3. Simplify algebraically and double-check edge conditions.

**Quick Tip:** If this is a derivative or integral, always simplify exponents and trig identities *before* applying calculus rules!

Want me to solve a specific step or walk through a sample equation with you?`,
      suggestedQuestions: [
        'Explain the Chain Rule with an example',
        'How does Integration by Substitution work?',
        'What is the Quadratic Formula?',
      ],
      category: 'math',
    };
  }

  if (isCodingQuery) {
    return {
      response: `Here is the clean and simple way to approach **${cleanedTopic || 'this coding doubt'}**:

Break it down into input, transformation, and output:
- Start with a clear base case or edge check.
- Use built-in data structures (like hash maps/dictionaries for O(1) lookups).
- Keep variable names readable.

**Quick Example Pattern:**
\`\`\`python
def solve_problem(data):
    if not data: return None
    # Process items simply
    return [x for x in data if x > 0]
\`\`\`

Want me to write the full code for your exact scenario or debug your snippet?`,
      suggestedQuestions: [
        'How does Binary Search work in Python?',
        'Explain Big-O time complexity simply',
        'What is Recursion and how do I avoid stack overflow?',
      ],
      category: 'science',
    };
  }

  if (isStudySkillQuery) {
    return {
      response: `Here is the high-yield strategy for **${cleanedTopic || 'studying effectively'}**:

Focus on high-leverage active retrieval rather than passive re-reading. Test yourself with practice questions after every 20 minutes of study, then take a short 5-minute break.

**Quick Tip:** Use the 5-Minute Rule if you feel stuck: commit to just 5 minutes of low-stress effort to break procrastination.

Want me to build a quick study schedule or quiz you on this?`,
      suggestedQuestions: [
        'Explain the Feynman Technique',
        'What is Active Recall and how do I do it?',
        'How to cram for an exam in 3 days?',
      ],
      category: 'study_skill',
    };
  }

  // General Theory Concept default
  return {
    response: `Here is the core idea of **${cleanedTopic || 'this concept'}** in simple terms:

At its core, it describes how specific inputs and conditions interact to produce a consistent outcome. Understanding *why* it works from first principles makes it much easier to remember than just memorizing definitions.

**Quick Analogy:** Think of it like building blocks—once you understand the fundamental base rule, the advanced variations fall right into place.

Want more detail, a real-world example, or want to test your understanding with a practice question?`,
    suggestedQuestions: [
      'Explain this with a real-world example',
      'Give me 3 key takeaways to remember for exams',
      'How does this connect to other topics?',
    ],
    category: 'general',
  };
}
