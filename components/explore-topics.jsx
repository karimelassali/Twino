"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import TextStretching from "./ui/text_stretching";

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
          .from("conversations")
          .select()
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  return (
    <section
      id="topics"
      className="py-12 max-sm:mt-100 overflow-y-auto max-h-[800px] min-h-[700px] md:px-6 mb-30 relative"
    >
      <TextStretching
        text="Explore   Topics!"
        flex={true}
        alpha={false}
        stroke={false}
        width={true}
        weight={true}
        italic={true}
        textColor="#000"
        strokeColor="#ff0000"
        minFontSize={20}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto relative z-10 py-10 gap-6">
        {topics.map((topic, index) => (
          <TopicCard
            key={topic.id}
            title={topic.generated_title || topic.subject || "No Title"}
            description={topic.subject || "No Description"}
            icon={<Sparkles className="h-6 w-6 text-gradientBlueViolet" />}
            onClick={() => handleSelectTopic(topic)}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

const TopicCard = ({ title, description, icon, onClick, index }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer flex flex-col lg:border-r py-10 relative group/feature rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b",
        "border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900"
      )}
    >
      {(index < 4 || index >= 4) && (
        <div className="absolute inset-0 opacity-0 group-hover/feature:opacity-30 transition duration-300 bg-gradient-to-t from-blue-600 to-violet-600 rounded-lg pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-violet-600">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10 text-neutral-900 dark:text-neutral-100">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gradient-to-b from-blue-600 to-violet-600 transition-all duration-300 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-300 inline-block">
          {title}
        </span>
      </div>
      <p className="text-sm max-w-xs relative z-10 px-10 text-neutral-700 dark:text-neutral-300">
        {description}
      </p>
    </div>
  );
};
