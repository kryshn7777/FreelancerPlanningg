import { useEffect, useRef } from 'react';
import { Engine } from '../three/Engine';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // 1. Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // 2. Initialize Three.js Engine
    const engine = new Engine(canvasRef.current);

    // Proxy object for GSAP to animate
    const scrollProxy = {
      zOffset: 0,
      hyperloopSpeed: 0,
      sceneRotationY: 0
    };

    // 3. Orchestrate 10-Chapter Cinematic Flight Path
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0, // Smooth scrubbing
      },
      onUpdate: () => {
        // Apply proxy values to engine
        engine.cameraController.setZOffset(scrollProxy.zOffset);
        engine.stardustRings.setHyperloopSpeed(scrollProxy.hyperloopSpeed);
        engine.sceneManager.scene.rotation.y = scrollProxy.sceneRotationY;
      }
    });

    // Chapter 1: Arrival (Wait briefly)
    masterTl.to({}, { duration: 1 }, 0);
    
    // Chapter 2-4: The Dive (Accelerate into the accretion disk)
    masterTl.to(scrollProxy, { zOffset: -12, ease: 'power2.inOut', duration: 4 }, 1);
    masterTl.to(scrollProxy, { sceneRotationY: -Math.PI / 4, ease: 'power1.inOut', duration: 4 }, 1);
    
    // Chapter 5-7: Hyperloop Engaged (Speed up particles, push right to the event horizon)
    masterTl.to(scrollProxy, { hyperloopSpeed: 1.0, ease: 'power2.in', duration: 1 }, 4);
    masterTl.to(scrollProxy, { zOffset: -16, ease: 'power1.inOut', duration: 3 }, 5);
    masterTl.to(scrollProxy, { sceneRotationY: Math.PI / 2, ease: 'none', duration: 3 }, 5);
    
    // Chapter 8-10: Arrival at the Core
    masterTl.to(scrollProxy, { hyperloopSpeed: 0.0, ease: 'power3.out', duration: 1 }, 8);
    masterTl.to(scrollProxy, { zOffset: -5, ease: 'power3.out', duration: 2 }, 8);
    masterTl.to(scrollProxy, { sceneRotationY: 0, ease: 'power2.out', duration: 2 }, 8);

    return () => {
      lenis.destroy();
      engine.dispose();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 0, 
          pointerEvents: 'none' 
        }} 
      />
      
      <div ref={containerRef} style={{ height: '1000vh', position: 'relative', zIndex: 1 }}>
        {/* We use Astro for the HTML UI overlay to maximize performance and SEO */}
      </div>
    </>
  );
}
