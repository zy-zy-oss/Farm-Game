import { Stage } from '@pixi/react';
import FarmScene from './FarmScene';
import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../constants/gameConfig';
import { useState, useEffect } from 'react';

const Game = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });



  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Stage 
      width={viewport.width} 
      height={viewport.height} 
      options={{ 
        backgroundColor: 0x1099bb,
        resolution: 1,
        antialias: false
      }}
    >
      <FarmScene 

      />
    </Stage>
  );
};

export default Game; 