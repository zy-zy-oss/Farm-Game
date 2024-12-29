import { Container, Sprite } from '@pixi/react';
import { useCallback, useMemo } from 'react';
import * as PIXI from 'pixi.js';

// 导入普通树的两种贴图
import treeType1 from '../../assets/trees/tree1.png';
import treeType2 from '../../assets/trees/tree2.png';

// 设置贴图的缩放模式
const setupTexture = (image) => {
    const texture = PIXI.Texture.from(image);
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    return texture;
};

const treeTextures = {
    tree1: setupTexture(treeType1),
    tree2: setupTexture(treeType2)
};

const Tree = ({ 
    id, 
    type = 'tree1',
    position, 
    scale = [2, 2],
    health = 100,
    dropItems = ['wood'],
    canInteract,
    onInteract 
}) => {
    const handleClick = useCallback((e) => {
        e.stopPropagation();
        if (!canInteract) return;
        onInteract(id, dropItems);
    }, [canInteract, id, dropItems, onInteract]);

    const texture = useMemo(() => {
        return treeTextures[type] || treeTextures.tree1;
    }, [type]);

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={canInteract}
            cursor={canInteract ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            <Sprite
                texture={texture}
                anchor={0.5}
                scale={scale}
            />
        </Container>
    );
};

export default Tree; 