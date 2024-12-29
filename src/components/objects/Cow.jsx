import { Container, AnimatedSprite, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCowAnimations } from '../../hooks/useAnimations/useCowAnimations';

const Cow = ({ 
    id, 
    position, 
    direction, 
    product, 
    productionTime,
    lastProduced,
    canInteract,
    onInteract,
    onClick  // 新增
}) => {
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const [canProduce, setCanProduce] = useState(true);
    const animations = useCowAnimations();

    const currentTextures = useMemo(() => {
        return animations?.[currentAnimation] || animations?.['idle'] || [];
    }, [animations, currentAnimation]);

    // 检查是否可以生产
    useEffect(() => {
        if (!lastProduced) return;
        
        const checkProduction = () => {
            const now = Date.now();
            setCanProduce(now - lastProduced >= productionTime);
        };

        const timer = setInterval(checkProduction, 1000);
        checkProduction();

        return () => clearInterval(timer);
    }, [lastProduced, productionTime]);

    const handleInteraction = useCallback(() => {
        if (!canInteract || isAnimating || !canProduce) return;
        
        setIsAnimating(true);
        setCurrentAnimation('eat');
        
        if (onInteract) {
            onInteract(id, product);
            setCanProduce(false);
        }
    }, [id, product, onInteract, isAnimating, canInteract, canProduce]);

    const handleClick = useCallback((e) => {
        if (!canInteract || isAnimating || !canProduce) return;
        
        setIsAnimating(true);
        setCurrentAnimation('move');
        setCanProduce(false);
        
        if (onClick) {
            onClick(e);
        }

        // 重置生产状态
        setTimeout(() => {
            setCanProduce(true);
        }, productionTime);
    }, [canInteract, isAnimating, canProduce, productionTime, onClick]);

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={canInteract}
            cursor={canInteract && canProduce ? 'pointer' : 'default'}
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
                    scale={direction === 'left' ? -1 : 1}
                />
            )}
            {canInteract && !canProduce && (
                <Graphics
                    draw={g => {
                        g.beginFill(0xFF0000, 0.5);
                        g.drawCircle(0, -30, 5);
                        g.endFill();
                    }}
                />
            )}
        </Container>
    );
};

export default Cow; 