"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {setCookie} from "cookies-next";
import {createClient} from "@/utils/supabase/client";

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
        user_id: crypto.randomUUID(),
        subject: subject,
        personality_pair_id: '3a696b8c-870e-4c7b-9a78-fde8adec0c15',
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

      {/* قسم اختيار الشخصيات باستخدام Dropdown */}
      
    </div>
  );
}