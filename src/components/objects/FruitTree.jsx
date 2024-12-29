import { Container, AnimatedSprite, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {useFruitTreeAnimations} from '../../hooks/useAnimations/useFruitTreeAnimations';

const FruitTree = ({ 
    id, 
    type,
    position, 
    scale,
    fruitType,
    fruitGrowthTime,
    maxFruits,
    currentFruits,
    season,
    lastDropped,
    canInteract,
    onInteract,
    currentSeason
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const animations = useFruitTreeAnimations(type);
    
    // 检查是否在当前季节
    const isInSeason = season.includes(currentSeason);

    const handleClick = useCallback((e) => {
        e.stopPropagation(); // 阻止事件冒泡
        
        // 检查是否可以交互
        if (!canInteract || isAnimating || currentFruits <= 0) {
            return;
        }

        // 设置动画
        setIsAnimating(true);
        setCurrentAnimation('shake');

        // 调用交互回调
        onInteract('fruitTree', id, { fruit: fruitType });

        // 动画结束后重置状态
        setTimeout(() => {
            setIsAnimating(false);
            setCurrentAnimation('idle');
        }, 500);

    }, [canInteract, isAnimating, currentFruits, id, fruitType, onInteract]);

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={true}
            cursor={canInteract && currentFruits > 0 ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            <AnimatedSprite
                anchor={0.5}
                textures={animations?.idle || []}
                isPlaying={isAnimating}
                animationSpeed={0.1}
                loop={false}
                scale={scale}
            />
            
            {/* 显示果实数量指示器 */}
            {currentFruits > 0 && (
                <Container>
                    {Array.from({ length: currentFruits }).map((_, index) => (
                        <Graphics
                            key={`fruit-${id}-${index}`}
                            draw={g => {
                                g.clear();
                                g.beginFill(0xFF0000, 0.6);
                                g.drawCircle(
                                    20 + (index * 10), 
                                    -30, 
                                    5
                                );
                                g.endFill();
                            }}
                        />
                    ))}
                </Container>
            )}
        </Container>
    );
};

export default FruitTree; 