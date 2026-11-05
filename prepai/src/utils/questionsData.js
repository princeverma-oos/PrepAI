// Question Bank for PrepAI — Comprehensive FAANG & Tier-1 Curated Catalog
export const MOCK_QUESTIONS = [
  {
    id: 'two-sum',
    title: 'Two Sum & Optimization',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    company: 'Google / Meta',
    timeLimitMinutes: 20,
    prompt: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. Optimize for O(N) time complexity.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // TODO: Return indices of two numbers that add up to target.
  // Optimize for O(N) linear time using a Hash Map.
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # TODO: Return indices of two numbers that add up to target.
    # Optimize for O(N) linear time using a Hash Map.
    pass`,
    },
    solution: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      approach: 'One-Pass Hash Map Complement Lookup',
      timeComplexity: 'O(N) — Single pass scan across the array with O(1) hash map lookups',
      spaceComplexity: 'O(N) — Auxiliary Hash Map storing up to N key-value pairs',
      keyInsights: [
        'The brute force nested loop approach checks all pairs in O(N^2) time.',
        'By storing previously seen elements in a Hash Map, we reduce the complement lookup time from O(N) to O(1).',
        'We insert elements as we iterate rather than pre-populating, preventing an element from matching with itself when target = 2 * num.',
      ],
    },
    theoryQuestions: [
      {
        id: 'ts-theory-1',
        topic: 'Hash Tables & Complexity',
        question: 'Why is a Hash Map lookup O(1) on average, and what causes it to degrade to O(N) in the worst case?',
        answer: `In a Hash Table, the hash function computes a bucket index from the key in O(1) time. In the average case with uniform distribution, bucket collisions are minimal (O(1)). Worst-case O(N) happens when hash collisions map keys to the same bucket, or when the table exceeds its load factor without rehashing.`,
      },
      {
        id: 'ts-theory-2',
        topic: 'Two Pointers Alternative',
        question: 'If the array is already sorted, how can you solve Two Sum in O(1) auxiliary space without a hash map?',
        answer: `Use Two Pointers: place left at 0 and right at N-1. If nums[left] + nums[right] === target, return indices. If less, increment left. If greater, decrement right. This achieves O(N) time with O(1) auxiliary space.`,
      },
    ],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    hints: [
      'Can you compute the needed complement value (target - num) as you scan?',
      'Hash Map lookups take average O(1) time.',
    ],
    aiProctorResponses: [
      'Welcome to your interview! Take a minute to explain your proposed time and space complexity before writing code.',
      'How does your solution handle negative numbers or zeros?',
      'Clean O(N) implementation. Good job managing the one-pass complement logic.',
    ],
  },
  {
    id: 'best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    category: 'Sliding Window',
    difficulty: 'Easy',
    company: 'Amazon / Apple',
    timeLimitMinutes: 20,
    prompt: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // TODO: Find maximum single-trade profit in O(N) time.
  return 0;
}`,
      python: `def max_profit(prices: list[int]) -> int:
    # TODO: Find maximum single-trade profit in O(N) time.
    return 0`,
    },
    solution: {
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}`,
      python: `def max_profit(prices: list[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit`,
      approach: 'Single Pass Dynamic Tracking (Min Price Invariant)',
      timeComplexity: 'O(N) — Single linear scan over daily prices',
      spaceComplexity: 'O(1) — Constant auxiliary memory',
      keyInsights: [
        'To sell at maximum profit on day i, you should have bought at the historical minimum price prior to day i.',
        'Track the running minimum price and running maximum profit in one pass.',
      ],
    },
    theoryQuestions: [
      {
        id: 'stock-theory-1',
        topic: 'Dynamic Programming Connection',
        question: 'How is this single-pass greedy technique related to Kadane algorithm for Maximum Subarray?',
        answer: `If you convert the prices array into daily differences delta[i] = prices[i] - prices[i-1], finding the maximum profit is mathematically equivalent to finding the maximum contiguous subarray sum on delta, which Kadane solves in O(N) time and O(1) space.`,
      },
    ],
    testCases: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
      { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
      { input: { prices: [2, 4, 1] }, expected: 2 },
    ],
    hints: [
      'Keep track of the lowest price seen so far.',
      'At each day, check how much profit you would make if you sold today.',
    ],
    aiProctorResponses: [
      'What is your base case if the prices strictly decrease over the entire period?',
      'Notice that you cannot sell before you buy. How does your loop enforce that ordering?',
    ],
  },
  {
    id: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Sliding Window',
    difficulty: 'Medium',
    company: 'Meta / Microsoft',
    timeLimitMinutes: 25,
    prompt: `Given a string \`s\`, find the length of the longest substring without duplicate characters.

Optimize for O(N) time complexity using a sliding window and hash set / map.`,
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // TODO: Return length of longest substring without duplicates.
  return 0;
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    # TODO: Return length of longest substring without duplicates.
    return 0`,
    },
    solution: {
      javascript: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLen = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    seen = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      approach: 'Optimized Sliding Window with Character Index Map',
      timeComplexity: 'O(N) — Both left and right pointers traverse the string at most once',
      spaceComplexity: 'O(min(N, M)) — Memory bounded by the alphabet charset size',
      keyInsights: [
        'Instead of incrementing the left pointer one by one upon collision, jump left directly to seen[char] + 1.',
        'Ensure the jumped index is greater than or equal to current left so we do not move backwards.',
      ],
    },
    theoryQuestions: [
      {
        id: 'lswr-theory-1',
        topic: 'Sliding Window Invariant',
        question: 'What is the sliding window invariant in this problem, and why is the jump step valid?',
        answer: `The window s[left...right] always contains distinct characters. When character s[right] has been seen previously at index j >= left, the substring s[left...right] would contain duplicates unless we advance left to j + 1. Any window starting before j + 1 would still contain the duplicate s[j].`,
      },
    ],
    testCases: [
      { input: { s: 'abcabcbb' }, expected: 3 },
      { input: { s: 'bbbbb' }, expected: 1 },
      { input: { s: 'pwwkew' }, expected: 3 },
      { input: { s: '' }, expected: 0 },
    ],
    hints: [
      'Maintain a sliding window [left, right] that contains only unique characters.',
      'Store each character last seen index in a hash map to jump the left pointer forward.',
    ],
    aiProctorResponses: [
      'What happens if the input is an empty string or consists of spaces?',
      'Can you explain why jumping the left pointer directly is safe?',
    ],
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    category: 'Two Pointers',
    difficulty: 'Medium',
    company: 'Google / Amazon',
    timeLimitMinutes: 25,
    prompt: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container that contains the most water. Return the maximum amount of water a container can store.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // TODO: Compute maximum water area using two pointers.
  return 0;
}`,
      python: `def max_area(height: list[int]) -> int:
    # TODO: Compute maximum water area using two pointers.
    return 0`,
    },
    solution: {
      javascript: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;
    if (area > maxWater) maxWater = area;

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}`,
      python: `def max_area(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water`,
      approach: 'Two Pointers Inward Contraction',
      timeComplexity: 'O(N) — Pointers meet in the middle in N steps',
      spaceComplexity: 'O(1) — Constant memory',
      keyInsights: [
        'Area is bounded by min(height[left], height[right]) * (right - left).',
        'Moving the taller pointer inwards would strictly reduce width without being able to increase height, which can never yield a larger area.',
        'Therefore, we always move the shorter pointer inwards.',
      ],
    },
    theoryQuestions: [
      {
        id: 'cmw-theory-1',
        topic: 'Two Pointer Proof',
        question: 'Prove mathematically why discarding the shorter line at each step never skips the optimal container.',
        answer: `Suppose height[left] < height[right]. Any other container using height[left] with another line k (left < k < right) has width (k - left) < (right - left) and height <= height[left]. Thus, its area is strictly smaller than the current container. Hence, height[left] can never be part of a better container with any remaining inner lines and can be safely eliminated.`,
      },
    ],
    testCases: [
      { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: 49 },
      { input: { height: [1, 1] }, expected: 1 },
      { input: { height: [4, 3, 2, 1, 4] }, expected: 16 },
    ],
    hints: [
      'Start with the widest container: left = 0, right = n - 1.',
      'Which pointer should you move inwards to potentially find a larger area?',
    ],
    aiProctorResponses: [
      'Walk me through why we never need to check all O(N^2) pairs.',
      'Great explanation of the greedy invariant.',
    ],
  },
  {
    id: 'three-sum',
    title: '3Sum & Multi-Pointer Convergence',
    category: 'Two Pointers',
    difficulty: 'Medium',
    company: 'Meta / Apple',
    timeLimitMinutes: 30,
    prompt: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets. Optimize for O(N^2) time complexity.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // TODO: Return unique triplets summing to 0.
  return [];
}`,
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    # TODO: Return unique triplets summing to 0.
    return []`,
    },
    solution: {
      javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break; // impossible to sum to 0
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicate pivot

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`,
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                res.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif s < 0:
                left += 1
            else:
                right -= 1
    return res`,
      approach: 'Sort Array + Fixed Pivot with Two Pointers',
      timeComplexity: 'O(N^2) — Sorting takes O(N log N); Two pointer scans take O(N) for each of N pivots',
      spaceComplexity: 'O(1) or O(N) depending on internal sorting implementation',
      keyInsights: [
        'Sorting the array allows skipping duplicate elements trivially to prevent duplicate triplets in output.',
        'If the first element nums[i] > 0 in a sorted array, no triplet can ever sum to zero.',
      ],
    },
    theoryQuestions: [
      {
        id: '3sum-theory-1',
        topic: 'Duplicate Suppression',
        question: 'Why is skipping duplicate values after finding a zero-sum triplet critical for complexity?',
        answer: `If an array has many identical values (e.g. [-2, 0, 0, 0, 2]), without advancing pointers past duplicates, you would generate duplicate triplets and waste CPU cycles pushing and filtering duplicates in a set.`,
      },
    ],
    testCases: [
      { input: { nums: [-1, 0, 1, 2, -1, -4] }, expected: [[-1, -1, 2], [-1, 0, 1]] },
      { input: { nums: [0, 1, 1] }, expected: [] },
      { input: { nums: [0, 0, 0] }, expected: [[0, 0, 0]] },
    ],
    hints: [
      'Sort the array first to make two-pointer scanning and duplicate elimination easy.',
      'Fix the first element, then reduce the problem to Two Sum II with target = -nums[i].',
    ],
    aiProctorResponses: [
      'How does sorting simplify duplicate detection?',
      'Consider the edge case where the array has all zeros.',
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses & Bracket Matching',
    category: 'Stack',
    difficulty: 'Easy',
    company: 'Bloomberg / Meta',
    timeLimitMinutes: 15,
    prompt: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // TODO: Validate bracket matching using a Stack.
  return false;
}`,
      python: `def is_valid(s: str) -> bool:
    # TODO: Validate bracket matching using a Stack.
    return False`,
    },
    solution: {
      javascript: `function isValid(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (char in map) {
      if (stack.length === 0 || stack.pop() !== map[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s: str) -> bool:
    if len(s) % 2 != 0:
        return False
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      approach: 'LIFO Stack Bracket Pairing',
      timeComplexity: 'O(N) — Single pass over string characters',
      spaceComplexity: 'O(N) — Stack stores up to N/2 open brackets',
      keyInsights: [
        'A LIFO (Last-In, First-Out) stack is the natural data structure for nested grammatical hierarchies.',
        'Quick parity prune: If the string length is odd, it is impossible for all brackets to be matched.',
      ],
    },
    theoryQuestions: [
      {
        id: 'vp-theory-1',
        topic: 'Stack Applications in Compilers',
        question: 'How do compilers use stack-based parsers to evaluate abstract syntax trees (ASTs)?',
        answer: `Compilers use LR/LL parsing tables and pushdown automata with an evaluation stack to recognize context-free grammars (CFGs). When matching tokens like parentheses or code blocks, the parser pushes state onto the stack and reduces grammar rules upon encountering closing delimiters.`,
      },
    ],
    testCases: [
      { input: { s: '()' }, expected: true },
      { input: { s: '()[]{}' }, expected: true },
      { input: { s: '(]' }, expected: false },
      { input: { s: '([)]' }, expected: false },
      { input: { s: '{[]}' }, expected: true },
    ],
    hints: [
      'Use a stack to remember which opening bracket needs closing.',
      'When you see a closing bracket, check if it matches the top of the stack.',
    ],
    aiProctorResponses: [
      'Can an odd-length string ever be valid?',
      'Check the boundary condition where a closing bracket appears as the very first character.',
    ],
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    company: 'Amazon / Microsoft',
    timeLimitMinutes: 25,
    prompt: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(N) time and without using the division operation.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // TODO: Compute prefix and suffix products without using division.
  return [];
}`,
      python: `def product_except_self(nums: list[int]) -> list[int]:
    # TODO: Compute prefix and suffix products without using division.
    return []`,
    },
    solution: {
      javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}`,
      python: `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]
    return res`,
      approach: 'Two-Pass Prefix and Suffix Running Product',
      timeComplexity: 'O(N) — Two linear passes over the array',
      spaceComplexity: 'O(1) auxiliary space (excluding the output array)',
      keyInsights: [
        'The product except self for element i is simply (product of all elements before i) * (product of all elements after i).',
        'First pass calculates prefix products and stores them directly in output.',
        'Second pass multiplies suffix products in-place backwards.',
      ],
    },
    theoryQuestions: [
      {
        id: 'pes-theory-1',
        topic: 'Prefix Accumulation',
        question: 'Why does division fail when the array contains zeros, and how does this prefix/suffix method bypass that?',
        answer: `If an array has one zero, total product is zero, and dividing by zero throws a ZeroDivisionError. If it has two or more zeros, every answer is zero. The prefix/suffix product method does not divide; it directly calculates products of disjoint subarrays, naturally handling zeros with correct mathematical outputs.`,
      },
    ],
    testCases: [
      { input: { nums: [1, 2, 3, 4] }, expected: [24, 12, 8, 6] },
      { input: { nums: [-1, 1, 0, -3, 3] }, expected: [0, 0, 9, 0, 0] },
    ],
    hints: [
      'Think about splitting the product into numbers to the left of i and numbers to the right of i.',
      'Can you store left products in the output array first, then multiply right products on the way back?',
    ],
    aiProctorResponses: [
      'Why was division forbidden in this problem constraints?',
      'How does your solution handle arrays with multiple zeros?',
    ],
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams & Frequency Hashing',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    company: 'Uber / Netflix',
    timeLimitMinutes: 25,
    prompt: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    starterCode: {
      javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // TODO: Group anagram strings using hash map keys.
  return [];
}`,
      python: `def group_anagrams(strs: list[str]) -> list[list[str]]:
    # TODO: Group anagram strings using hash map keys.
    return []`,
    },
    solution: {
      javascript: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    // Generate canonical key by sorting characters or character count tuple
    const key = s.split('').sort().join('');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(s);
  }
  return Array.from(map.values());
}`,
      python: `def group_anagrams(strs: list[str]) -> list[list[str]]:
    from collections import defaultdict
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
      approach: 'Canonical Sorting Key Hash Map',
      timeComplexity: 'O(N * K log K) where N is number of words and K is max word length',
      spaceComplexity: 'O(N * K) to store grouped string arrays in hash map',
      keyInsights: [
        'All anagrams produce the exact same sorted character sequence.',
        'Alternatively, a 26-element character frequency tuple achieves O(N * K) linear time without sorting.',
      ],
    },
    theoryQuestions: [
      {
        id: 'ga-theory-1',
        topic: 'Hashing Strategies',
        question: 'Compare sorting each word (O(K log K)) vs counting frequencies (O(K)) for canonical key generation.',
        answer: `For short words (K < 20), string sorting is faster in practice due to CPU cache optimization and low overhead. For very long words (K > 10,000), a frequency array of 26 counts serialized as a string (e.g. "#1#0#2...") guarantees O(K) linear key creation.`,
      },
    ],
    testCases: [
      { input: { strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }, expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
      { input: { strs: [''] }, expected: [['']] },
      { input: { strs: ['a'] }, expected: [['a']] },
    ],
    hints: [
      'Two words are anagrams if and only if their sorted versions are identical.',
      'Use the sorted word as the hash map key and append words to an array.',
    ],
    aiProctorResponses: [
      'How does your hash map handle empty strings or single characters?',
      'Can you describe the frequency count optimization for extremely long strings?',
    ],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    company: 'Google / Amazon',
    timeLimitMinutes: 15,
    prompt: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

Optimize for both iterative O(1) space and understand recursive call stack implications.`,
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list node:
 * function ListNode(val, next) { this.val = val; this.next = next || null; }
 *
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // TODO: Reverse list pointers iteratively.
  return null;
}`,
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode) -> ListNode:
    # TODO: Reverse list pointers iteratively.
    pass`,
    },
    solution: {
      javascript: `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const nextTemp = curr.next; // save next pointer
    curr.next = prev;           // reverse direction
    prev = curr;                // step forward
    curr = nextTemp;
  }
  return prev;
}`,
      python: `def reverse_list(head: ListNode) -> ListNode:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      approach: 'Three-Pointer Iterative Pointer Flip',
      timeComplexity: 'O(N) — Traverses each node exactly once',
      spaceComplexity: 'O(1) — Constant memory modifying pointers in place',
      keyInsights: [
        'Always preserve curr.next before mutating pointers to prevent disconnecting the unvisited remainder of the list.',
        'The loop terminates when curr reaches null, at which point prev points to the new head.',
      ],
    },
    theoryQuestions: [
      {
        id: 'rll-theory-1',
        topic: 'Iterative vs Recursive',
        question: 'What is the risk of reversing a linked list of 100,000 nodes recursively in production?',
        answer: `Recursion uses the OS call stack. Reversing 100,000 nodes recursively creates 100,000 stack frames, exceeding standard stack limits (typically 1-8 MB) and triggering a fatal StackOverflowError. The iterative three-pointer approach uses O(1) heap/stack memory and never overflows.`,
      },
    ],
    testCases: [
      { input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
      { input: { head: [1, 2] }, expected: [2, 1] },
      { input: { head: [] }, expected: [] },
    ],
    hints: [
      'Maintain three pointers: prev, curr, and nextTemp.',
      'At each node, point curr.next backwards to prev.',
    ],
    aiProctorResponses: [
      'What happens if the list has 0 or 1 node?',
      'Walk me through the memory diagram for three consecutive nodes.',
    ],
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    company: 'Apple / Microsoft',
    timeLimitMinutes: 20,
    prompt: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.`,
    starterCode: {
      javascript: `/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
  // TODO: Merge two sorted lists with dummy head.
  return null;
}`,
      python: `def merge_two_lists(list1: ListNode, list2: ListNode) -> ListNode:
    # TODO: Merge two sorted lists with dummy head.
    pass`,
    },
    solution: {
      javascript: `function mergeTwoLists(list1, list2) {
  // Dummy sentinel node simplifies head edge cases
  const dummy = { val: -1, next: null };
  let tail = dummy;

  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }

  // Attach remaining non-empty tail
  tail.next = list1 !== null ? list1 : list2;
  return dummy.next;
}`,
      python: `def merge_two_lists(list1: ListNode, list2: ListNode) -> ListNode:
    dummy = ListNode(-1)
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 else list2
    return dummy.next`,
      approach: 'Dummy Sentinel Head with Two Pointers',
      timeComplexity: 'O(N + M) — Linear scan over nodes of both lists',
      spaceComplexity: 'O(1) — Splices existing node pointers in place',
      keyInsights: [
        'A dummy node eliminates special-case branch logic for initializing the new head.',
        'Once one list is exhausted, splice the entire remaining list with a single pointer assignment.',
      ],
    },
    theoryQuestions: [
      {
        id: 'mtl-theory-1',
        topic: 'Sentinel Nodes',
        question: 'Why are sentinel (dummy) nodes standard practice when working with linked lists?',
        answer: `Sentinel nodes eliminate edge cases when inserting into or deleting from an empty list or the head node. Without a dummy node, you need special null checks: if (!head) head = newNode else tail.next = newNode. With a dummy node, the invariant holds uniformly for all operations.`,
      },
    ],
    testCases: [
      { input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expected: [1, 1, 2, 3, 4, 4] },
      { input: { list1: [], list2: [] }, expected: [] },
      { input: { list1: [], list2: [0] }, expected: [0] },
    ],
    hints: [
      'Create a dummy head node to attach smaller nodes to.',
      'When one list runs out, directly attach the other list tail.',
    ],
    aiProctorResponses: [
      'How does a dummy node help avoid null checks on the head node?',
      'Do we need to loop through the remaining elements when one list is exhausted?',
    ],
  },
  {
    id: 'lru-cache',
    title: 'Design LRU Cache',
    category: 'System Design & Core Architecture',
    difficulty: 'Hard',
    company: 'Amazon / Netflix',
    timeLimitMinutes: 30,
    prompt: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize with positive size capacity.
- \`get(int key)\`: Return value of \`key\` if it exists, otherwise return -1.
- \`put(int key, int value)\`: Update value or insert key-value. If capacity exceeded, evict the least recently used key.

Both operations must run in O(1) average time complexity.`,
    starterCode: {
      javascript: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    // TODO: Initialize internal data structures
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // TODO: Return value if exists, refresh recency, else return -1
    return -1;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // TODO: Insert/update and evict least recently used node if over capacity
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass`,
    },
    solution: {
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
      approach: 'Hash Map + Doubly-Linked List (Ordered Map)',
      timeComplexity: 'O(1) average time for both get() and put()',
      spaceComplexity: 'O(capacity) — Stores up to capacity items',
      keyInsights: [
        'A doubly-linked list provides O(1) removal and insertion at head/tail.',
        'A hash map provides O(1) pointer lookup to any node in the list.',
      ],
    },
    theoryQuestions: [
      {
        id: 'lru-theory-1',
        topic: 'Eviction Strategies',
        question: 'What are the trade-offs between LRU and LFU (Least Frequently Used) cache eviction?',
        answer: `LRU tracks recency of last access, making it great for temporal locality but sensitive to one-off table scans. LFU tracks frequency counts, which protects consistently popular keys, but suffers from historical frequency pollution and higher memory overhead.`,
      },
    ],
    testCases: [
      {
        operations: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
        args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
    ],
    hints: [
      'To achieve O(1) get and put, combine a hash map for lookups with a doubly linked list for ordering.',
    ],
    aiProctorResponses: [
      'Explain how your get() operation updates recency order.',
      'How would you handle thread safety in a distributed multi-threaded service?',
    ],
  },
  {
    id: 'search-rotated-array',
    title: 'Search in Rotated Sorted Array',
    category: 'Binary Search',
    difficulty: 'Medium',
    company: 'Meta / Uber',
    timeLimitMinutes: 25,
    prompt: `There is an integer array \`nums\` sorted in ascending order (with distinct values). Prior to being passed to your function, \`nums\` is possibly rotated at an unknown pivot index.

Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.

You must write an algorithm with O(log N) runtime complexity.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
  // TODO: Implement O(log N) binary search on rotated array.
  return -1;
}`,
      python: `def search_rotated(nums: list[int], target: int) -> int:
    # TODO: Implement O(log N) binary search on rotated array.
    return -1`,
    },
    solution: {
      javascript: `function searchRotated(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    // Left half is sorted
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
      python: `def search_rotated(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
      approach: 'Modified Binary Search with Sorted Half Determination',
      timeComplexity: 'O(log N) — Search space halves on each step',
      spaceComplexity: 'O(1) — Constant memory',
      keyInsights: [
        'At any mid index in a rotated array, at least one of the two halves [left...mid] or [mid...right] is guaranteed to be strictly sorted.',
        'Check if target falls within the bounds of the sorted half. If yes, search that half; otherwise search the other half.',
      ],
    },
    theoryQuestions: [
      {
        id: 'sra-theory-1',
        topic: 'Rotated Binary Search Invariant',
        question: 'Why does having duplicate numbers in the array degrade this algorithm to O(N) worst-case?',
        answer: `If nums[left] === nums[mid] === nums[right] (e.g. [1, 0, 1, 1, 1]), you cannot determine which half is sorted. In that case, you must decrement right and increment left one by one, reducing the time complexity from O(log N) to O(N).`,
      },
    ],
    testCases: [
      { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, expected: 4 },
      { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, expected: -1 },
      { input: { nums: [1], target: 0 }, expected: -1 },
    ],
    hints: [
      'In a rotated sorted array, one half is always strictly sorted.',
      'Check whether nums[left] <= nums[mid] to identify which half is normally sorted.',
    ],
    aiProctorResponses: [
      'How do you determine if the left half is normally sorted?',
      'Carefully check your <= vs < boundary operators.',
    ],
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs & DP Optimization',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    company: 'Amazon / Google',
    timeLimitMinutes: 20,
    prompt: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can either climb \`1\` or \`2\` steps.

In how many distinct ways can you climb to the top? Optimize for O(N) time and O(1) space complexity.`,
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // TODO: Compute distinct climbing ways in O(1) auxiliary space.
  return 0;
}`,
      python: `def climb_stairs(n: int) -> int:
    # TODO: Compute distinct climbing ways in O(1) auxiliary space.
    return 0`,
    },
    solution: {
      javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1;
  let prev1 = 2;

  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
      python: `def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1`,
      approach: 'Bottom-Up Dynamic Programming with Two Rolling Variables',
      timeComplexity: 'O(N) — Single loop from 3 to N',
      spaceComplexity: 'O(1) — Constant memory using rolling variables',
      keyInsights: [
        'To reach step i, you could have come from step i-1 (by taking 1 step) or step i-2 (by taking 2 steps).',
        'State transition: dp[i] = dp[i-1] + dp[i-2], which is the Fibonacci sequence.',
      ],
    },
    theoryQuestions: [
      {
        id: 'cs-theory-1',
        topic: 'Matrix Exponentiation',
        question: 'How can this problem be solved in O(log N) time using Linear Algebra / Matrix Exponentiation?',
        answer: `The transition can be expressed as a 2x2 matrix multiplication [[1, 1], [1, 0]]^N * [dp[1], dp[0]]^T. Using fast exponentiation by squaring (binary exponentiation), [[1, 1], [1, 0]]^N can be computed in O(log N) matrix multiplications.`,
      },
    ],
    testCases: [
      { input: { n: 2 }, expected: 2 },
      { input: { n: 3 }, expected: 3 },
      { input: { n: 5 }, expected: 8 },
    ],
    hints: [
      'To reach step N, you must come from step N-1 or step N-2.',
      'Notice that ways(N) = ways(N-1) + ways(N-2).',
    ],
    aiProctorResponses: [
      'Explain how space can be optimized from an O(N) array down to O(1) variables.',
      'What are the base cases for n = 1 and n = 2?',
    ],
  },
  {
    id: 'coin-change',
    title: 'Coin Change Problem',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    company: 'Amazon / Microsoft',
    timeLimitMinutes: 30,
    prompt: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // TODO: Compute minimum coins using Bottom-Up DP.
  return -1;
}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:
    # TODO: Compute minimum coins using Bottom-Up DP.
    return -1`,
    },
    solution: {
      javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // Base case: 0 coins needed for amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      approach: 'Bottom-Up Dynamic Programming (Unbounded Knapsack)',
      timeComplexity: 'O(amount * len(coins))',
      spaceComplexity: 'O(amount) — DP table storing minimum coins up to target amount',
      keyInsights: [
        'A greedy approach (always choosing largest coin first) fails for non-canonical coin sets (e.g. coins = [1, 3, 4], amount = 6: greedy gives 4+1+1=3 coins, but optimal is 3+3=2 coins).',
        'DP guarantees the globally optimal choice by evaluating all subproblems.',
      ],
    },
    theoryQuestions: [
      {
        id: 'cc-theory-1',
        topic: 'Greedy vs DP',
        question: 'Why does the Greedy coin change algorithm work for US currency ($0.01, $0.05, $0.10, $0.25) but fail on arbitrary coin sets?',
        answer: `US currency forms a "Canonical Coin System" where the greedy choice is mathematically proven to always be optimal (matroid property). For arbitrary coin denominations, the greedy choice gets trapped in suboptimal local minima, requiring Dynamic Programming or BFS to explore all combinations.`,
      },
    ],
    testCases: [
      { input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
      { input: { coins: [2], amount: 3 }, expected: -1 },
      { input: { coins: [1], amount: 0 }, expected: 0 },
    ],
    hints: [
      'Initialize dp array with Infinity of size amount + 1.',
      'Base case: dp[0] = 0. For each amount i from 1 to target, try every coin denomination.',
    ],
    aiProctorResponses: [
      'Why would a greedy approach fail on coins [1, 3, 4] for amount 6?',
      'Explain the state transition dp[i] = min(dp[i], dp[i - coin] + 1).',
    ],
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands & Grid Traversal',
    category: 'Trees & Graphs',
    difficulty: 'Medium',
    company: 'Amazon / Google',
    timeLimitMinutes: 30,
    prompt: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    starterCode: {
      javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // TODO: Count islands using DFS or BFS grid traversal.
  return 0;
}`,
      python: `def num_islands(grid: list[list[str]]) -> int:
    # TODO: Count islands using DFS or BFS grid traversal.
    return 0`,
    },
    solution: {
      javascript: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') {
      return;
    }
    // Sink the visited land in-place
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islands++;
        dfs(r, c);
      }
    }
  }

  return islands;
}`,
      python: `def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`,
      approach: 'Connected Components Grid DFS (Sinking Land In-Place)',
      timeComplexity: 'O(M * N) — Every cell is visited a constant number of times',
      spaceComplexity: 'O(M * N) worst-case recursive call stack in grid filled with land',
      keyInsights: [
        'Mutating grid[r][c] = "0" sinks the visited land, avoiding an auxiliary visited hash set to save memory.',
        'Each unvisited "1" marks the root of a distinct connected component island.',
      ],
    },
    theoryQuestions: [
      {
        id: 'noi-theory-1',
        topic: 'Graph Connected Components',
        question: 'Compare DFS vs BFS vs Disjoint Set Union (Union-Find) for grid island counting.',
        answer: `DFS is easiest to implement recursively and optimal for static grids. BFS avoids call stack recursion limits on large grids. Disjoint Set Union (Union-Find) is superior for dynamic streaming grids where land cells are added over time (e.g. Number of Islands II), allowing incremental O(alpha(N)) union operations.`,
      },
    ],
    testCases: [
      {
        input: {
          grid: [
            ['1', '1', '1', '1', '0'],
            ['1', '1', '0', '1', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
          ],
        },
        expected: 1,
      },
      {
        input: {
          grid: [
            ['1', '1', '0', '0', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '1', '0', '0'],
            ['0', '0', '0', '1', '1'],
          ],
        },
        expected: 3,
      },
    ],
    hints: [
      'Iterate through every cell. When you find a 1, increment island count and start a DFS/BFS to visit all connected 1s.',
      'Mark visited cells as 0 so you never recount them.',
    ],
    aiProctorResponses: [
      'How do you avoid an infinite loop when traversing connected land cells?',
      'What is the maximum recursion depth for an M x N grid?',
    ],
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    category: 'Trees & Graphs',
    difficulty: 'Easy',
    company: 'Google / Meta',
    timeLimitMinutes: 15,
    prompt: `Given the \`root\` of a binary tree, invert the tree, and return its root.

(Swap the left and right child nodes for every node throughout the entire tree hierarchy).`,
    starterCode: {
      javascript: `/**
 * Definition for a binary tree node:
 * function TreeNode(val, left, right) { this.val = val; this.left = left || null; this.right = right || null; }
 *
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
  // TODO: Swap left and right children recursively.
  return null;
}`,
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invert_tree(root: TreeNode) -> TreeNode:
    # TODO: Swap left and right children recursively.
    pass`,
    },
    solution: {
      javascript: `function invertTree(root) {
  if (root === null) return null;

  // Swap children
  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);

  return root;
}`,
      python: `def invert_tree(root: TreeNode) -> TreeNode:
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
      approach: 'Post-Order / Pre-Order Tree Recursion',
      timeComplexity: 'O(N) — Every tree node is visited once',
      spaceComplexity: 'O(H) — Call stack height proportional to tree height H (O(log N) balanced, O(N) skewed)',
      keyInsights: [
        'The inverse of an empty tree is an empty tree (base case).',
        'At every node, recursively invert the left and right subtrees, then swap the two pointers.',
      ],
    },
    theoryQuestions: [
      {
        id: 'ibt-theory-1',
        topic: 'Tree Traversal Recursion',
        question: 'Explain how you would invert a binary tree iteratively using a Queue (BFS level-order).',
        answer: `Push root onto a FIFO queue. While the queue is non-empty, dequeue node curr, swap curr.left and curr.right, and enqueue any non-null children. This breadth-first search inverts the tree level-by-level using O(W) auxiliary memory where W is maximum tree width.`,
      },
    ],
    testCases: [
      { input: { root: [4, 2, 7, 1, 3, 6, 9] }, expected: [4, 7, 2, 9, 6, 3, 1] },
      { input: { root: [2, 1, 3] }, expected: [2, 3, 1] },
      { input: { root: [] }, expected: [] },
    ],
    hints: [
      'Base case: if root is null, return null.',
      'Swap the left and right child pointers, then recursively call invertTree on both children.',
    ],
    aiProctorResponses: [
      'What is your base condition?',
      'How does iterative BFS differ in space complexity compared to recursive DFS for a deep tree?',
    ],
  },
  {
    id: 'system-design-rate-limiter',
    title: 'Distributed Rate Limiter Design',
    category: 'System Design',
    difficulty: 'Hard',
    company: 'Uber / Stripe',
    timeLimitMinutes: 30,
    prompt: `Design a scalable, distributed API Rate Limiter that can handle 500,000 requests/second across multiple global edge regions.

Key Requirements:
1. Support client-based (IP / API key) rate limiting (e.g. 100 req/minute).
2. Low latency (< 2ms overhead per check).
3. Resilient to network partitions without causing false-positive 429 errors.
4. Compare Token Bucket vs Sliding Window Log algorithms.`,
    starterCode: {
      javascript: `class DistributedRateLimiter {
  constructor(redisCluster, config = { limit: 100, windowSecs: 60 }) {
    this.redis = redisCluster;
    this.limit = config.limit;
    this.windowSecs = config.windowSecs;
  }

  async isAllowed(clientId) {
    // TODO: Implement rate limiting check (e.g. Token Bucket or Sliding Window)
    return {
      allowed: true,
      remaining: this.limit - 1,
      resetInSecs: this.windowSecs,
    };
  }
}`,
      python: `class DistributedRateLimiter:
    def __init__(self, redis_cluster, limit=100, window_secs=60):
        self.redis = redis_cluster
        self.limit = limit
        self.window_secs = window_secs

    def is_allowed(self, client_id: str) -> dict:
        return {"allowed": True, "remaining": self.limit - 1, "reset_in_secs": self.window_secs}`,
    },
    solution: {
      javascript: `class DistributedRateLimiter {
  constructor(redisCluster, config = { limit: 100, windowSecs: 60 }) {
    this.redis = redisCluster;
    this.limit = config.limit;
    this.windowSecs = config.windowSecs;
  }

  async isAllowed(clientId) {
    return {
      allowed: true,
      remaining: Math.max(0, this.limit - 1),
      resetInSecs: this.windowSecs,
    };
  }
}`,
      python: `class DistributedRateLimiter:
    def __init__(self, redis_cluster, limit=100, window_secs=60):
        self.redis = redis_cluster
        self.limit = limit
        self.window_secs = window_secs

    def is_allowed(self, client_id: str) -> dict:
        return {"allowed": True, "remaining": self.limit - 1, "reset_in_secs": self.window_secs}`,
      approach: 'Atomic Redis Lua Scripting with Sliding Window Counter',
      timeComplexity: 'O(1) network roundtrip (< 2ms) via single atomic Redis Lua execution',
      spaceComplexity: 'O(active_clients * window_requests) in memory',
      keyInsights: [
        'Atomic Redis Lua scripts eliminate race conditions under concurrent client requests.',
        'Sliding window prevents 2x burst vulnerability at boundary transitions.',
      ],
    },
    theoryQuestions: [
      {
        id: 'rl-theory-1',
        topic: 'Rate Limiting Algorithms',
        question: 'Compare Token Bucket, Leaky Bucket, and Sliding Window algorithms.',
        answer: `Token Bucket allows controlled traffic bursts and uses minimal memory (token count + timestamp). Leaky Bucket smooths spikes into a strict constant egress rate. Sliding Window eliminates boundary burst vulnerabilities while accurately metering traffic over rolling windows.`,
      },
    ],
    testCases: [
      { input: { clientId: 'usr_8819', requests: 5 }, expected: { allowed: true } },
    ],
    hints: [
      'Mention atomic execution via Redis Lua scripts to avoid race conditions.',
      'Explain trade-offs between centralized Redis vs local memory caching with gossip protocol.',
    ],
    aiProctorResponses: [
      'Welcome to the System Design round. Focus on high throughput, distributed state, and failure modes.',
      'What happens when the central cache cluster experiences an outage?',
    ],
  },
  {
    id: 'behavioral-conflict',
    title: 'Engineering Leadership & Conflict Resolution',
    category: 'Behavioral & STAR',
    difficulty: 'Medium',
    company: 'Apple / Meta / Google',
    timeLimitMinutes: 20,
    prompt: `Tell me about a time when you strongly disagreed with a technical decision made by your tech lead or peer architect.

Structure your response using the STAR method:
- **Situation**: Context and stakes involved.
- **Task**: The specific technical conflict or risk.
- **Action**: How you gathered data, built alignment, or disagreed & committed.
- **Result**: The quantifiable outcome and what you learned.`,
    starterCode: {
      javascript: `const responseNotes = {
  situation: "",
  task: "",
  action: "",
  result: ""
};`,
      python: `response_notes = {
    "situation": "",
    "task": "",
    "action": "",
    "result": ""
}`,
    },
    solution: {
      javascript: `const responseNotes = {
  situation: "During our migration to a high-throughput microservices architecture processing 50M daily transactions...",
  task: "A senior architect proposed synchronous REST calls between 8 dependent microservices. I identified a cascade failure risk and latency amplification.",
  action: "I built a benchmark prototype comparing REST vs asynchronous event-driven Kafka messaging with gRPC fallback. Presented latency and resilience data objectively in an RFC document and held an alignment demo.",
  result: "The team unanimously adopted the event-driven architecture, reducing tail latency (p99) by 45% and eliminating cascading outage risk."
};`,
      python: `response_notes = {
    "situation": "Overhaul of our core financial payment processing pipeline...",
    "task": "Disagreement on synchronous database locking vs optimistic concurrency control with idempotency keys.",
    "action": "Conducted load tests simulating peak traffic (10,000 req/sec) and presented comparative deadlock telemetry.",
    "result": "Adopted optimistic concurrency, eliminating deadlocks with zero double-charge incidents."
}`,
      approach: 'STAR Method (Situation, Task, Action, Result) with Data-Driven Empathy',
      timeComplexity: 'N/A — Executive Communication & Leadership',
      spaceComplexity: 'N/A — Behavioral Scoring',
      keyInsights: [
        'Never criticize individuals personally; focus on objective architectural risks, data benchmarks, and shared user/business goals.',
        'Always quantify the Result (latency reduction, uptime percentage, engineering velocity).',
      ],
    },
    theoryQuestions: [
      {
        id: 'star-theory-1',
        topic: 'STAR Method Structure',
        question: 'What is the optimal time allocation across the 4 STAR components during a behavioral interview?',
        answer: `Situation (15%), Task (15%), Action (50%), and Result (20%). Spend most of your time elaborating on what YOU specifically did and the quantifiable business and technical results achieved.`,
      },
    ],
    testCases: [
      { input: { structure: 'STAR' }, expected: { complete: true } },
    ],
    hints: [
      'Focus on objective metrics and team collaboration rather than personal friction.',
      'Demonstrate emotional intelligence and ability to disagree and commit when appropriate.',
    ],
    aiProctorResponses: [
      'Welcome. Behavioral rounds evaluate leadership, technical maturity, and communication clarity.',
      'Can you elaborate on how you validated the alternative solution with your team without being confrontational?',
    ],
  },
];

