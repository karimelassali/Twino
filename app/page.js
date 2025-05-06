import Image from "next/image";
import Navbar from "@/components/navbar";
import HeroSectionDemo1 from "@/components/hero-section-demo-1";
import MainInputArea from "@/components/main-input-area";
import ExploreTopics from "@/components/explore-topics";
import Footer from "@/components/footer";
import { CompareDemo } from "@/components/compare-products";

export default function Home() {
  
  return (
    <div className="h-full">
      <Navbar />
      <HeroSectionDemo1 />
      <ExploreTopics />
      <CompareDemo />
      <Footer />
    </div>
  );
}
