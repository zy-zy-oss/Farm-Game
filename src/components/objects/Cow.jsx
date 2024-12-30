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
    onClick,  // 新增
    checkCollision
}) => {
    const animations = useCowAnimations();
    const [originalPosition] = useState(position);  // 保存初始位置
    const [currentPosition, setCurrentPosition] = useState(position);
    const [targetPosition, setTargetPosition] = useState(position);
    const [currentDirection, setCurrentDirection] = useState('right');
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const [canProduce, setCanProduce] = useState(true);

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

    const MOVE_CONFIG = {
        checkInterval: 2000,    // 每3秒检查一次是否移动
        moveChance: 0.7,        // 40%的移动概率
        maxDistance: 200,       // 最大移动范围
        moveDuration: 4000,     // 移动持续时间
        moveSpeed: 0.5          // 移动速度
    };

    // 检查新位置是否在允许范围内
    const isWithinBounds = (x, y) => {
        const dx = x - originalPosition.x;
        const dy = y - originalPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= MOVE_CONFIG.maxDistance;
    };

    // 添加 checkPathCollision 函数
    const checkPathCollision = useCallback((startX, startY, endX, endY) => {
        const cowSize = 16;  // 牛的碰撞盒大小
        const steps = 20;    
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            
            // 检查当前点周围的区域
            for (let offsetX = -cowSize/2; offsetX <= cowSize/2; offsetX += cowSize/2) {
                for (let offsetY = -cowSize/2; offsetY <= cowSize/2; offsetY += cowSize/2) {
                    if (checkCollision(x + offsetX, y + offsetY)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [checkCollision]);

    // 随机移动逻辑
    useEffect(() => {
        const moveInterval = setInterval(() => {
            if (Math.random() < MOVE_CONFIG.moveChance && !isAnimating) {
                const directions = ['left', 'right', 'up', 'down'];
                const newDirection = directions[Math.floor(Math.random() * directions.length)];
                
                let newX = currentPosition.x;
                let newY = currentPosition.y;
                const moveDistance = 40 + Math.random() * 40;  // 随机移动距离 40-80

                switch(newDirection) {
                    case 'left':
                        newX -= moveDistance;
                        break;
                    case 'right':
                        newX += moveDistance;
                        break;
                    case 'up':
                        newY -= moveDistance;
                        break;
                    case 'down':
                        newY += moveDistance;
                        break;
                }
                
                // 检查新位置是否在允许范围内且没有碰撞
                if (isWithinBounds(newX, newY) && 
                    !checkPathCollision(currentPosition.x, currentPosition.y, newX, newY)) {
                    setCurrentDirection(newDirection === 'left' ? 'left' : 'right');
                    setIsAnimating(true);
                    setCurrentAnimation('move');
                    
                    setTargetPosition({
                        x: newX,
                        y: newY
                    });

                    setTimeout(() => {
                        setIsAnimating(false);
                        setCurrentAnimation('idle');
                    }, MOVE_CONFIG.moveDuration);
                }
            }
        }, MOVE_CONFIG.checkInterval);

        return () => clearInterval(moveInterval);
    }, [currentPosition, isAnimating, checkPathCollision, originalPosition]);

    // 初始移动也需要检查范围
    useEffect(() => {
        const initialDelay = Math.random() * 1000;
        setTimeout(() => {
            if (!isAnimating) {
                const directions = ['left', 'right', 'up', 'down'];
                const newDirection = directions[Math.floor(Math.random() * directions.length)];
                
                let newX = currentPosition.x;
                let newY = currentPosition.y;
                const moveDistance = 40 + Math.random() * 40;

                switch(newDirection) {
                    case 'left':
                        newX -= moveDistance;
                        break;
                    case 'right':
                        newX += moveDistance;
                        break;
                    case 'up':
                        newY -= moveDistance;
                        break;
                    case 'down':
                        newY += moveDistance;
                        break;
                }
                
                if (isWithinBounds(newX, newY) && 
                    !checkPathCollision(currentPosition.x, currentPosition.y, newX, newY)) {
                    setCurrentDirection(newDirection === 'left' ? 'left' : 'right');
                    setIsAnimating(true);
                    setCurrentAnimation('move');
                    
                    setTargetPosition({
                        x: newX,
                        y: newY
                    });

                    setTimeout(() => {
                        setIsAnimating(false);
                        setCurrentAnimation('idle');
                    }, MOVE_CONFIG.moveDuration);
                }
            }
        }, initialDelay);
    }, []);

    // 添加平滑移动逻辑
    useEffect(() => {
        if (currentPosition.x === targetPosition.x && 
            currentPosition.y === targetPosition.y) return;

        const moveStep = () => {
            setCurrentPosition(prev => {
                const dx = targetPosition.x - prev.x;
                const dy = targetPosition.y - prev.y;
                
                if (Math.abs(dx) < MOVE_CONFIG.moveSpeed && 
                    Math.abs(dy) < MOVE_CONFIG.moveSpeed) {
                    return targetPosition;
                }
                
                const newX = prev.x + (Math.abs(dx) < MOVE_CONFIG.moveSpeed ? 0 
                    : (dx > 0 ? MOVE_CONFIG.moveSpeed : -MOVE_CONFIG.moveSpeed));
                const newY = prev.y + (Math.abs(dy) < MOVE_CONFIG.moveSpeed ? 0 
                    : (dy > 0 ? MOVE_CONFIG.moveSpeed : -MOVE_CONFIG.moveSpeed));
                
                if (checkPathCollision(prev.x, prev.y, newX, newY)) {
                    setIsAnimating(false);
                    setCurrentAnimation('idle');
                    return prev;
                }
                
                return { x: newX, y: newY };
            });
        };

        const moveInterval = setInterval(moveStep, 16);
        return () => clearInterval(moveInterval);
    }, [currentPosition, targetPosition, checkPathCollision]);

    return (
        <Container 
            position={[currentPosition.x, currentPosition.y]}
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
                    loop={true}
                    onComplete={() => {
                        setIsAnimating(false);
                        setCurrentAnimation('idle');
                    }}
                    scale={{
                        x: currentDirection === 'left' ? -2 : 2,
                        y: 2
                    }}
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