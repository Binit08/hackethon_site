import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle } from "lucide-react"

const faqs = [
  {
    question: "How do I register for the hackathon?",
    answer: "Click on the Register button on the home page and complete the multi-step registration form. You can register as an individual or as a team.",
  },
  {
    question: "Can I participate as a team?",
    answer: "Yes, you can form teams of 2-4 members. The team leader should register first and create a team, then other members can join the team.",
  },
  {
    question: "What is the format of the hackathon?",
    answer: "The hackathon consists of multiple rounds including MCQ (Multiple Choice Questions) and Coding rounds. You need to solve problems in each round to accumulate points.",
  },
  {
    question: "How are submissions evaluated?",
    answer: "Submissions are automatically evaluated against test cases. For MCQ questions, answers are checked immediately. For coding problems, your code is run against hidden and public test cases.",
  },
  {
    question: "Can I see my submissions?",
    answer: "Yes, you can view all your submissions in the 'My Submissions' section of your dashboard. You'll see the status, score, and feedback for each submission.",
  },
  {
    question: "How is the leaderboard calculated?",
    answer: "The leaderboard is based on total points accumulated from all accepted submissions. In case of a tie, the number of accepted submissions is used as a tiebreaker.",
  },
  {
    question: "What programming languages are supported?",
    answer: "Currently, we support JavaScript, Python, Java, and C++. You can select your preferred language in the code editor.",
  },
  {
    question: "How do I get my certificate?",
    answer: "Certificates are automatically generated after the hackathon ends. You can download your certificate from the dashboard.",
  },
  {
    question: "Who can I contact for support?",
    answer: "You can contact us through the Contact page or email us at support@hackathon.nits.ac.in. We typically respond within 24 hours.",
  },
  {
    question: "What happens if I encounter technical issues?",
    answer: "If you encounter any technical issues during the hackathon, please contact our support team immediately. We'll do our best to resolve the issue quickly.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#151c2e] py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-[#6aa5ff]" />
            Frequently Asked Questions
          </h1>
          <p className="text-white/60">Find answers to common questions about the hackathon</p>
        </div>

        <Card className="bg-[#192345] border-[#6aa5ff]/20">
          <CardHeader className="border-b border-[#6aa5ff]/10">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#6aa5ff]" />
              Common Questions
            </CardTitle>
            <CardDescription className="text-white/60">
              Browse through our FAQ to find answers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-[#6aa5ff]/10"
                >
                  <AccordionTrigger className="text-left text-white hover:text-[#6aa5ff] transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/70">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

