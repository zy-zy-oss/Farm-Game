import { Container } from '@pixi/react';
import { useCallback, useMemo } from 'react';
import Tree from './objects/Tree';
import FruitTree from './objects/FruitTree';
import Rock from './objects/Rock';
import Crop from './objects/Crop';
import Cow from './objects/Cow';
import Chicken from './objects/Chicken';

import treeConfig from '../config/objects/trees.json';
import fruitTreeConfig from '../config/objects/fruitTrees.json';
import rockConfig from '../config/objects/rocks.json';
import cropConfig from '../config/objects/crops.json';
import cowConfig from '../config/objects/cows.json';
import chickenConfig from '../config/objects/chickens.json';

// 视口范围常量
const VIEWPORT_WIDTH = 960;
const VIEWPORT_HEIGHT = 480;
const MARGIN = 100;

const ObjectsManager = ({ playerPosition, onInteract, fruitTrees }) => {
    // 检查是否在交互范围内
    const checkInteractionRange = useCallback((objPos) => {
        const dx = objPos.x - playerPosition.x;
        const dy = objPos.y - playerPosition.y;
        return (dx * dx + dy * dy) < 10000; // 100 * 100，避免开方运算
    }, [playerPosition]);

    // 检查是否在视口内
    const isInViewport = useCallback((objPos) => {
        const dx = objPos.x - playerPosition.x;
        const dy = objPos.y - playerPosition.y;
        return (
            dx > -VIEWPORT_WIDTH/2 - MARGIN &&
            dx < VIEWPORT_WIDTH/2 + MARGIN &&
            dy > -VIEWPORT_HEIGHT/2 - MARGIN &&
            dy < VIEWPORT_HEIGHT/2 + MARGIN
        );
    }, [playerPosition]);

    // 过滤并记忆视口内的对象
    const visibleObjects = useMemo(() => ({
        trees: treeConfig.trees.filter(obj => isInViewport(obj.position)),
        fruitTrees: fruitTrees.filter(obj => isInViewport(obj.position)),
        rocks: rockConfig.rocks.filter(obj => isInViewport(obj.position)),
        crops: cropConfig.crops.filter(obj => isInViewport(obj.position)),
        cows: cowConfig.cows.filter(obj => isInViewport(obj.position)),
        chickens: chickenConfig.chickens.filter(obj => isInViewport(obj.position))
    }), [isInViewport, fruitTrees]);

    // 记忆交互处理函数
    const handleInteract = useMemo(() => ({
        tree: (id, items) => onInteract('tree', id, { items }),
        fruitTree: onInteract,
        rock: (id, items) => onInteract('rock', id, { items }),
        crop: (id, type, action) => onInteract('crop', id, { type, action }),
        cow: (id, product) => onInteract('cow', id, { product }),
        chicken: (id, product) => onInteract('chicken', id, { product })
    }), [onInteract]);

    return (
        <Container>
            {visibleObjects.trees.map(tree => (
                <Tree
                    key={tree.id}
                    {...tree}
                    canInteract={checkInteractionRange(tree.position)}
                    onInteract={handleInteract.tree}
                />
            ))}

            {visibleObjects.fruitTrees.map(tree => (
                <FruitTree
                    key={tree.id}
                    {...tree}
                    currentSeason="summer"
                    canInteract={checkInteractionRange(tree.position)}
                    onInteract={handleInteract.fruitTree}
                />
            ))}

            {visibleObjects.rocks.map(rock => (
                <Rock
                    key={rock.id}
                    {...rock}
                    canInteract={checkInteractionRange(rock.position)}
                    onInteract={handleInteract.rock}
                />
            ))}

            {visibleObjects.crops.map(crop => (
                <Crop
                    key={crop.id}
                    {...crop}
                    canInteract={checkInteractionRange(crop.position)}
                    onInteract={handleInteract.crop}
                />
            ))}

            {visibleObjects.cows.map(cow => (
                <Cow
                    key={cow.id}
                    {...cow}
                    canInteract={checkInteractionRange(cow.position)}
                    onInteract={handleInteract.cow}
                />
            ))}

            {visibleObjects.chickens.map(chicken => (
                <Chicken
                    key={chicken.id}
                    {...chicken}
                    canInteract={checkInteractionRange(chicken.position)}
                    onInteract={handleInteract.chicken}
                />
            ))}
        </Container>
    );
};

export default ObjectsManager; 