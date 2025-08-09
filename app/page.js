import HeroSectionDemo1 from "@/components/hero-section-demo-1";
import MainInputArea from "@/components/main-input-area";
import ExploreTopics from "@/components/explore-topics";
import { CompareDemo } from "@/components/compare-products";
import Footer from "@/components/footer";
import QandA from "@/components/qanda";
import { Camera } from "lucide-react";

const NewFeatureBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base">
        <Camera className="w-4 h-4 md:w-5 md:h-5" />
        <span className="font-medium">
          <strong>New Feature:</strong> Now bots can talk with images too - Experience visual AI conversations
        </span>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <NewFeatureBanner />
      <HeroSectionDemo1 />
      <ExploreTopics />
      <CompareDemo />
      <QandA />
      <Footer />
    </>
  );
}   