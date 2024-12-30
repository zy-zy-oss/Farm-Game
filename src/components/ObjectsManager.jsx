import { Container } from '@pixi/react';
import { useCallback, useMemo, useEffect, useState } from 'react';
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

const ObjectsManager = ({ playerPosition, onInteract, fruitTrees, checkCollision }) => {
    // 检查是否在交互范围内
    const checkInteractionRange = useCallback((objPos) => {
        const dx = objPos.x - playerPosition.x;
        const dy = objPos.y - playerPosition.y;
        return (dx * dx + dy * dy) < 10000; // 100 * 100，避免开方运算
    }, [playerPosition]);

    // 记忆交互处理函数
    const handleInteract = useMemo(() => ({
        tree: (id, items) => onInteract('tree', id, { items }),
        fruitTree: onInteract,
        rock: (id, items) => onInteract('rock', id, { items }),
        crop: (id, type, action) => onInteract('crop', id, { type, action }),
        cow: (id, product) => onInteract('cow', id, { product }),
        chicken: (id, product) => onInteract('chicken', id, { product })
    }), [onInteract]);

    // 添加作物状态管理
    const [crops, setCrops] = useState([
        {
            id: 'crop_01',
            type: 'type1',
            position: { x: 300, y: 200 },
            growthStage: 0,
            plantedTime: null,     // 初始未种植
            lastWateredTime: null, // 上次浇水时间
            watered: false,
            needsWater: false,     // 是否需要浇水
            withered: false,       // 是否枯萎
            harvestable: false     // 是否可收获
        },
        {
            id: 'crop_02',
            type: 'type2',
            position: { x: 350, y: 200 },
            growthStage: 0,
            plantedTime: null,
            lastWateredTime: null,
            watered: false,
            needsWater: false,
            withered: false,
            harvestable: false
        }
    ]);

    // 检查作物状态
    useEffect(() => {
        const timer = setInterval(() => {
            setCrops(prevCrops => {
                return prevCrops.map(crop => {
                    if (!crop.plantedTime || crop.withered) return crop;

                    const now = Date.now();
                    if (crop.lastWateredTime && (now - crop.lastWateredTime > 300000)) {
                        return {
                            ...crop,
                            withered: true,
                            watered: false,
                            needsWater: false,
                            harvestable: false
                        };
                    }
                    return crop;
                });
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 处理作物交互
    const handleCropInteract = useCallback((id, action) => {
        setCrops(prevCrops => {
            return prevCrops.map(crop => {
                if (crop.id !== id) return crop;

                const now = Date.now();

                switch (action) {
                    case 'water':
                        if (crop.withered) return crop;
                        return {
                            ...crop,
                            watered: true,
                            needsWater: false,
                            lastWateredTime: now,
                            plantedTime: crop.plantedTime || now
                        };
                        
                    case 'harvest':
                        if (!crop.harvestable) return crop;
                        return {
                            ...crop,
                            growthStage: 0,
                            plantedTime: null,
                            lastWateredTime: null,
                            watered: false,
                            needsWater: false,
                            withered: false,
                            harvestable: false
                        };
                        
                    case 'remove':
                        if (!crop.withered) return crop;
                        return {
                            ...crop,
                            growthStage: 0,
                            plantedTime: null,
                            lastWateredTime: null,
                            watered: false,
                            needsWater: false,
                            withered: false,
                            harvestable: false
                        };
                        
                    default:
                        return crop;
                }
            });
        });
    }, []);

    // 处理生长阶段更新
    const handleGrowthUpdate = useCallback((id, newStage) => {
        setCrops(prevCrops => {
            return prevCrops.map(crop => {
                if (crop.id === id) {
                    const isFullyGrown = newStage === 4;
                    return {
                        ...crop,
                        growthStage: newStage,
                        watered: false,
                        needsWater: !isFullyGrown,
                        harvestable: isFullyGrown
                    };
                }
                return crop;
            });
        });
    }, []);

    const [rocks, setRocks] = useState(rockConfig.rocks);
    // 处理石头交互
    const handleRockInteract = useCallback((id) => {
        setRocks(prevRocks => {
            return prevRocks.filter(rock => rock.id !== id);
        });
    }, []);

    return (
        <Container>
            {/* 渲染所有可见的对象，不再过滤视口 */}
            {fruitTreeConfig.fruitTrees.map(tree => (
                <FruitTree
                    key={tree.id}
                    {...tree}
                    currentSeason="summer"
                    canInteract={checkInteractionRange(tree.position)}
                    onInteract={handleInteract.fruitTree}
                />
            ))}

            {chickenConfig.chickens.map(chicken => (
                <Chicken
                    key={chicken.id}
                    {...chicken}
                    canInteract={checkInteractionRange(chicken.position)}
                    onInteract={handleInteract.chicken}
                    checkCollision={checkCollision} 
                />
            ))}

            {treeConfig.trees.map(tree => (
                <Tree
                    key={tree.id}
                    {...tree}
                    canInteract={checkInteractionRange(tree.position)}
                    onInteract={handleInteract.tree}
                />
            ))}

            {rockConfig.rocks.map(rock => (
                <Rock
                    key={rock.id}
                    {...rock}
                    canInteract={checkInteractionRange(rock.position)}
                    onInteract={handleInteract.rock}
                />
            ))}

            {cropConfig.crops.map(crop => (
                <Crop
                    key={crop.id}
                    {...crop}
                    maxStage={4}
                    growthTime={12000}
                    canInteract={!crop.withered || (crop.withered && crop.growthStage > 0)}
                    onClick={(e, { action }) => handleCropInteract(crop.id, action)}
                    onInteract={handleGrowthUpdate}
                />
            ))}

            {cowConfig.cows.map(cow => (
                <Cow
                    key={cow.id}
                    {...cow}
                    canInteract={checkInteractionRange(cow.position)}
                    onInteract={handleInteract.cow}
                    checkCollision={checkCollision} 
                />
            ))}
        </Container>
    );
};

export default ObjectsManager;
