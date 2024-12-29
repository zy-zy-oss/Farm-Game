import { Container, AnimatedSprite, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {useCropAnimations} from '../../hooks/useAnimations/useCropAnimations';

const Crop = ({ 
    id, 
    position, 
    type,
    growthStage,
    maxStage,
    growthTime,
    plantedTime,
    watered,
    canInteract,
    onInteract,
    onClick
}) => {
    const [currentStage, setCurrentStage] = useState(growthStage);
    const [isWatered, setIsWatered] = useState(watered);
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const animations = useCropAnimations(type);

    const currentTextures = useMemo(() => {
        return animations?.[`stage_${currentStage}`] || animations?.['idle'] || [];
    }, [animations, currentStage]);

    // 处理生长
    useEffect(() => {
        if (!plantedTime || currentStage >= maxStage || !isWatered) return;
        
        const checkGrowth = () => {
            const now = Date.now();
            const timePassed = now - plantedTime;
            const newStage = Math.floor(timePassed / growthTime);
            
            if (newStage > currentStage && newStage <= maxStage) {
                setCurrentStage(newStage);
                if (onInteract) {
                    onInteract(id, newStage);
                }
            }
        };

        const timer = setInterval(checkGrowth, 1000);
        checkGrowth();

        return () => clearInterval(timer);
    }, [id, plantedTime, currentStage, maxStage, growthTime, isWatered, onInteract]);

    const handleClick = useCallback((e) => {
        if (!canInteract || isAnimating) return;
        
        setIsAnimating(true);
        
        if (currentStage >= maxStage) {
            setCurrentAnimation('harvest');
            if (onClick) {
                onClick(e, { action: 'harvest' });
            }
        } else if (!isWatered) {
            setCurrentAnimation('water');
            setIsWatered(true);
            if (onClick) {
                onClick(e, { action: 'water' });
            }
        }
    }, [canInteract, isAnimating, currentStage, maxStage, isWatered, onClick]);

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={canInteract}
            cursor={canInteract ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            {currentTextures.length > 0 && (
                <AnimatedSprite
                    anchor={0.5}
                    textures={currentTextures}
                    isPlaying={isAnimating}
                    animationSpeed={0.1}
                    loop={false}
                    onComplete={() => {
                        setIsAnimating(false);
                        setCurrentAnimation('idle');
                    }}
                />
            )}
            {/* 显示浇水和生长状态 */}
            {canInteract && (
                <Graphics
                    draw={g => {
                        g.clear();
                        // 显示浇水状态
                        if (isWatered) {
                            g.beginFill(0x0000FF, 0.3);
                            g.drawCircle(0, 15, 5);
                            g.endFill();
                        }
                        // 显示生长进度
                        if (currentStage < maxStage) {
                            g.beginFill(0x000000, 0.3);
                            g.drawRect(-15, -30, 30, 5);
                            g.endFill();
                            g.beginFill(0x00FF00);
                            g.drawRect(-15, -30, (currentStage / maxStage) * 30, 5);
                            g.endFill();
                        }
                    }}
                />
            )}
        </Container>
    );
};

export default Crop; 