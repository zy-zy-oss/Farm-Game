import { Container, Sprite } from '@pixi/react';
import { useCallback, useMemo, useState } from 'react';
import * as PIXI from 'pixi.js';

// 导入果树的不同状态贴图
import fruitTree0 from '../../assets/trees/tree2.png';
import fruitTree1 from '../../assets/trees/fruit1.png';
import fruitTree2 from '../../assets/trees/fruit2.png';
import fruitTree3 from '../../assets/trees/fruit3.png';

// 设置贴图的缩放模式
const setupTexture = (image) => {
    const texture = PIXI.Texture.from(image);
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    return texture;
};

// 预处理所有状态的贴图
const fruitTreeTextures = {
    0: setupTexture(fruitTree0),
    1: setupTexture(fruitTree1),
    2: setupTexture(fruitTree2),
    3: setupTexture(fruitTree3)
};

const FruitTree = ({ 
    id, 
    position, 
    scale = [2.5, 2.5],
    initialFruits = 3,
    canInteract,
    onInteract,
    onFruitsChange  // 添加回调函数
}) => {
    const [fruits, setFruits] = useState(initialFruits);

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        if (!canInteract || fruits <= 0) return;

        // 减少果实数量
        setFruits(prev => {
            const newCount = Math.max(0, prev - 1);
            // 通知父组件果实数量变化
            onFruitsChange?.(id, newCount);
            return newCount;
        });

        // 触发交互回调
        onInteract(id, ['apple']);
    }, [canInteract, fruits, id, onInteract, onFruitsChange]);

    // 根据果实数量选择对应的贴图
    const texture = useMemo(() => {
        return fruitTreeTextures[fruits] || fruitTreeTextures[0];
    }, [fruits]);

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={canInteract && fruits > 0}
            cursor={canInteract && fruits > 0 ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            <Sprite
                texture={texture}
                anchor={0.5}
                scale={2}
            />
        </Container>
    );
};

export default FruitTree; 