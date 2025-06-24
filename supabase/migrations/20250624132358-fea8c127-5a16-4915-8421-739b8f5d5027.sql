
-- Add comprehensive modules across all levels

-- Clear existing modules first to avoid conflicts
DELETE FROM public.modules;

-- BEGINNER LEVEL MODULES
INSERT INTO public.modules (id, topic_id, name, description, level, sort_order, xp_value, questions) VALUES

-- Budgeting Topic - Beginner
('what_is_money', 'budgeting', 'What is Money?', 'Understanding the basic concept and functions of money', 'beginner', 1, 25, '[
  {
    "question": "What is the primary function of money?",
    "options": ["To make people happy", "To serve as a medium of exchange", "To be stored in banks", "To create wealth"],
    "correctAnswer": 1
  },
  {
    "question": "Which of these is NOT a characteristic of good money?",
    "options": ["Durable", "Divisible", "Heavy", "Portable"],
    "correctAnswer": 2
  }
]'),

('needs_vs_wants', 'budgeting', 'Needs vs. Wants', 'Learning to distinguish between essential needs and desires', 'beginner', 2, 25, '[
  {
    "question": "Which of these is a NEED?",
    "options": ["Video games", "Food", "Designer clothes", "Latest smartphone"],
    "correctAnswer": 1
  },
  {
    "question": "Why is it important to know the difference between needs and wants?",
    "options": ["To impress friends", "To make better spending decisions", "To buy more things", "To avoid shopping"],
    "correctAnswer": 1
  }
]'),

('simple_financial_goals', 'budgeting', 'Simple Financial Goals', 'Setting and achieving basic financial objectives', 'beginner', 3, 25, '[
  {
    "question": "What makes a financial goal more achievable?",
    "options": ["Making it very expensive", "Making it specific and time-bound", "Keeping it secret", "Making it complicated"],
    "correctAnswer": 1
  },
  {
    "question": "Which is an example of a good short-term financial goal?",
    "options": ["Save $1 million", "Save $100 in 3 months", "Buy a mansion", "Retire early"],
    "correctAnswer": 1
  }
]'),

-- Saving Topic - Beginner
('why_save_money', 'saving', 'Why Save Money?', 'Understanding the importance and benefits of saving', 'beginner', 1, 25, '[
  {
    "question": "What is the main benefit of saving money?",
    "options": ["To show off to friends", "To prepare for future expenses and emergencies", "To avoid spending it", "To make banks happy"],
    "correctAnswer": 1
  },
  {
    "question": "When should you start saving money?",
    "options": ["When you are old", "Only when you have a lot of money", "As soon as you start earning", "Never"],
    "correctAnswer": 2
  }
]'),

('types_savings_goals', 'saving', 'Types of Savings Goals', 'Different categories of things to save for', 'beginner', 2, 25, '[
  {
    "question": "Which is an example of an emergency savings goal?",
    "options": ["Vacation fund", "Car repair fund", "Wedding fund", "Hobby fund"],
    "correctAnswer": 1
  },
  {
    "question": "What is a short-term savings goal?",
    "options": ["Retirement", "Something you want to buy within a year", "College education", "Buying a house"],
    "correctAnswer": 1
  }
]'),

('what_is_bank', 'saving', 'What is a Bank?', 'Understanding banks and their basic services', 'beginner', 3, 25, '[
  {
    "question": "What is the main purpose of a bank?",
    "options": ["To give away free money", "To safely store money and provide financial services", "To sell products", "To provide entertainment"],
    "correctAnswer": 1
  },
  {
    "question": "What does FDIC insurance protect?",
    "options": ["Your car", "Your house", "Your bank deposits", "Your health"],
    "correctAnswer": 2
  }
]'),

-- Debt Topic - Beginner
('what_is_credit', 'debt', 'What is Credit?', 'Basic understanding of credit and borrowing money', 'beginner', 1, 25, '[
  {
    "question": "What is credit?",
    "options": ["Free money", "The ability to borrow money with a promise to pay it back", "A type of bank account", "A savings plan"],
    "correctAnswer": 1
  },
  {
    "question": "When you use credit, what must you eventually do?",
    "options": ["Nothing", "Pay back the money borrowed", "Give it to someone else", "Invest it"],
    "correctAnswer": 1
  }
]'),

('good_vs_bad_debt', 'debt', 'Good vs Bad Debt', 'Understanding different types of debt and their impacts', 'beginner', 2, 25, '[
  {
    "question": "Which is generally considered good debt?",
    "options": ["Credit card debt for shopping", "Student loans for education", "Payday loans", "Debt for luxury items"],
    "correctAnswer": 1
  },
  {
    "question": "What makes debt bad?",
    "options": ["Low interest rates", "High interest rates and no long-term benefit", "Short repayment terms", "Small amounts"],
    "correctAnswer": 1
  }
]'),

-- Investing Topic - Beginner
('what_is_investing', 'investing', 'What is Investing?', 'Basic introduction to the concept of investing', 'beginner', 1, 25, '[
  {
    "question": "What is investing?",
    "options": ["Spending money on fun things", "Putting money to work to potentially earn more money over time", "Storing money in a safe", "Giving money away"],
    "correctAnswer": 1
  },
  {
    "question": "What is the main goal of investing?",
    "options": ["To lose money quickly", "To grow wealth over time", "To impress others", "To spend immediately"],
    "correctAnswer": 1
  }
]'),

