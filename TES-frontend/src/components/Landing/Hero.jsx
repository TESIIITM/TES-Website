import React, { useState, useEffect } from 'react';
import TextType from '../TextType';
import Tilt from 'react-parallax-tilt';


// Moved outside the component so it doesn't re-create on every single render
const logoColors = [
  'var(--color-text-main)', 
  'var(--color-lavender)',
  'var(--color-sapphire)',
  'var(--color-teal)',
  'var(--color-flamingo)'
];

const Hero = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // The timer effect that cycles colors when hovering
  useEffect(() => {
    let intervalId;
    
    if (isHovered) {
      // Change color every 800ms to match the 700ms CSS transition smoothly
      intervalId = setInterval(() => {
        setColorIndex((prevIndex) => (prevIndex + 1) % logoColors.length);
      }, 1000);
    }

    // Cleanup function: stops the timer when you unhover or if the component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovered]);

  return (
    <div className='flex flex-col items-center justify-center'>
      
      {/* Hoverable Logo Wrapper
        Added onMouseEnter and onMouseLeave to trigger the auto-cycle 
      */}
      <div 
        className="relative group mb-6 flex justify-center items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Masking Div: Added transition-all and group-hover:scale-105 for the zoom effect */}
        <div 
          className="w-64 h-24 md:w-80 md:h-32 transition-all duration-700 ease-in-out group-hover:scale-105"
          style={{
            backgroundColor: logoColors[colorIndex],
            WebkitMaskImage: "url('/teslogo-nobg-text-white.png')",
            maskImage: "url('/teslogo-nobg-text-white.png')",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center"
          }}
        />
        
        {/* Dynamic Glow Layer: Also added scale so the glow grows with the logo */}
        <div 
          className="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-700 -z-10 group-hover:scale-105"
          style={{ backgroundColor: logoColors[colorIndex] }}
        ></div>
      </div>

      {/* Typing Text */}
      <div className="text-2xl md:text-3xl my-12 text-[var(--color-text-muted)]">
        <TextType 
          text={["A place where CODERS", "learn and collaborate"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="_"
          deletingSpeed={40}
          variableSpeedEnabled={false}
          variableSpeedMin={60}
          variableSpeedMax={120}
          cursorBlinkDuration={0.5}
        />
      </div>

      <div>
        <h2 className="text-[var(--color-text-main)] text-3xl md:text-4xl font-bold tracking-tight">
          About <span className="text-[var(--color-sapphire)]">The Enigma Society</span>
        </h2>
        <div className="max-w-4xl px-6 text-center my-10">
        <p className="text-[var(--color-text-main)] text-[16] leading-relaxed font-light">
          TES is the official tech hub of <span className="text-[var(--color-flamingo)] font-semibold">ABV-IIITM Gwalior</span> for 
          discussions, guidance, peer learning, projects, and building a strong culture across all domains. 
          Learn from seniors, avoid common mistakes, explore career paths, collaborate on real projects, 
          and grow faster with the right community. Contribute by sharing knowledge, solving doubts, 
          posting resources, or creating content, get recognized and featured on TES platforms. 
          Transparent, no bias, no pressure, TES is built to help you learn better, build stronger, and reach higher.
        </p>
      </div>
      </div>
      
       
      </div>
      
    
  )
}

export default Hero;
