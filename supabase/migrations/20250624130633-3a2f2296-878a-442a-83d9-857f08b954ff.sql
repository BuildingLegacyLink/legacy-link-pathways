
-- Expand learning_progress table and add new tables for the topic/module structure
ALTER TABLE public.learning_progress 
ADD COLUMN topic_id TEXT,
ADD COLUMN level TEXT DEFAULT 'beginner',
ADD COLUMN total_xp INTEGER DEFAULT 0,
ADD COLUMN attempts INTEGER DEFAULT 0;

-- Create topics table
CREATE TABLE public.topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Create modules table
CREATE TABLE public.modules (
  id TEXT PRIMARY KEY,
  topic_id TEXT REFERENCES public.topics(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  xp_value INTEGER DEFAULT 25,
  questions JSONB NOT NULL DEFAULT '[]'
);

-- Create test_out_progress table for tracking test-out attempts
CREATE TABLE public.test_out_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic_id TEXT REFERENCES public.topics(id) NOT NULL,
  level TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id, level)
);

-- Enable RLS on new tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_out_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for topics (public read access)
CREATE POLICY "Anyone can view topics" 
  ON public.topics FOR SELECT 
  TO public
  USING (true);

-- Create policies for modules (public read access)
CREATE POLICY "Anyone can view modules" 
  ON public.modules FOR SELECT 
  TO public
  USING (true);

-- Create policies for test_out_progress
CREATE POLICY "Users can view their own test out progress" 
  ON public.test_out_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test out progress" 
  ON public.test_out_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test out progress" 
  ON public.test_out_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert sample topics
INSERT INTO public.topics (id, name, description, icon, sort_order) VALUES
('budgeting', 'Budgeting & Cash Flow', 'Master the fundamentals of tracking income and expenses', '💰', 1),
('saving', 'Saving & Emergency Funds', 'Build a solid financial foundation with smart saving strategies', '🏦', 2),
('debt', 'Debt & Credit Management', 'Understand and optimize your debt and credit profile', '💳', 3),
('insurance', 'Insurance & Risk Management', 'Protect yourself and your assets from unexpected events', '🛡️', 4),
('investing', 'Investment Planning', 'Grow your wealth through strategic investment approaches', '📈', 5),
('retirement', 'Retirement Planning', 'Secure your financial future with retirement strategies', '🏖️', 6),
('taxes', 'Tax Planning', 'Optimize your tax situation legally and effectively', '📋', 7),
('realestate', 'Real Estate & Mortgages', 'Navigate property ownership and mortgage decisions', '🏠', 8),
('estate', 'Estate Planning', 'Protect and transfer your wealth to future generations', '🎭', 9),
('fire', 'Financial Independence (FIRE)', 'Achieve financial freedom and early retirement', '🔥', 10);

-- Insert sample modules for beginner level
INSERT INTO public.modules (id, topic_id, name, description, level, sort_order, xp_value, questions) VALUES
('budgeting_basics', 'budgeting', 'Budgeting Basics', 'Learn to track your money in and out', 'beginner', 1, 25, '[
  {
    "question": "What is the first step in creating a budget?",
    "options": ["Track your expenses", "Set financial goals", "Open a savings account", "Pay off debt"],
    "correctAnswer": 0
  },
  {
    "question": "What percentage of income should ideally go to needs?",
    "options": ["30%", "50%", "70%", "90%"],
    "correctAnswer": 1
  }
]'),
('saving_emergency', 'saving', 'Emergency Fund Basics', 'Build your first emergency fund', 'beginner', 1, 25, '[
  {
    "question": "How many months of expenses should an emergency fund cover?",
    "options": ["1-2 months", "3-6 months", "12 months", "24 months"],
    "correctAnswer": 1
  },
  {
    "question": "Where should you keep your emergency fund?",
    "options": ["Stock market", "High-yield savings account", "Under your mattress", "Cryptocurrency"],
    "correctAnswer": 1
  }
]'),
('estate_wills', 'estate', 'Wills and Basic Documents', 'Understanding essential estate planning documents', 'beginner', 1, 25, '[
  {
    "question": "What is a will?",
    "options": ["A tax document", "A legal document that specifies how assets are distributed after death", "An insurance policy", "A retirement account"],
    "correctAnswer": 1
  },
  {
    "question": "At what age should you consider creating a will?",
    "options": ["Only after 65", "Only after having children", "As soon as you have any assets", "Never"],
    "correctAnswer": 2
  }
]'),
('estate_trusts', 'estate', 'Introduction to Trusts', 'Basic understanding of trust structures', 'intermediate', 1, 50, '[
  {
    "question": "What is a trust?",
    "options": ["A type of bank account", "A legal arrangement where assets are held by a trustee for beneficiaries", "A form of insurance", "A retirement plan"],
    "correctAnswer": 1
  }
]'),
('estate_powers', 'estate', 'Powers of Attorney', 'Understanding different types of power of attorney', 'intermediate', 2, 50, '[
  {
    "question": "What does a financial power of attorney allow?",
    "options": ["Someone to make medical decisions", "Someone to manage your finances if you become incapacitated", "Someone to inherit your assets", "Someone to file your taxes"],
    "correctAnswer": 1
  }
]');
