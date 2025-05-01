import Image from "next/image";
export default function Navbar() {
  return (
    <div className="w-full flex justify-between items-center px-6 py-3 fixed top-0 bg-white shadow-sm border-b">
    {/* Logo and Branding */}
    <a href="/" className="flex items-center gap-3">
      <Image
        src="/twino.png"
        alt="Twino Logo"
        width={48}
        height={48}
        className="rounded-full"
      />
      <span className="text-xl font-semibold text-gray-800 hidden sm:inline">Twino</span>
    </a>
  
    {/* Navigation Buttons */}
    <div className="flex gap-2 items-center">
      <button
        className="px-4 py-2 rounded border border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition"
        aria-label="Login"
      >
        Login
      </button>
      <button
        className="px-4 py-2 rounded border border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition"
        aria-label="Sign Up"
      >
        Sign Up
      </button>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        aria-label="Start free trial"
      >
        Start free trial
      </button>
    </div>
  </div>
  
  );
}