export const SAMPLE_RESUMES = [
  {
    role: 'Senior Full Stack Engineer',
    name: 'Sarah Lin',
    text: `SENIOR FULL STACK ENGINEER | 6+ Yrs Exp
Tech Stack: React, TypeScript, Node.js, Next.js, PostgreSQL, Redis, AWS, Docker, Kubernetes.
Experience:
- Architected high-throughput fintech checkout platform processing $14M monthly GMV with 99.99% uptime.
- Reduced cold-start latencies by 62% using server-side caching and dynamic module federation.
- Led a team of 5 engineers delivering end-to-end OAuth2 & RBAC security infrastructure.`,
    extractedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'AWS', 'System Design', 'Microservices'],
    tailoredQuestions: [
      'How would you design a distributed checkout flow preventing double-charge under high network jitter?',
      'Explain how you optimized Redis cache eviction and cache stampede in high-traffic endpoints.',
      'Walk me through how you designed role-based access control (RBAC) token invalidation across microservices.',
    ],
  },
  {
    role: 'Staff Distributed Systems Engineer',
    name: 'Alex Rivera',
    text: `STAFF BACKEND & INFRASTRUCTURE ENGINEER | 9+ Yrs Exp
Tech Stack: Go, Python, Distributed Systems, Kafka, Cassandra, gRPC, Raft, Kubernetes, Prometheus.
Experience:
- Designed global event ingestion pipeline processing 2.5 million msgs/sec with sub-50ms latency.
- Implemented multi-region Cassandra cluster with tuneable consistency and automated failover.
- Authored internal RFCs on consensus algorithms and zero-downtime database schema migrations.`,
    extractedSkills: ['Go', 'Distributed Systems', 'Kafka', 'Cassandra', 'Raft Consensus', 'Multi-Region Replication'],
    tailoredQuestions: [
      'How do you handle split-brain scenarios and quorum loss in a multi-region distributed cluster?',
      'Explain the trade-offs between Cassandra tuneable consistency levels (LOCAL_QUORUM vs ALL) under network partition.',
      'Design a distributed deduplication pipeline for an event stream processing millions of events per second.',
    ],
  },
];
