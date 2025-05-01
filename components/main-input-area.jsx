"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function MainInputArea() {
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
  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted - Subject:", subject, "Characters:", selectedCharacters);
    router.push(`/chat/${crypto.randomUUID()}`);
  };

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />

      {/* قسم اختيار الشخصيات باستخدام Dropdown */}
      <div className="mt-4 w-full max-w-md">
        <label className="flex items-center gap-2 text-darkGray dark:text-lightGray mb-2">
          <FaUser className="text-sky" />
          Choose Bot Personalities:
        </label>
        <select
          value={selectedCharacters}
          onChange={handleCharacterSelect}
          className="w-full p-3 rounded-lg border border-darkGray focus:outline-none focus:ring-2 focus:ring-sky text-navy dark:bg-gray-800 dark:text-lightGray dark:border-gray-600"
        >
          {characterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}