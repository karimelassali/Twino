'use client'
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const TextHoverEffect = dynamic(() => import("@/components/ui/text-hover-effect"), {
  ssr: false,
});

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 mt-16 overflow-hidden"
    >
      <TextHoverEffect  duration={0.1} text={'Twino'} />
      <div className="container mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-xl font-bold mb-4 flex items-center"
              whileHover={{ scale: 1.03 }}
            >
              Twino 
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 ml-2 text-blue-500 dark:text-sky-400" />
              </motion.div>
            </motion.h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Watch two AI bots chat about any topic. A unique way to explore ideas through dialogue.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">Links</h3>
            <ul className="space-y-3">
              {["Home", "About", "Privacy Policy"].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5 }} transition={{ type: "spring" }}>
                  <Link 
                    href={i === 0 ? "/" : `/${item.toLowerCase().replace(" ", "-")}`} 
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">Connect</h3>
            <ul className="space-y-3">
              {[
                // { name: "Twitter", url: "https://twitter.com/twino" },
                { name: "Instagram", url: "https://instagram.com/twino_officiel" }
              ].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5 }} transition={{ type: "spring" }}>
                  <a 
                    href={item.url} 
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {item.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-8 text-center text-gray-500 dark:text-gray-400"
        >
          © {new Date().getFullYear()} Twino. All rights reserved.
        </motion.div>
      </div>
    </motion.footer>
  );
}
