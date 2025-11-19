import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 py-8 pt-24 relative">
      <BackgroundBeams />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.4)" />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-8 text-center">
          <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <TextGenerateEffect 
            words="Frequently Asked Questions"
            className="text-4xl font-bold text-gray-900 mb-2"
          />
          <p className="text-gray-600">Find answers to common questions about the hackathon</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Common Questions
            </CardTitle>
            <CardDescription className="text-gray-600">
              Browse through our FAQ to find answers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-blue-100"
                >
                  <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
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

