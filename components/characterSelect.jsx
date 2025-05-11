'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Sparkles, BookOpen, Brain, Beaker, MessageSquare,
  Users, Lightbulb, Star, Heart, Crown, Glasses, Coffee, Cloud,
  Map, Compass, Gamepad, Music, Palette, Camera
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

// Helper function to get appropriate icon based on personality pair name
function getIconForPersonality(personalityPair) {
  // Map known personalities to specific icons
  const iconMap = {
    "Historian × Student": <BookOpen className="h-4 w-4" />,
    "Philosopher × Skeptic": <Brain className="h-4 w-4" />,
    "Scientist × Curious Kid": <Beaker className="h-4 w-4" />,
    "Debater × Optimist": <MessageSquare className="h-4 w-4" />,
    "Baby x Mom": <Heart className="h-4 w-4" />
  };

  // Random icons for unknown personality pairs
  const randomIcons = [
    <Users className="h-4 w-4" />,
    <Lightbulb className="h-4 w-4" />,
    <Star className="h-4 w-4" />,
    <Crown className="h-4 w-4" />,
    <Glasses className="h-4 w-4" />,
    <Coffee className="h-4 w-4" />,
    <Cloud className="h-4 w-4" />,
    <Map className="h-4 w-4" />,
    <Compass className="h-4 w-4" />,
    <Gamepad className="h-4 w-4" />,
    <Music className="h-4 w-4" />,
    <Palette className="h-4 w-4" />,
    <Camera className="h-4 w-4" />
  ];

  // Return mapped icon if exists, otherwise return a random icon
  return iconMap[personalityPair] || 
    randomIcons[Math.floor(Math.abs(personalityPair.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0)) % randomIcons.length)];
}

// Helper function to get color for personality
function getColorForPersonality(personalityPair) {
  // Map known personalities to specific colors
  const colorMap = {
    "Historian × Student": "from-amber-400 to-orange-500",
    "Philosopher × Skeptic": "from-violet-400 to-purple-500",
    "Scientist × Curious Kid": "from-cyan-400 to-blue-500",
    "Debater × Optimist": "from-emerald-400 to-green-500",
    "Baby x Mom": "from-pink-400 to-rose-500"
  };

  // Random colors for unknown personality pairs
  const randomColors = [
    "from-red-400 to-red-600",
    "from-blue-400 to-indigo-600",
    "from-green-400 to-teal-600",
    "from-yellow-400 to-amber-600",
    "from-indigo-400 to-violet-600",
    "from-rose-400 to-pink-600",
    "from-fuchsia-400 to-purple-600",
    "from-teal-400 to-cyan-600"
  ];

  // Return mapped color if exists, otherwise return a random color
  return colorMap[personalityPair] || 
    randomColors[Math.floor(Math.abs(personalityPair.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0)) % randomColors.length)];
}

// Helper to generate description based on personality pair
function getDescriptionForPersonality(personalityPair) {
  const descriptionMap = {
    "Historian × Student": "Scholarly discussions with historical context",
    "Philosopher × Skeptic": "Deep philosophical debates with critical thinking",
    "Scientist × Curious Kid": "Scientific explanations made simple and fun",
    "Debater × Optimist": "Balanced debates with a positive outlook",
    "Baby x Mom": "Nurturing conversations with childlike wonder"
  };

  // For unknown pairs, create description based on the pair names
  if (!descriptionMap[personalityPair]) {
    const parts = personalityPair.split(/[×x]/);
    if (parts.length >= 2) {
      const role1 = parts[0].trim();
      const role2 = parts[1].trim();
      return `${role1}'s perspective meets ${role2}'s viewpoint`;
    }
    return "Unique conversational dynamic";
  }

  return descriptionMap[personalityPair];
}

export default function CharacterSelect({ selectedCharacter, onCharacterSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('personalities')
          .select();
          
        if (error) {
          console.error('Error fetching characters:', error);
          toast.error('Failed to load characters');
          return;
        }
        
        setCharacters(data);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An error occurred while loading characters');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCharacters();
  }, [supabase]);

  // Convert DB data to character options
  const characterOptions = characters.map(char => ({
    id: char.id,
    value: char.personality_pair,
    icon: getIconForPersonality(char.personality_pair),
    description: getDescriptionForPersonality(char.personality_pair),
    color: getColorForPersonality(char.personality_pair)
  }));

  // Find current selected option
  const currentOption = characterOptions.find(opt => opt.value === selectedCharacter) || 
    (characterOptions.length > 0 ? characterOptions[0] : {
      id: "loading",
      value: selectedCharacter || "Loading...",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Loading character options...",
      color: "from-gray-400 to-gray-500"
    });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full max-w-md mx-auto mt-6 z-50">
      {/* Selected value button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full relative flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm shadow-sm group"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        disabled={isLoading}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${currentOption.color} text-white`}>
            {isLoading ? <Sparkles className="h-4 w-4 animate-pulse" /> : currentOption.icon}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">{currentOption.value}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{currentOption.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary opacity-70" />
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4 opacity-70" />
          </motion.div>
        </div>
        
        {/* Animated underline */}
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full"
          initial={{ width: "0%", left: "50%" }}
          animate={{ 
            width: isOpen ? "100%" : "0%", 
            left: isOpen ? "0%" : "50%"
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Dropdown options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Sparkles className="h-5 w-5 text-primary animate-pulse mr-2" />
                <span>Loading character options...</span>
              </div>
            ) : characterOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No character options available
              </div>
            ) : (
              characterOptions.map((option) => (
                <motion.div
                  key={option.id}
                  onClick={() => {
                    onCharacterSelect(option.value, option.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    option.value === selectedCharacter ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.value}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                  </div>
                  {option.value === selectedCharacter && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}