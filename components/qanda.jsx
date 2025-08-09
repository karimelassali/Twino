import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  
  export default function QandA() {
    return (
      <Accordion type="single" collapsible className="max-w-xl mx-auto space-y-4">
        
        <AccordionItem value="item-1">
          <AccordionTrigger>Is this platform really free to use?</AccordionTrigger>
          <AccordionContent>
            Absolutely! Our platform is 100% free with no hidden fees or subscriptions.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-2">
          <AccordionTrigger>Do I need to create an account?</AccordionTrigger>
          <AccordionContent>
            Yes, creating an account helps you save your preferences and access personalized features.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-3">
          <AccordionTrigger>What AI features does the app offer?</AccordionTrigger>
          <AccordionContent>
            Our app features two AI personalities that can chat with each other on any topic you choose, offering unique insights and fun conversations instantly.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-4">
          <AccordionTrigger>Can I suggest new topics for the AI chat?</AccordionTrigger>
          <AccordionContent>
            Definitely! Just type your topic of interest and watch the AI personalities debate it in real-time.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-5">
          <AccordionTrigger>Is my data safe and private?</AccordionTrigger>
          <AccordionContent>
            We take privacy seriously. Your data is securely stored and never shared without your consent.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-6">
          <AccordionTrigger>Can I use this app on my mobile device?</AccordionTrigger>
          <AccordionContent>
            Yes, our app is fully responsive and works smoothly on all smartphones and tablets.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-7">
          <AccordionTrigger>Are there any usage limits?</AccordionTrigger>
          <AccordionContent>
            No limits! Chat and explore as much as you want, anytime.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-8">
          <AccordionTrigger>How can I report bugs or request features?</AccordionTrigger>
          <AccordionContent>
            We welcome your feedback! Use the contact form in the app or send us an email to help improve the platform.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-9">
          <AccordionTrigger>Is the app updated regularly?</AccordionTrigger>
          <AccordionContent>
            Yes, we constantly update the app with new features and improvements based on user feedback.
          </AccordionContent>
        </AccordionItem>
  
        <AccordionItem value="item-10">
          <AccordionTrigger>Who can I contact for support?</AccordionTrigger>
          <AccordionContent>
            You can reach out to our support team anytime via email fifakarim52@gmail.com or the request new feature section inside the app.
          </AccordionContent>
        </AccordionItem>
            
      </Accordion>
    );
  }
  