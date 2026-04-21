import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sun } from "lucide-react";
import { motion } from "motion/react";
import Hls from "hls.js";
import LoginModal from "@/src/components/LoginModal";

export default function Frontpage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsVideoReady(true);
    video.addEventListener("canplay", handleCanPlay);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
        video.removeEventListener("canplay", handleCanPlay);
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#000000] text-white flex flex-col font-['Instrument_Sans',sans-serif]">
      {/* Navbar Component */}
      <nav className="fixed top-0 w-full z-50 bg-transparent px-6 py-4 flex items-center justify-center">
        {/* Left Section */}
        <div className="absolute left-6 flex items-center text-white">
          {/* Sunburst icon (24x24px SVG) */}
          <Sun className="w-6 h-6" />
        </div>

        {/* Center Section */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#transparency" className="hover:text-white transition-colors">Laporan Keuangan</a>
          <Link to="/submission" className="hover:text-white transition-colors">Pendataan Anggota</Link>
          <Link to="/peminjaman" className="hover:text-white transition-colors">Peminjaman Barang</Link>
          <a href="https://www.instagram.com/hmi.tmkp.unud" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Tentang Organisasi</a>
          <a href="mailto:hmikomisariattmkp47@gmail.com" className="hover:text-white transition-colors">Kontak</a>
        </div>
      </nav>

      {/* Hero Section Component */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden min-h-screen">
        {/* Background Video Layer — fades in only after video is ready to avoid flash */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{
            filter: 'hue-rotate(-130deg) saturate(1.2)',
            opacity: isVideoReady ? 0.6 : 0,
          }}
        />

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        {/* Decorative Gradients (Green instead of blue) */}
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-green-700/30 blur-[120px] mix-blend-screen rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-emerald-700/30 blur-[120px] mix-blend-screen rounded-full pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center mt-20 space-y-12 px-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pre-headline */}
            <p className="font-['Instrument_Serif',serif] text-3xl sm:text-5xl lg:text-[48px] leading-[1.1] text-white italic">
              HMI TMKP Internal System
            </p>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="font-semibold text-5xl sm:text-7xl lg:text-[100px] xl:text-[120px] leading-[0.9] tracking-tighter bg-gradient-to-b from-white via-white to-[#b4ffc0] bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Administrasi Terpusat
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg sm:text-[20px] leading-[1.65] text-white opacity-70 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Sistem administrasi resmi HMI TMKP untuk manajemen data anggota, verifikasi terpusat, dan pelaporan.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Primary Button */}
            <Link to="/submission" className="flex items-center bg-white rounded-full pl-6 pr-2 py-2 group hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
              <span className="font-medium text-lg text-[#0a0400] mr-4">Mulai Pendataan</span>
              <div className="w-[40px] h-[40px] rounded-full bg-[#22c55e] group-hover:bg-[#16a34a] flex items-center justify-center transition-colors duration-300">
                <ArrowRight className="text-white w-5 h-5" />
              </div>
            </Link>

            {/* Secondary Button */}
            <button onClick={() => setIsLoginModalOpen(true)} className="group flex items-center text-white/70 hover:text-white backdrop-blur-sm hover:bg-white/5 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer">
              <span className="mr-2">Masuk Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </motion.div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
