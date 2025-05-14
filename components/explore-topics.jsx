"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ExploreTopics() {
  const router = useRouter();
  const supabase = createClient();
  const [topics, setTopics] = useState([]);

  const handleSelectTopic = (topic) => {
    router.push(`/?topic=${encodeURIComponent(topic.title)}`);
  };


  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select()
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) throw error;
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  return (
    <section id='topics' className="py-12 max-sm:mt-100 px-4 md:px-6 relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto pt-20 md:pt-50 max-w-6xl"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12">
          Explore Popular Topics
        </h2>
        <div className="w-full overflow-hidden">
          <HoverEffect 
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            items={topics.map(topic => ({ 
              title: topic.generated_title || topic.subject, 
              description: topic.subject, 
              icon: <Sparkles className="h-4 w-4 text-neutral-100" />, 
              link: `/chat/${topic.id}` 
            }))} 
            onItemClick={handleSelectTopic} 
          />
        </div>
      </motion.div>
    </section>
  );
}
