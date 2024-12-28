import { Sprite } from '@pixi/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import player from '../assets/player.png';
import { Container, AnimatedSprite } from '@pixi/react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/gameConfig';

const DIAGONAL_FACTOR = 0.707;
const MOVE_SPEED = 5;

const Player = ({ onMove, checkCollision }) => {
    const [position, setPosition] = useState({ x: 400, y: 300 });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [currentDirection, setCurrentDirection] = useState('down');
    const [isMoving, setIsMoving] = useState(false);
    const [key, setKey] = useState(0);

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

    const handleMovement = useCallback(() => {
        if (!isMouseDown) {
            setIsMoving(false);
            return;
        }

        const dx = mousePos.x - window.innerWidth / 2;
        const dy = mousePos.y - window.innerHeight / 2;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length < 10) {
            setIsMoving(false);
            return;
        }

        setIsMoving(true);

        const dirX = dx / length;
        const dirY = dy / length;
        
        let newDirection = currentDirection;
        if (Math.abs(dirX) > Math.abs(dirY)) {
            newDirection = dirX > 0 ? 'right' : 'left';
        } else {
            newDirection = dirY > 0 ? 'down' : 'up';
        }

        if (newDirection !== currentDirection) {
            setCurrentDirection(newDirection);
            setKey(prev => prev + 1);
        }
        
        const speed = MOVE_SPEED;
        let newX = position.x + dirX * speed;
        let newY = position.y + dirY * speed;

        newX = Math.max(32, Math.min(GAME_WIDTH * 2.5 - 32, newX));
        newY = Math.max(32, Math.min(GAME_HEIGHT * 2.5 - 32, newY));

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
            if (e.button === 0) {
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
