/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const VIDEO_URL = '/videos/robot_fast.mp4';
const FALLBACK_VIDEO_URL = '/videos/robot_clean.mp4';

// Sleek, authentic aerodynamics chapters with detailed information
const CHAPTERS = [
  {
    id: 1,
    kicker: 'AI-Powered Fluid Dynamics',
    leadIn: 'Simulate the',
    wordLeft: 'FL',
    wordRight: 'OW',
    name: 'FLOW',
    description:
      'Fifty years of computational fluid physics distilled into real-time neural operators. Simulate boundary layers, turbulent kinetic energy, and pressure fields at supersonic speeds.',
    specs: [
      { label: 'Airspeed', value: 'Mach 0.84' },
      { label: 'Reynolds', value: '4.2 × 10⁶' },
      { label: 'Residual', value: '1.4 × 10⁻⁶' },
    ],
  },
  {
    id: 2,
    kicker: 'Digital Wind Tunnel',
    leadIn: 'Governing the',
    wordLeft: 'AE',
    wordRight: 'RO',
    name: 'AERO',
    description:
      'Industrial boundary layers computed instantaneously through Fourier Neural Operators. Eliminate multi-week wind tunnel prototyping with sub-second aerodynamic polar predictions.',
    specs: [
      { label: 'Lift to Drag', value: 'L/D 18.6' },
      { label: 'Pressure', value: '101.3 kPa' },
      { label: 'Grid Mesh', value: '4.8M Cells' },
    ],
  },
  {
    id: 3,
    kicker: 'Solver Engine',
    leadIn: 'Command the',
    wordLeft: 'WI',
    wordRight: 'ND',
    name: 'WIND',
    description:
      'Turbulence closure accelerated by tensor cores. Predict wake vortex detachment, buffet onset, and pressure drag with empirical aerodynamic validation across high angles of attack.',
    specs: [
      { label: 'Vortex Yaw', value: '14.2° Detached' },
      { label: 'Inference', value: '4.2 ms / Polar' },
      { label: 'Turbulence', value: 'k = 0.85 m²/s²' },
    ],
  },
  {
    id: 4,
    kicker: 'Aerodynamic Workflow',
    leadIn: 'Mastering',
    wordLeft: 'CO',
    wordRight: 'RE',
    name: 'CORE',
    description:
      'An end-to-end aerodynamic pipeline: automated surface mesh healing, boundary condition validation, residual convergence tracking, and instant solver export.',
    specs: [
      { label: 'Standard', value: 'FAA FAR-25' },
      { label: 'Solver', value: 'OpenFOAM' },
      { label: 'Pipeline', value: 'HDF5 / VTK' },
    ],
  },
];