('why_invest', 'investing', 'Why Invest?', 'Understanding the reasons and benefits of investing', 'beginner', 2, 25, '[
  {
    "question": "Why might someone choose to invest rather than just save?",
    "options": ["Investing is always safer", "Potential for higher returns over time", "It requires no effort", "Banks require it"],
    "correctAnswer": 1
  },
  {
    "question": "What is inflation?",
    "options": ["Money growing in value", "The general increase in prices over time", "A type of investment", "A banking fee"],
    "correctAnswer": 1
  }
]'),

-- INTERMEDIATE LEVEL MODULES

-- Budgeting Topic - Intermediate
('time_value_money', 'budgeting', 'Time Value of Money', 'Understanding how money changes value over time', 'intermediate', 1, 50, '[
  {
    "question": "What does time value of money mean?",
    "options": ["Money expires over time", "Money today is worth more than the same amount in the future", "Time costs money", "Money gets older"],
    "correctAnswer": 1
  },
  {
    "question": "Why is money today worth more than money tomorrow?",
    "options": ["Inflation and opportunity cost", "It looks newer", "Banks prefer it", "It spends faster"],
    "correctAnswer": 0
  }
]'),

('understanding_inflation', 'budgeting', 'Understanding Inflation', 'How rising prices affect your purchasing power', 'intermediate', 2, 50, '[
  {
    "question": "What happens to your purchasing power during inflation?",
    "options": ["It increases", "It decreases", "It stays the same", "It becomes irrelevant"],
    "correctAnswer": 1
  },
  {
    "question": "How can you protect against inflation?",
    "options": ["Keep all money in cash", "Invest in assets that grow with inflation", "Avoid spending money", "Only buy cheaper items"],
    "correctAnswer": 1
  }
]'),

-- Saving Topic - Intermediate
('compound_interest', 'saving', 'Compound Interest', 'Understanding how interest earns interest over time', 'intermediate', 1, 50, '[
  {
    "question": "What is compound interest?",
    "options": ["Interest that is complicated", "Interest earned on both principal and previously earned interest", "Interest that compounds problems", "Very high interest rates"],
    "correctAnswer": 1
  },
  {
    "question": "How does time affect compound interest?",
    "options": ["Time has no effect", "The longer the time, the more powerful the effect", "Shorter time is better", "Time makes it disappear"],
    "correctAnswer": 1
  }
]'),

-- ADVANCED LEVEL MODULES

-- Investing Topic - Advanced
('modern_portfolio_theory', 'investing', 'Modern Portfolio Theory', 'Advanced concepts of portfolio optimization and risk management', 'advanced', 1, 75, '[
  {
    "question": "What is the main principle of Modern Portfolio Theory?",
    "options": ["Buy only growth stocks", "Diversification can reduce risk without sacrificing expected return", "Always invest in bonds", "Timing the market is key"],
    "correctAnswer": 1
  },
  {
    "question": "What is the efficient frontier?",
    "options": ["The fastest way to invest", "The set of optimal portfolios offering highest expected return for each level of risk", "A type of mutual fund", "An investment strategy"],
    "correctAnswer": 1
  }
]'),

-- Estate Topic - Advanced
('complex_trust_strategies', 'estate', 'Complex Trust Strategies', 'Advanced trust structures for estate planning', 'advanced', 1, 75, '[
  {
    "question": "What is a Generation-Skipping Trust designed to do?",
    "options": ["Skip payments", "Transfer wealth to grandchildren while minimizing estate taxes", "Avoid all taxes", "Skip probate entirely"],
    "correctAnswer": 1
  },
  {
    "question": "What is the main benefit of an Irrevocable Life Insurance Trust (ILIT)?",
    "options": ["Provides immediate income", "Removes life insurance proceeds from taxable estate", "Guarantees investment returns", "Eliminates all insurance premiums"],
    "correctAnswer": 1
  }
]'),

-- EXPERT LEVEL MODULES

-- Investing Topic - Expert
('derivatives_introduction', 'investing', 'Derivatives Introduction', 'Understanding complex financial instruments', 'expert', 1, 100, '[
  {
    "question": "What is a derivative?",
    "options": ["A type of savings account", "A financial instrument whose value derives from an underlying asset", "A math equation", "A bank loan"],
    "correctAnswer": 1
  },
  {
    "question": "Which is NOT a common type of derivative?",
    "options": ["Options", "Futures", "Swaps", "Savings bonds"],
    "correctAnswer": 3
  }
]'),

('behavioral_economics_deep', 'budgeting', 'Behavioral Economics Deep Dive', 'Advanced understanding of psychology in financial decisions', 'expert', 1, 100, '[
  {
    "question": "What is prospect theory?",
    "options": ["A theory about finding prospects", "A theory describing decision-making under uncertainty, showing people are loss-averse", "A way to prospect for gold", "A retirement planning theory"],
    "correctAnswer": 1
  },
  {
    "question": "What does anchoring bias affect in financial decisions?",
    "options": ["Nothing significant", "People rely too heavily on the first piece of information encountered", "Only boat purchases", "Investment returns"],
    "correctAnswer": 1
  }
]');
