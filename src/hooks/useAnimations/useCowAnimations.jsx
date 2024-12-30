import { useMemo } from 'react';
import { Texture, Rectangle } from 'pixi.js';
import cowSheet from '../../assets/cow.png';
import * as PIXI from 'pixi.js';

const COW_CONFIG = {
  frameWidth: 32,
  frameHeight: 32,
  animations: {
    idle: {
      frames: [0, 1, 2],      // 第一行3帧
      speed: 0.1
    },
    move: {
      frames: [3, 4],         // 第二行2帧
      speed: 0.15
    }
  }
};

export const useCowAnimations = () => {
  return useMemo(() => {
    const baseTexture = PIXI.Texture.from(cowSheet);
    baseTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    const animations = {};

    // 获取帧的位置
    const getFramePosition = (frameIndex) => {
      if (frameIndex < 3) {
        // 第一行的帧（3帧）
        return {
          x: frameIndex * COW_CONFIG.frameWidth,
          y: 0
        };
      } else {
        // 第二行的帧（2帧）
        return {
          x: (frameIndex - 3) * COW_CONFIG.frameWidth,
          y: COW_CONFIG.frameHeight
        };
      }
    };

    Object.entries(COW_CONFIG.animations).forEach(([name, config]) => {
      animations[name] = config.frames.map(frameIndex => {
        const pos = getFramePosition(frameIndex);
        return new Texture(
          baseTexture,
          new Rectangle(
            pos.x,
            pos.y,
            COW_CONFIG.frameWidth,
            COW_CONFIG.frameHeight
          )
        );
      });
    });

    return animations;
  }, []);
}; 