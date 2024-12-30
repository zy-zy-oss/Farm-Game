import { Container, AnimatedSprite, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useChickenAnimations } from '../../hooks/useAnimations/useChickenAnimations';

const Chicken = ({ 
    id, 
    position, 
    direction, 
    product, 
    productionTime,
    lastProduced,
    canInteract,
    onInteract,
    onClick,  // 新增
    checkCollision  // 从 FarmScene 传入的碰撞检测函数
}) => {
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const [canProduce, setCanProduce] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(position);
    const [currentDirection, setCurrentDirection] = useState(direction);
    const [targetPosition, setTargetPosition] = useState(position);
    const animations = useChickenAnimations();

    const currentTextures = useMemo(() => {
        if (!animations || !animations[currentAnimation]) {
            return animations?.['idle'] || [];
        }
        return animations[currentAnimation];
    }, [animations, currentAnimation]);

    // 平滑切换动画
    const handleAnimationChange = useCallback((newAnimation) => {
        if (currentTextures.length > 0) {  // 确保有当前纹理
            setCurrentAnimation(newAnimation);
        }
    }, [currentTextures]);

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

    // 移动配置
    const MOVE_CONFIG = {
        checkInterval: 1000,    // 每5秒检查一次是否移动
        moveChance: 0.7,        // 40%的移动概率
        moveDistance: 200,      // 移动距离增加到100
        moveDuration: 3000,     // 移动持续时间增加到3秒
        moveSpeed: 2            // 每次移动1像素
    };

    // 检查移动路径是否会发生碰撞
    const checkPathCollision = useCallback((startX, startY, endX, endY) => {
        // 增加碰撞检测的范围和精度
        const chickenSize = 16;  // 小鸡的碰撞盒大小
        const steps = 20;        // 增加采样点
        
        // 检查起点和终点
        if (checkCollision(startX, startY) || checkCollision(endX, endY)) {
            return true;
        }

        // 检查路径上的点
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            
            // 检查当前点周围的区域
            for (let offsetX = -chickenSize/2; offsetX <= chickenSize/2; offsetX += chickenSize/2) {
                for (let offsetY = -chickenSize/2; offsetY <= chickenSize/2; offsetY += chickenSize/2) {
                    if (checkCollision(x + offsetX, y + offsetY)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [checkCollision]);

    // 平滑移动逻辑
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
                
                // 检查每一步移动是否会发生碰撞
                if (checkPathCollision(prev.x, prev.y, newX, newY)) {
                    setIsAnimating(false);
                    setCurrentAnimation('idle');
                    return prev;  // 如果发生碰撞，保持原位置
                }
                
                return { x: newX, y: newY };
            });
        };

        const moveInterval = setInterval(moveStep, 16);
        return () => clearInterval(moveInterval);
    }, [currentPosition, targetPosition, checkPathCollision]);

    // 随机移动逻辑
    useEffect(() => {
        const moveInterval = setInterval(() => {
            if (Math.random() < MOVE_CONFIG.moveChance && !isAnimating) {
                const directions = ['left', 'right', 'up', 'down'];
                const newDirection = directions[Math.floor(Math.random() * directions.length)];
                
                let newX = currentPosition.x;
                let newY = currentPosition.y;

                switch(newDirection) {
                    case 'left':
                        newX -= MOVE_CONFIG.moveDistance;
                        break;
                    case 'right':
                        newX += MOVE_CONFIG.moveDistance;
                        break;
                    case 'up':
                        newY -= MOVE_CONFIG.moveDistance;
                        break;
                    case 'down':
                        newY += MOVE_CONFIG.moveDistance;
                        break;
                }
                
                // 使用 FarmScene 的碰撞检测
                if (!checkPathCollision(currentPosition.x, currentPosition.y, newX, newY)) {
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
    }, [currentPosition, isAnimating, checkCollision]);

    const handleClick = useCallback((e) => {
        if (!canInteract || isAnimating || !canProduce) return;
        
        setIsAnimating(true);
        handleAnimationChange('move');  // 使用新的动画切换函数
        setCanProduce(false);
        
        if (onClick) {
            onClick(e);
        }

        // 重置生产状态
        setTimeout(() => {
            setCanProduce(true);
        }, productionTime);
    }, [canInteract, isAnimating, canProduce, productionTime, onClick, handleAnimationChange]);

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
                        if (isAnimating) {
                            setIsAnimating(false);
                            handleAnimationChange('idle');
                        }
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
                        g.drawCircle(0, -20, 5);
                        g.endFill();
                    }}
                />
            )}
        </Container>
    );
};

export default Chicken; 