import { Container, AnimatedSprite, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import * as PIXI from 'pixi.js';

// 导入作物精灵图
import cropsSheet from '../../assets/crops/crop.png';

// 设置精灵图
const setupSpritesheet = () => {
    const baseTexture = PIXI.BaseTexture.from(cropsSheet);
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    
    const textures = {
        'type1': {},
        'type2': {}
    };

    // 精灵图是 96*32 像素
    // 每行6个帧，每帧 16*16 像素
    // 跳过第一帧（包装的种子），只使用后面5个阶段
    for (let type = 0; type < 2; type++) {
        const typeName = `type${type + 1}`;
        for (let stage = 0; stage < 5; stage++) {
            textures[typeName][`stage_${stage}`] = [
                new PIXI.Texture(
                    baseTexture,
                    new PIXI.Rectangle((stage + 1) * 16, type * 16, 16, 16)  // +1 跳过第一帧
                )
            ];
        }
    }
    return textures;
};

// 预处理所有贴图
const cropTextures = setupSpritesheet();

const Crop = ({ 
    id, 
    position, 
    type = 'type1',
    growthStage = 0,
    maxStage = 4,
    growthTime,
    plantedTime,
    watered,
    needsWater,
    withered,
    harvestable,
    canInteract,
    onInteract,
    onClick
}) => {
    const [currentStage, setCurrentStage] = useState(growthStage);
    const [isWatered, setIsWatered] = useState(watered);
    const [progress, setProgress] = useState(0);  // 添加进度状态

    const currentTextures = useMemo(() => {
        return cropTextures[type]?.[`stage_${currentStage}`] || cropTextures['type1']['stage_0'];
    }, [type, currentStage]);

    // 处理生长进度
    useEffect(() => {
        if (!isWatered || withered) return;

        const startTime = Date.now();
        const stageTime = growthTime / 5;  // 每个阶段的时间

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentProgress = elapsed / stageTime;

            if (currentProgress >= 1) {
                // 进入下一个生长阶段
                const nextStage = currentStage + 1;
                if (nextStage <= maxStage) {
                    setCurrentStage(nextStage);
                    setIsWatered(false);
                    if (onInteract) {
                        onInteract(id, nextStage);
                    }
                }
                clearInterval(timer);
            } else {
                setProgress(currentProgress);
            }
        }, 100);  // 每100ms更新一次进度

        return () => clearInterval(timer);
    }, [isWatered, currentStage, maxStage, growthTime, withered, id, onInteract]);

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        
        if (!canInteract) return;
        
        if (!isWatered && !withered) {
            setIsWatered(true);
            setProgress(0);  // 重置进度
            if (onClick) {
                onClick(e, { action: 'water' });
            }
        } else if (harvestable) {
            if (onClick) {
                onClick(e, { action: 'harvest' });
            }
        }
    }, [canInteract, isWatered, withered, harvestable, onClick]);

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={canInteract}
            cursor={canInteract ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            {currentTextures && (
                <AnimatedSprite
                    anchor={[0.5, 0.5]}
                    textures={currentTextures}
                    isPlaying={false}
                    animationSpeed={0.1}
                    scale={2}
                />
            )}
            <Graphics
                draw={g => {
                    g.clear();
                    // 显示浇水状态
                    if (isWatered) {
                        g.beginFill(0x00BFFF, 0.7);
                        g.drawCircle(0, 15, 5);
                        g.endFill();
                    }
                    // 显示生长进度
                    if (currentStage < maxStage) {
                        // 背景条
                        g.beginFill(0x000000, 0.3);
                        g.drawRect(-15, -30, 30, 5);
                        g.endFill();
                        // 进度条
                        g.beginFill(0x00FF00, 0.5);
                        const width = ((currentStage + progress) / maxStage) * 30;
                        g.drawRect(-15, -30, width, 5);
                        g.endFill();
                    }
                }}
            />
        </Container>
    );
};

export default Crop; 