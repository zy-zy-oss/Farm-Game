import { Container, Sprite, Graphics } from '@pixi/react';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants/gameConfig';
import map from '../assets/map.png';
import Player from './Player';
import * as PIXI from 'pixi.js';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import DebugCollisionTool from './DebugCollisionTool';
import collisionConfig from '../config/collisionAreas.json';

// 定义碰撞区域（可以根据实际建筑形状定义多个）


const FarmScene = () => {
    const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
    const [isDebugMode, setIsDebugMode] = useState(false);

    // 检查点是否在多边形内
    const isPointInPolygon = useCallback((point, polygon) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        return inside;
    }, []);

    // 碰撞检测函数
    const checkCollision = useCallback((x, y) => {
        // 检查所有区域
        for (const area of collisionConfig.areas) {
            if (area.points && area.points.length > 2) {
                if (isPointInPolygon({ x, y }, area.points)) {
                    return true;
                }
            }
        }
        return false;
    }, [isPointInPolygon]);

    const handlePlayerMove = useCallback((playerX, playerY) => {
        const newX = -playerX + window.innerWidth / 2;
        const newY = -playerY + window.innerHeight / 2;
        setCameraPosition({ x: newX, y: newY });
    }, []);

    const texture = PIXI.Texture.from(map);
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    // 绘制背景网格
    const drawBackground = useCallback((g) => {
        // 绘制大背景
        g.clear();
        g.beginFill(0x9bd4c3 ); // 深蓝灰色背景
        g.drawRect(-GAME_WIDTH * 2, -GAME_HEIGHT * 2, GAME_WIDTH * 5, GAME_HEIGHT * 5);
        g.endFill();

        // 绘制网格
        g.lineStyle(1, 0xFFFFFF, 0.1);
        
        // 垂直线
        for (let x = -GAME_WIDTH * 2; x <= GAME_WIDTH * 3; x += TILE_SIZE) {
            g.moveTo(x, -GAME_HEIGHT * 2);
            g.lineTo(x, GAME_HEIGHT * 3);
        }
        
        // 水平线
        for (let y = -GAME_HEIGHT * 2; y <= GAME_HEIGHT * 3; y += TILE_SIZE) {
            g.moveTo(-GAME_WIDTH * 2, y);
            g.lineTo(GAME_WIDTH * 3, y);
        }
    }, []);

    return (
        <Container position={[cameraPosition.x, cameraPosition.y]}>
            <Graphics draw={drawBackground} />
            <Sprite 
                texture={texture}
                width={960*2.5}
                height={480*2.5}
            />
            
            {/* 调试模式下显示碰撞区域 */}
            {isDebugMode && (
                <Graphics
                    draw={(g) => {
                        g.clear();
                        // 绘制所有碰撞区域
                        collisionConfig.areas.forEach(area => {
                            if (area.points && area.points.length > 2) {
                                g.lineStyle(2, 0x666666, 0.5);
                                g.beginFill(0x666666, 0.2);
                                g.moveTo(area.points[0].x, area.points[0].y);
                                area.points.forEach(point => {
                                    g.lineTo(point.x, point.y);
                                });
                                g.lineTo(area.points[0].x, area.points[0].y);
                                g.endFill();
                            }
                        });
                    }}
                />
            )}
            
            {isDebugMode && (
                <DebugCollisionTool 
                    cameraPosition={cameraPosition}
                />
            )}
            
            <Player 
                onMove={handlePlayerMove} 
                checkCollision={checkCollision}
            />
        </Container>
    );
};

export default FarmScene; 