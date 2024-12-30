import { useMemo } from 'react';
import { Texture, Rectangle, SCALE_MODES } from 'pixi.js';
import chickenSheet from '../../assets/chicken.png';
import * as PIXI from 'pixi.js';

const CHICKEN_CONFIG = {
  frameWidth: 16,
  frameHeight: 16,
  animations: {
    idle: {
      frames: [0, 1],      // 第一行的两帧
      speed: 0.1
    },
    move: {
      frames: [2, 3, 4, 5], // 第二行的四帧
      speed: 0.15
    }
  }
};

export const useChickenAnimations = () => {
  return useMemo(() => {
    const baseTexture = PIXI.Texture.from(chickenSheet);
    baseTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    const animations = {};

    // 获取帧的位置
    const getFramePosition = (frameIndex) => {
      if (frameIndex < 2) {
        // 第一行的帧
        return {
          x: frameIndex * CHICKEN_CONFIG.frameWidth,
          y: 0
        };
      } else {
        // 第二行的帧
        return {
          x: (frameIndex - 2) * CHICKEN_CONFIG.frameWidth,
          y: CHICKEN_CONFIG.frameHeight
        };
      }
    };

    Object.entries(CHICKEN_CONFIG.animations).forEach(([name, config]) => {
      animations[name] = config.frames.map(frameIndex => {
        const pos = getFramePosition(frameIndex);
        return new Texture(
          baseTexture,
          new Rectangle(
            pos.x,
            pos.y,
            CHICKEN_CONFIG.frameWidth,
            CHICKEN_CONFIG.frameHeight
          )
        );
      });
    });

    return animations;
  }, []);
};