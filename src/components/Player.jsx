import { useState, useEffect, useCallback, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import player from '../assets/player.png';
import { Container, AnimatedSprite } from '@pixi/react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/gameConfig';

const DIAGONAL_FACTOR = 0.707;
const MOVE_SPEED = 5;

const Player = ({ onMove, checkCollision }) => {
    const [position, setPosition] = useState({ x: 480*2.5, y: 240*2.5});
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [currentDirection, setCurrentDirection] = useState('down');
    const [isMoving, setIsMoving] = useState(false);
    const [key, setKey] = useState(0);
    //使用 useMemo 的目的是确保 这些动画帧仅在初次渲染时创建一次，而不是在每次组件重新渲染时都重新创建。
    const animations = useMemo(() => {
        const baseTexture = PIXI.BaseTexture.from(player);
        baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        return {
            down: [0, 1, 2, 3].map(i =>
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * 48, 0, 48, 48))
            ),
            up: [0, 1, 2, 3].map(i =>
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * 48, 48, 48, 48))
            ),
            left: [0, 1, 2, 3].map(i =>
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * 48, 96, 48, 48))
            ),
            right: [0, 1, 2, 3].map(i =>
                new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * 48, 144, 48, 48))
            )
        };
    }, []);
    // 避免每次组件渲染时都重新创建 handleMovement 函数，减少性能开销。
    const handleMovement = useCallback(() => {
        // 如果鼠标没有按下，则停止移动
        if (!isMouseDown) {
            setIsMoving(false);
            return;
        }
        else setIsMoving(true);
        // 计算鼠标位置与窗口中心的偏移量
        const dx = mousePos.x - window.innerWidth / 2;
        const dy = mousePos.y - window.innerHeight / 2;
        // 计算偏移量的长度
        const length = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / length;//计算cos值
        const dirY = dy / length;//计算sin值

        let newDirection = currentDirection;
        if (Math.abs(dirX) > Math.abs(dirY)) {//
            newDirection = dirX > 0 ? 'right' : 'left';
        } else {
            newDirection = dirY > 0 ? 'down' : 'up';
        }

        if (newDirection !== currentDirection) {
            setCurrentDirection(newDirection);
            setKey(prev => prev + 1);
        }

        const speed = MOVE_SPEED;
        let newX = position.x + dirX * speed;//计算新的x坐标
        let newY = position.y + dirY * speed;//计算新的y坐标

        newX = Math.max(32, Math.min(GAME_WIDTH * 2.5 - 32, newX));
        newY = Math.max(32, Math.min(GAME_HEIGHT * 2.5 - 32, newY));
        //检查是否碰撞
        if (!checkCollision(newX, newY)) {
            setPosition({ x: newX, y: newY });
            onMove(newX, newY);
        }
    }, [position, isMouseDown, mousePos, onMove, currentDirection, checkCollision]);

    useEffect(() => {
        let animationFrame;
        const animate = () => {
            handleMovement();
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [handleMovement]);

    useEffect(() => {
        const handleMouseDown = (e) => {
            if (e.button === 0) { //0是鼠标左键
                setIsMouseDown(true);
            }
        };

        const handleMouseUp = (e) => {
            if (e.button === 0) {
                setIsMouseDown(false);
            }
        };

        const handleMouseMove = (e) => {
            setMousePos({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <Container position={[position.x, position.y]}>
            <AnimatedSprite
                scale={2.5}
                key={key}
                anchor={0.5}
                textures={animations[currentDirection]}
                isPlaying={isMoving}
                animationSpeed={0.15}
                loop={true}
                width={48 * 2}
                height={48 * 2}
            />
        </Container>
    );
};

export default Player; 
