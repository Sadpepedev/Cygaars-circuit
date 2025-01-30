import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { Penguin, Rug } from '../types';
import { supabase } from '../lib/supabase';

// Adjusted physics constants for better gameplay feel
const GRAVITY = 0.25; // Reduced from 0.35
const FLAP_STRENGTH = -8;
const PENGUIN_WIDTH = 50;
const PENGUIN_HEIGHT = 50;
const RUG_WIDTH = 80;
const RUG_GAP = 250;
const RUG_SPEED = 2.5;
const IMMUNITY_DURATION = 1500; // 1.5 seconds immunity

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const { isPlaying, gameOver, score, playerName, setScore, setGameOver } = useGameStore();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isImmune, setIsImmune] = useState(false);
  const penguinImgRef = useRef<HTMLImageElement>(new Image());
  
  // Initialize penguin position in the middle
  const penguinRef = useRef<Penguin>({
    y: 300, // Middle of 600px height canvas
    velocity: 0,
    rotation: 0,
  });
  
  const rugsRef = useRef<Rug[]>([]);
  const scoreRef = useRef(0);

  // Reset game state when starting
  useEffect(() => {
    if (isPlaying && canvasRef.current) {
      // Reset penguin to center position
      penguinRef.current = {
        y: canvasRef.current.height / 2,
        velocity: 0,
        rotation: 0,
      };
      rugsRef.current = [];
      scoreRef.current = 0;
      setScore(0);
      setIsImmune(true);
      
      // Set immunity period
      const immunityTimer = setTimeout(() => {
        setIsImmune(false);
      }, IMMUNITY_DURATION);
      
      const canvas = canvasRef.current;
      if (canvas && contextRef.current) {
        contextRef.current.fillStyle = '#87CEEB';
        contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
      }

      return () => {
        clearTimeout(immunityTimer);
      };
    }
  }, [isPlaying, setScore]);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.style.backgroundColor = '#87CEEB';
    contextRef.current = canvas.getContext('2d');
    
    if (contextRef.current) {
      contextRef.current.fillStyle = '#87CEEB';
      contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set initial penguin position to canvas center
      penguinRef.current.y = canvas.height / 2;
    }
  }, []);

  // Load penguin image
  useEffect(() => {
    let mounted = true;

    const onImageLoad = () => {
      if (mounted) {
        setImagesLoaded(true);
        
        // Initial render of the penguin
        if (contextRef.current && penguinImgRef.current) {
          const ctx = contextRef.current;
          ctx.save();
          ctx.translate(100 + PENGUIN_WIDTH / 2, penguinRef.current.y + PENGUIN_HEIGHT / 2);
          ctx.drawImage(
            penguinImgRef.current,
            -PENGUIN_WIDTH / 2,
            -PENGUIN_HEIGHT / 2,
            PENGUIN_WIDTH,
            PENGUIN_HEIGHT
          );
          ctx.restore();
        }
      }
    };

    const onImageError = () => {
      console.log('Using fallback penguin drawing');
      setImagesLoaded(true);
    };

    penguinImgRef.current = new Image();
    penguinImgRef.current.crossOrigin = "anonymous";
    penguinImgRef.current.onload = onImageLoad;
    penguinImgRef.current.onerror = onImageError;
    penguinImgRef.current.src = 'https://raw.githubusercontent.com/Sadpepedev/Cygaarverse-live/main/0682a8ef-dd5b-4eff-a538-028436b3e3a5_rEKKc4YC-400x400.png';

    return () => {
      mounted = false;
      if (penguinImgRef.current) {
        penguinImgRef.current.onload = null;
        penguinImgRef.current.onerror = null;
      }
    };
  }, []);

  const handleGameOver = useCallback(async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setGameOver(true);
    
    if (playerName && scoreRef.current > 0) {
      try {
        await supabase
          .from('leaderboard')
          .insert([{ 
            player_name: playerName, 
            score: scoreRef.current 
          }]);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  }, [playerName, setGameOver]);

  // Game loop
  useEffect(() => {
    if (!imagesLoaded || !isPlaying || gameOver || !contextRef.current) {
      return;
    }

    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let lastScoreUpdate = 0;
    
    const gameLoop = () => {
      if (!isPlaying || gameOver) return;
      
      // Update penguin with smoother physics
      penguinRef.current = {
        ...penguinRef.current,
        y: penguinRef.current.y + penguinRef.current.velocity,
        velocity: penguinRef.current.velocity + GRAVITY,
        // Adjusted rotation for smoother animation
        rotation: Math.min(Math.max(-15, penguinRef.current.velocity * 1.5), 70),
      };
      
      // Update rugs
      const newRugs = rugsRef.current.map(rug => ({
        ...rug,
        x: rug.x - RUG_SPEED,
      }));
      
      const filteredRugs = newRugs.filter(rug => rug.x > -RUG_WIDTH);
      
      if (filteredRugs.length === 0 || filteredRugs[filteredRugs.length - 1].x < canvas.width - 300) {
        const topHeight = Math.random() * (canvas.height - RUG_GAP - 100) + 50;
        filteredRugs.push({
          x: canvas.width,
          topHeight,
          passed: false,
        });
      }
      
      rugsRef.current = filteredRugs;
      
      // Check collisions (only if not immune)
      if (!isImmune) {
        const penguinBox = {
          x: 100,
          y: penguinRef.current.y,
          width: PENGUIN_WIDTH,
          height: PENGUIN_HEIGHT,
        };
        
        for (const rug of rugsRef.current) {
          const topRugBox = {
            x: rug.x,
            y: 0,
            width: RUG_WIDTH,
            height: rug.topHeight,
          };
          
          const bottomRugBox = {
            x: rug.x,
            y: rug.topHeight + RUG_GAP,
            width: RUG_WIDTH,
            height: canvas.height - (rug.topHeight + RUG_GAP),
          };
          
          if (checkCollision(penguinBox, topRugBox) || 
              checkCollision(penguinBox, bottomRugBox) ||
              penguinRef.current.y < 0 ||
              penguinRef.current.y > canvas.height) {
            handleGameOver();
            return;
          }
        }
      }
      
      // Score points
      rugsRef.current.forEach(rug => {
        if (!rug.passed && rug.x < 100 - PENGUIN_WIDTH) {
          scoreRef.current += 1;
          rug.passed = true;
          
          // Update displayed score less frequently
          const now = Date.now();
          if (now - lastScoreUpdate > 100) { // Update display every 100ms
            setScore(scoreRef.current);
            lastScoreUpdate = now;
          }
        }
      });
      
      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F4FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw rugs
      rugsRef.current.forEach(rug => {
        ctx.save();
        
        // Create rug gradient
        const rugGradient = ctx.createLinearGradient(rug.x, 0, rug.x + RUG_WIDTH, 0);
        rugGradient.addColorStop(0, '#8B4513');
        rugGradient.addColorStop(0.5, '#A0522D');
        rugGradient.addColorStop(1, '#8B4513');
        
        ctx.fillStyle = rugGradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        
        // Draw top rug
        ctx.fillRect(rug.x, 0, RUG_WIDTH, rug.topHeight);
        
        // Draw bottom rug
        ctx.fillRect(
          rug.x,
          rug.topHeight + RUG_GAP,
          RUG_WIDTH,
          canvas.height - (rug.topHeight + RUG_GAP)
        );
        
        // Add decorative patterns
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 4;
        
        // Top rug pattern
        for (let i = 0; i < rug.topHeight; i += 20) {
          ctx.beginPath();
          ctx.moveTo(rug.x, i);
          ctx.lineTo(rug.x + RUG_WIDTH, i);
          ctx.stroke();
        }
        
        // Bottom rug pattern
        for (let i = rug.topHeight + RUG_GAP; i < canvas.height; i += 20) {
          ctx.beginPath();
          ctx.moveTo(rug.x, i);
          ctx.lineTo(rug.x + RUG_WIDTH, i);
          ctx.stroke();
        }
        
        ctx.restore();
      });
      
      // Draw penguin with immunity effect
      ctx.save();
      ctx.translate(100 + PENGUIN_WIDTH / 2, penguinRef.current.y + PENGUIN_HEIGHT / 2);
      ctx.rotate((penguinRef.current.rotation * Math.PI) / 180);
      
      if (isImmune) {
        ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.2; // Pulsing effect during immunity
      }
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      
      if (penguinImgRef.current.naturalWidth === 0) {
        // Fallback penguin drawing
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 0, PENGUIN_WIDTH/2, PENGUIN_HEIGHT/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 5, PENGUIN_WIDTH/3, PENGUIN_HEIGHT/3, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.drawImage(
          penguinImgRef.current,
          -PENGUIN_WIDTH / 2,
          -PENGUIN_HEIGHT / 2,
          PENGUIN_WIDTH,
          PENGUIN_HEIGHT
        );
      }
      
      ctx.restore();
      
      // Draw score
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 4;
      ctx.font = 'bold 48px Arial';
      const scoreText = scoreRef.current.toString();
      const scoreWidth = ctx.measureText(scoreText).width;
      ctx.strokeText(scoreText, canvas.width / 2 - scoreWidth / 2, 50);
      ctx.fillText(scoreText, canvas.width / 2 - scoreWidth / 2, 50);
      ctx.restore();
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isPlaying, gameOver, imagesLoaded, handleGameOver, isImmune, setScore]);
  
  const handleClick = () => {
    if (gameOver) return;
    
    penguinRef.current = {
      ...penguinRef.current,
      velocity: FLAP_STRENGTH,
    };
  };
  
  const checkCollision = (box1: any, box2: any) => {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  };
  
  return (
    <div className="relative bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleClick}
        className="w-full h-auto"
        tabIndex={0}
      />
    </div>
  );
}