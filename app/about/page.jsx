import { Sparkles } from "lucide-react";

export const metadata = {
  title: 'About - Twino',
  description: 'Learn more about Twino and how it works',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Twino</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the story behind Twino and how we're making AI conversations more engaging.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-blue-500" />
            What is Twino?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Twino is an innovative platform that brings together two AI personalities to engage in meaningful conversations on any topic. 
            Whether you're looking for information, entertainment, or just curious about different perspectives, Twino provides a unique 
            way to explore ideas through AI-powered dialogue.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "1. Choose a Topic",
                description: "Enter any topic you're interested in or curious about."
              },
              {
                title: "2. Watch the Dialogue",
                description: "Two AI personalities will discuss the topic, each bringing their unique perspective."
              },
              {
                title: "3. Learn & Explore",
                description: "Gain insights from the conversation and explore topics in a new way."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At Twino, we believe in the power of conversation to educate, entertain, and inspire. 
            Our mission is to create engaging AI experiences that make learning about any topic 
            more interactive and enjoyable. We're constantly working to improve our technology 
            to provide you with the best possible experience.
          </p>
        </section>
      </div>
    </div>
  );
}