export default function App() {
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [characterXOffset, setCharacterXOffset] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);

  // Synchronize video currentTime with user scroll without frame drops
  const syncVideoTime = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration && !Number.isNaN(video.duration)) {
      const diff = targetTimeRef.current - video.currentTime;
      if (Math.abs(diff) > 0.015) {
        const vid = video as HTMLVideoElement & { fastSeek?: (time: number) => void };
        if (typeof vid.fastSeek === 'function') {
          try {
            vid.fastSeek(targetTimeRef.current);
          } catch {
            video.currentTime = targetTimeRef.current;
          }
        } else {
          video.currentTime = targetTimeRef.current;
        }
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const progress = Math.max(0, Math.min(1, currentScrollY / maxScroll));
    setScrollProgress(progress);

    const video = videoRef.current;
    if (video && video.duration && !Number.isNaN(video.duration)) {
      targetTimeRef.current = progress * video.duration;
      syncVideoTime();
    }

    // Natural character sway tracking: follows the character's walking stride
    const sway = Math.sin(progress * Math.PI * 6) * 14;
    setCharacterXOffset(sway);
  }, [syncVideoTime]);

  useEffect(() => {
    let animId: number;

    const onScroll = () => {
      handleScroll();
    };

    const loop = () => {
      syncVideoTime();
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    handleScroll();
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [handleScroll, syncVideoTime]);

  // Virtual index for sequential chapter transitions (0 to 3)
  const virtualIndex = scrollProgress * (CHAPTERS.length - 1);

  return (
    <div className="relative w-full text-white select-none overflow-x-hidden font-body bg-black">
      {/* 
        Full-Screen Background Video
        Synchronized with scroll for real-time character walk
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onError={() => {
          if (videoSrc !== FALLBACK_VIDEO_URL) {
            setVideoSrc(FALLBACK_VIDEO_URL);
          }
        }}
        onLoadedMetadata={() => {
          handleScroll();
        }}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* 
        CHAPTER STAGES:
        Each chapter includes:
        - Top-left lead-in and kicker
        - Monumental split text (2 letters left, 2 letters right)
        - Editorial information paragraph and key technical specs
        
        Motion:
        - When scrolling down: current chapter glides UP and becomes transparent
        - Next chapter rises from DOWN to UP into center view
        - High-end Swiss grotesque typography matching the sci-fi background
      */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
        aria-label="Aerodynamics Chapters"
      >
        {CHAPTERS.map((ch, idx) => {
          const delta = idx - virtualIndex;
          // Render chapters currently in view or entering
          if (Math.abs(delta) > 1.2) return null;

          // Vertical transition: delta < 0 moves UP (-), delta > 0 moves DOWN (+)
          const yShiftPercent = delta * 115;
          // Smooth fade in and out
          const opacity = Math.max(0, Math.min(1, 1 - Math.abs(delta) * 1.6));

          return (
            <div
              key={ch.id}
              className="absolute inset-0 pointer-events-none will-change-transform"
              style={{
                transform: `translateY(${yShiftPercent}%)`,
                opacity,
                transition: 'opacity 0.06s linear',
              }}
            >
              {/* TOP-LEFT LEAD-IN FOR THIS CHAPTER */}
              <div 
                className="absolute top-8 sm:top-12 left-6 sm:left-12 flex flex-col items-start drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
              >
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.22em] text-white/70 mb-1">
                  {ch.kicker}
                </span>
                <span className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-white/95 tracking-wide">
                  {ch.leadIn}
                </span>
              </div>

              {/* MONUMENTAL SPLIT TEXT: 2 LETTERS LEFT, 2 LETTERS RIGHT */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Left Pair: closer to main character */}
                <div 
                  className="absolute top-1/2 flex items-center justify-end select-none will-change-transform"
                  style={{
                    right: `calc(100% - 47.5% - ${characterXOffset}px)`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <span 
                    className="text-[110px] sm:text-[170px] md:text-[230px] lg:text-[290px] xl:text-[350px] font-black tracking-[-0.04em] leading-none text-right inline-block text-white"
                    style={{
                      fontFamily: 'var(--font-heading), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      textShadow: '0 4px 35px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    {ch.wordLeft}
                  </span>
                </div>

                {/* Right Pair: space on right side */}
                <div 
                  className="absolute top-1/2 flex items-center justify-start select-none will-change-transform"
                  style={{
                    left: `calc(67.5% + ${characterXOffset}px)`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <span 
                    className="text-[110px] sm:text-[170px] md:text-[230px] lg:text-[290px] xl:text-[350px] font-black tracking-[-0.04em] leading-none text-left inline-block text-white"
                    style={{
                      fontFamily: 'var(--font-heading), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      textShadow: '0 4px 35px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    {ch.wordRight}
                  </span>
                </div>
              </div>

              {/* CHAPTER EDITORIAL INFORMATION (RISING UP AND EXITING UP AS USER SCROLLS) */}
              <div 
                className="absolute left-6 sm:left-12 bottom-24 sm:bottom-28 max-w-[320px] sm:max-w-md flex flex-col gap-2.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
              >
                <p className="text-xs sm:text-[13.5px] leading-relaxed text-white/90 font-normal">
                  {ch.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono">
                  {ch.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5">
                      <span className="text-white/50 uppercase tracking-wider">{spec.label}:</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 
        BOTTOM-LEFT CORNER: COMPUTER DYNAMIC FLUIDS PLATFORM BASICS
        Permanent transparent indicator anchored at the very bottom-left
      */}
      <div 
        className="fixed bottom-6 left-6 sm:left-12 z-20 max-w-sm pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
        aria-label="Computer Dynamic Fluids Basics"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block">
          Platform Architecture
        </span>
        <span className="text-xs font-semibold text-white/90 tracking-wide">
          Computer Dynamic Fluids (CDF) · Neural Turbulence Engine
        </span>
      </div>

      {/* 
        BOTTOM CREDITS (REVEALED WHEN SCROLLING DOWN TO END):
        Website Admin, Developer, and Contact Email
        Clean transparent typography without background boxes or symbols
      */}
      <div 
        className={`fixed bottom-6 right-6 sm:right-12 z-20 transition-all duration-300 pointer-events-auto ${
          scrollProgress > 0.7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-1 text-right text-xs font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          <div>
            <span className="text-white/50">Website Admin: </span>
            <span className="text-white font-bold tracking-wide">RIM</span>
          </div>
          <div>
            <span className="text-white/50">Website Developer: </span>
            <span className="text-white font-bold tracking-wide">AKHIL</span>
          </div>
          <div>
            <span className="text-white/50">Contact Email: </span>
            <a 
              href="mailto:akkeduc01@gmail.com" 
              className="text-white/90 hover:text-white underline cursor-pointer"
            >
              akkeduc01@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* 
        Scroll Track:
        320vh container driving continuous, lag-free character walk and sequential text scroll
      */}
      <div 
        className="relative w-full h-[320vh] pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
}
