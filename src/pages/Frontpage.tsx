import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sun } from "lucide-react";
import { motion } from "motion/react";
import LoginModal from "@/src/components/LoginModal";
import { AuroraBackground } from "@/src/components/reactbits/AuroraBackground";
import { SplitText } from "@/src/components/reactbits/SplitText";
import { ShinyText } from "@/src/components/reactbits/ShinyText";

export default function Frontpage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen text-white flex flex-col font-['Instrument_Sans',sans-serif]">
      {/* Navbar Component */}
      <nav className="fixed top-0 w-full z-50 bg-transparent px-6 py-4 flex items-center justify-center backdrop-blur-sm border-b border-white/5">
        {/* Left Section */}
        <div className="absolute left-6 flex items-center text-white">
          <Sun className="w-6 h-6 text-emerald-400" />
        </div>

        {/* Center Section */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#transparency" className="hover:text-emerald-300 transition-colors">Laporan Keuangan</a>
          <Link to="/submission" className="hover:text-emerald-300 transition-colors">Pendataan Anggota</Link>
          <Link to="/peminjaman" className="hover:text-emerald-300 transition-colors">Peminjaman Barang</Link>
          <a href="https://www.instagram.com/hmi.tmkp.unud" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">Tentang Organisasi</a>
          <a href="mailto:hmikomisariattmkp47@gmail.com" className="hover:text-emerald-300 transition-colors">Kontak</a>
        </div>
      </nav>

      {/* Hero Section Component */}
      <AuroraBackground className="flex-1 w-full min-h-screen">
        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center space-y-12 px-4 pt-20">
          
          <div>
            {/* Pre-headline */}
            <ShinyText 
              text="HMI TMKP Internal System" 
              className="font-['Instrument_Serif',serif] text-3xl sm:text-5xl lg:text-[48px] leading-[1.1] italic mb-6"
              speed={4}
            />
          </div>

          {/* Main Headline */}
          <div className="font-semibold text-5xl sm:text-7xl lg:text-[100px] xl:text-[120px] leading-[0.9] tracking-tighter bg-gradient-to-b from-white via-white to-[#b4ffc0] bg-clip-text text-transparent pb-4">
            <SplitText 
              text="Administrasi Terpusat" 
              delay={40}
            />
          </div>

          {/* Subheadline */}
          <motion.p
            className="text-lg sm:text-[20px] leading-[1.65] text-white/70 max-w-xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Sistem administrasi resmi HMI TMKP untuk manajemen data anggota, verifikasi terpusat, dan pelaporan.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 items-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {/* Primary Button */}
            <Link to="/submission" className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-6 pr-2 py-2 group hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <span className="font-medium text-lg text-white mr-4">Mulai Pendataan</span>
              <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-r from-emerald-500 to-green-500 group-hover:from-emerald-400 group-hover:to-green-400 flex items-center justify-center transition-colors duration-300 shadow-inner">
                <ArrowRight className="text-white w-5 h-5" />
              </div>
            </Link>

            {/* Secondary Button */}
            <button onClick={() => setIsLoginModalOpen(true)} className="group flex items-center text-emerald-200/70 hover:text-emerald-200 backdrop-blur-sm hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/20 px-6 py-3 rounded-full transition-all duration-300 cursor-pointer">
              <span className="mr-2 font-medium">Masuk Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </motion.div>
        </div>
      </AuroraBackground>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
