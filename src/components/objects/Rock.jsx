import { Container, AnimatedSprite, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRockAnimations } from '../../hooks/useAnimations/useRockAnimations';

const Rock = ({ 
    id, 
    position, 
    size, 
    dropItems, 
    health: initialHealth,
    respawnTime,
    canInteract,
    onInteract
}) => {
    const [currentHealth, setCurrentHealth] = useState(initialHealth);
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const animations = useRockAnimations(size);

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        
        if (!canInteract || isAnimating || !isVisible) {
            return;
        }

        setIsAnimating(true);
        setCurrentAnimation('shake');
        
        // 减少生命值
        setCurrentHealth(prev => {
            const newHealth = Math.max(0, prev - 1);
            
            // 如果生命值为0，触发消失和重生
            if (newHealth === 0) {
                setIsVisible(false);
                setTimeout(() => {
                    setIsVisible(true);
                    setCurrentHealth(initialHealth);
                }, respawnTime);
            }
            
            return newHealth;
        });

        // 调用交互回调
        onInteract('rock', id, { items: dropItems });

        setTimeout(() => {
            setIsAnimating(false);
            setCurrentAnimation('idle');
        }, 500);

    }, [canInteract, isAnimating, isVisible, id, dropItems, initialHealth, respawnTime, onInteract]);

    if (!isVisible) return null;

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={true}
            cursor={canInteract ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            <AnimatedSprite
                anchor={0.5}
                textures={animations?.idle || []}
                isPlaying={isAnimating}
                animationSpeed={0.1}
                loop={false}
            />
            
            {/* 显示生命值 */}
            {canInteract && (
                <Graphics
                    draw={g => {
                        g.clear();
                        // 背景条
                        g.beginFill(0x000000, 0.3);
                        g.drawRect(-15, -30, 30, 5);
                        g.endFill();
                        // 生命值条
                        g.beginFill(0x00FF00);
                        g.drawRect(-15, -30, (currentHealth / initialHealth) * 30, 5);
                        g.endFill();
                    }}
                />
            )}
        </Container>
    );
};

export default Rock; 