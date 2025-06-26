
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi, I'm Link! I'm here to help explain the basics and guide you around until you're ready to meet with the head boss. I can answer general questions, explain key terms, and help you get the most out of Legacy Link—but I don't give financial advice. Let's build your legacy!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Navigation help
    if (input.includes('dashboard') || input.includes('planning')) {
      return "Great question! You can find your financial planning tools in the Planning section. It includes your dashboard with net worth tracking, cash flow analysis, and goal setting. Would you like me to explain any specific feature?";
    }
    
    if (input.includes('learn') || input.includes('education')) {
      return "The Learning section is perfect for building your financial knowledge! It has interactive lessons on budgeting, investing, and more. I recommend starting with the basics if you're new to personal finance.";
    }
    
    if (input.includes('vault') || input.includes('document')) {
      return "The Vault is your secure document storage area where you can keep important financial documents organized and accessible. It's a great way to stay on top of your paperwork!";
    }

    // Financial terms
    if (input.includes('budget') || input.includes('budgeting')) {
      return "Budgeting is planning how to spend your money! It involves tracking your income and expenses to ensure you're living within your means and saving for your goals. Check out our Learning section for detailed budgeting guides!";
    }
    
    if (input.includes('invest') || input.includes('investing')) {
      return "Investing is putting your money to work to potentially grow over time. It's a key part of building long-term wealth. Our Learning section covers investment basics, but remember - I can't give personalized investment advice!";
    }
    
    if (input.includes('emergency fund')) {
      return "An emergency fund is money set aside for unexpected expenses like medical bills or job loss. Most experts recommend 3-6 months of expenses saved up. It's one of the foundational steps in financial planning!";
    }

    // Encouragement and site features
    if (input.includes('quiz') || input.includes('test')) {
      return "Quizzes are a great way to test your financial knowledge! You can find them in our Learning section. They help reinforce what you've learned and identify areas where you might want to study more.";
    }
    
    if (input.includes('goal') || input.includes('goals')) {
      return "Setting financial goals is crucial for success! Whether it's saving for a house, paying off debt, or building retirement savings, having clear goals helps guide your financial decisions. You can track your goals in the Planning section!";
    }

    // Default responses
    const defaultResponses = [
      "That's a great question! While I can help with general financial concepts and site navigation, I'd recommend checking our Learning section for detailed information. Is there a specific area of the site you'd like help with?",
      "I'm here to help you navigate Legacy Link and understand basic financial concepts! For personalized advice, you'll want to connect with a financial advisor. What would you like to explore on the site?",
      "Thanks for asking! I can help explain financial terms, guide you around the site, or suggest resources. What specific topic interests you most?",
      "Great question! I'm designed to help with general guidance and site navigation. Check out our Learning section for comprehensive financial education, or let me know if you need help finding something specific!"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 h-96 shadow-lg z-50 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Link - AI Assistant</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        message.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-3 flex-shrink-0">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Link anything..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40 bg-blue-500 hover:bg-blue-600"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  );
};

export default ChatBot;
