"use client";

import { useState, useEffect } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import CharacterSelect from "@/components/characterSelect"; // Update the path if needed

export default function MainInputArea() {
  const supabase = createClient();
  const router = useRouter();
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
    "Explain quantum computing to a 5-year-old",
    "What are the ethical implications of AI?",
    "Debate: Is cereal a soup?",
  ];

  const [userData, setUserData] = useState(null);
  const { isLoaded, isSignedIn, user } = useUser();
  
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    setUserData(user);
  }, [isLoaded, isSignedIn]);

  // State for subject and selected characters
  const [subject, setSubject] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState("Historian × Student");
  const [selectedCharacterId, setSelectedCharacterId] = useState("3510d5f8-e897-4bb4-89b8-d8e79859110e"); // Default ID for Historian × Student

  // Handle subject change
  const handleChange = (e) => {
    setSubject(e.target.value);
  };

  // Handle character selection
  const handleCharacterSelect = (value, id) => {
    console.log("Selected character:", value, id);
    setSelectedCharacters(value);
    setSelectedCharacterId(id);
    
    // Add subtle animation or feedback when character is changed
    toast.success(`Character pair changed to ${value}`, {
      duration: 1500,
      position: 'bottom-center',
      icon: '✨',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitted - Subject:", subject, "Characters:", selectedCharacters, "Character ID:", selectedCharacterId);
    
    if (!subject.trim()) {
      toast.error("Please enter a subject for your conversation");
      return;
    }
    
    if (!userData) {
      toast.error("You must be signed in to create a conversation");
      return;
    }
    
    try {
      setCookie("subject", subject);
      
      // Add a loading toast
      const loadingToast = toast.loading("Creating your conversation...");
      
      const { data, error } = await supabase.from('conversations').insert({
        user_id: userData.id,
        subject: subject,
        personality_pair_id: selectedCharacterId, // Now using the actual selected ID
      })
      .single()
      .select();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (error) throw error;
      
      console.log("Conversation created:", data);
      toast.success("Conversation created successfully!");
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to create conversation: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Input area with floating placeholders */}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
        
        {/* Character selection dropdown */}
        <CharacterSelect 
        
          selectedCharacter={selectedCharacters}
          onCharacterSelect={handleCharacterSelect}
        />
        
        {/* Display user info for debugging */}
        {/* {userData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            className="text-xs mt-4 bg-gray-100 dark:bg-gray-800 p-2 rounded text-center"
          >
          </motion.div>
        )} */}
        
      </motion.div>
    </div>
  );
}