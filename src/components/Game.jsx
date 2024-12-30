import { Stage } from '@pixi/react';
import FarmScene from './FarmScene';
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
    //    在组件卸载时，return 的清理函数会被调用，即使依赖数组是空的。
  }, []);

  return (
    <div style={{ 
      position: 'absolute', //相对于html元素
      top: 0,           
      left: 0,             
      width: viewport.width, 
      height: viewport.height, 
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
    <Stage

      width={viewport.width}
      height={viewport.height}
      options={{
        backgroundColor: 0x1099bb,
        resolution: 1,
        antialias: false
      }}
    >
      <FarmScene/>
    </Stage>
    </div>
  );
};

export default Game; 