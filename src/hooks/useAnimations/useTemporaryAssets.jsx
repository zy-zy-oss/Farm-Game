import { useCallback, useMemo } from 'react';
import * as PIXI from 'pixi.js';

// 创建不同形状的纹理
const createShapeTexture = (color, size = 48, shape = 'rectangle') => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    
    switch (shape) {
        case 'triangle':
            // 绘制三角形
            ctx.beginPath();
            ctx.moveTo(size/2, 0);
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'fruitTree':
            // 绘制双色三角形（果树）
            ctx.beginPath();
            ctx.moveTo(size/2, 0);
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
            // 添加红色顶部
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(size/2, 0);
            ctx.lineTo(size*0.7, size*0.4);
            ctx.lineTo(size*0.3, size*0.4);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'circle':
            // 绘制圆形
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'smallCircle':
            // 绘制小圆形
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'trapezoid':
            // 绘制梯形
            ctx.beginPath();
            ctx.moveTo(size*0.2, 0);
            ctx.lineTo(size*0.8, 0);
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
            break;
            
        default:
            // 默认矩形
            ctx.fillRect(0, 0, size, size);
    }
    
    return PIXI.Texture.from(canvas);
};

// 创建临时动画帧
const createShapeAnimationFrames = (color, frameCount = 4, size = 48, shape = 'rectangle') => {
    return Array.from({ length: frameCount }, () => 
        createShapeTexture(color, size, shape)
    );
};

export const useTemporaryAssets = () => {
    // 树木资源 - 绿色三角形
    const getTreeAssets = useCallback((type) => {
        const frames = createShapeAnimationFrames(0x2D5A27, 4, 48, 'triangle');
        return {
            idle: frames,
            shake: frames
        };
    }, []);

    // 果树资源 - 双色三角形
    const getFruitTreeAssets = useCallback((type) => {
        const frames = createShapeAnimationFrames(0x3B7A3B, 4, 48, 'fruitTree');
        return {
            idle: frames,
            shake: frames
        };
    }, []);

    // 动物资源 - 圆形
    const getAnimalAssets = useCallback((type) => {
        if (type === 'cow') {
            // 白色大圆形
            const frames = createShapeAnimationFrames(0xFFFFFF, 4, 48, 'circle');
            return {
                idle: frames,
                move: frames
            };
        } else {
            // 黄色小圆形（鸡）
            const frames = createShapeAnimationFrames(0xFFD700, 4, 48, 'smallCircle');
            return {
                idle: frames,
                move: frames
            };
        }
    }, []);

    // 岩石资源
    const getRockAssets = useCallback((size) => {
        const frames = createShapeAnimationFrames(0x808080, 4, 32);
        return {
            idle: frames,
            shake: frames
        };
    }, []);

    // 作物资源 - 棕色梯形
    const getCropAssets = useCallback((type, stage = 0) => {
        const size = 24 + (stage * 8);
        const frames = createShapeAnimationFrames(0x8B4513, 4, size, 'trapezoid');
        return {
            idle: frames,
            grow: frames,
            [`stage_${stage}`]: frames
        };
    }, []);

    return {
        getTreeAssets,
        getFruitTreeAssets,
        getAnimalAssets,
        getRockAssets,
        getCropAssets
    };
}; 