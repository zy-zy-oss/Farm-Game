import { Container, Sprite, Graphics } from '@pixi/react';
import { useState, useCallback, useMemo } from 'react';
import { SCALE_MODES, Texture } from 'pixi.js';
import largeRock from '../../assets/rocks/big.png';
import smallRock from '../../assets/rocks/small.png';
import * as PIXI from 'pixi.js';
const ROCK_CONFIGS = {
    large: {
        image: largeRock,
        width: 32,
        height: 32
    },
    small: {
        image: smallRock,
        width: 16,
        height: 16
    }
};

const Rock = ({
    id,
    position,
    type = 'small',
    maxHealth,
    currentHealth,
    canInteract,
    onInteract,
    onClick
}) => {
    const [health, setHealth] = useState(currentHealth);
    const [isDestroyed, setIsDestroyed] = useState(false);

    const texture = useMemo(() => {
        const tex = Texture.from(ROCK_CONFIGS[type].image);
        tex.baseTexture.scaleMode = SCALE_MODES.NEAREST;
        return tex;
    }, [type]);

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        
        if (!canInteract || isDestroyed) return;
        
        const newHealth = health - 1;
        setHealth(newHealth);
        
        if (onClick) {
            onClick(e, { 
                action: 'hit',
                health: newHealth
            });
        }

        if (newHealth <= 0) {
            setIsDestroyed(true);
            if (onInteract) {
                onInteract(id);
            }
        }
    }, [canInteract, health, id, onClick, onInteract, isDestroyed]);

    if (isDestroyed) return null;

    return (
        <Container
            position={[position.x, position.y]}
            interactive={canInteract}
            cursor={canInteract ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            <Sprite
                texture={texture}
                anchor={[0.5, 0.5]}
                width={ROCK_CONFIGS[type].width}
                height={ROCK_CONFIGS[type].height}
            />
            {canInteract && health < maxHealth && (
                <Graphics
                    draw={g => {
                        g.clear();
                        g.beginFill(0x000000, 0.3);
                        g.drawRect(-15, -20, 30, 5);
                        g.endFill();
                        g.beginFill(0xFF0000, 0.5);
                        g.drawRect(-15, -20, (health / maxHealth) * 30, 5);
                        g.endFill();
                    }}
                />
            )}
        </Container>
    );
};

export default Rock; 