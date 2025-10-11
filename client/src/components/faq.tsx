
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the on-screen instructions to reset your password.",
  },
  {
    question: "How can I track the status of my document request?",
    answer: "You can track the status of your document request by logging into your account and navigating to the 'My Requests' page. The status of each request will be displayed there.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept various payment methods, including credit/debit cards and online payment platforms. For a detailed list, please visit the payment section during the checkout process.",
  },
  {
    question: "How long does it take to process a document request?",
    answer: "The processing time for document requests can vary depending on the type of document and the time of year. You can see the estimated processing time when you submit your request.",
  },
  {
    question: "Can I cancel a document request?",
    answer: "You can cancel a document request before it has been processed. To cancel a request, please go to the 'My Requests' page and select the request you wish to cancel.",
  },
];

export function Faq() {
  return (
    <Card className="w-full max-w-4xl mx-auto mt-12 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-blue-900">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-blue-800 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-blue-700/90">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
