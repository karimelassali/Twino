"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {setCookie} from "cookies-next";
import {createClient} from "@/utils/supabase/client";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";


export default function MainInputArea() {
  const supabase = createClient();
  const router = useRouter();
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const [userData, setUserData] = useState(null);
  const { isLoaded, isSignedIn, user } = useUser();
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    setUserData(user);
  }, [isLoaded, isSignedIn]);

  // حالة لتخزين الموضوع والشخصيات المختارة
  const [subject, setSubject] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState("Historian × Student");

  // خيارات الشخصيات
  const characterOptions = [
    "Historian × Student",
    "Philosopher × Skeptic",
    "Scientist × Curious Kid",
    "Debater × Optimist",
  ];

  // التعامل مع تغيير الموضوع
  const handleChange = (e) => {
    setSubject(e.target.value);

  };

  // التعامل مع اختيار الشخصيات
  const handleCharacterSelect = (e) => {
    setSelectedCharacters(e.target.value);
  };

  // التعامل مع الإرسال
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitted - Subject:", subject, "Characters:", selectedCharacters);
    try {
      setCookie("subject", subject);
      const { data, error } = await supabase.from('conversations').insert({
        user_id: userData.id,
        subject: subject,
        personality_pair_id: '973783bb-8e80-401a-aa19-81f7a8cd0776',
      })
      .single()
      .select();
      if (error) throw error;
      console.log("Conversation created:", data);
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
      {userData && <div className="text-xs mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
        <code>User ID: {userData.id}</code>
      </div>}
      {/* قسم اختيار الشخصيات باستخدام Dropdown */}
      
      
    </div>
  );
}