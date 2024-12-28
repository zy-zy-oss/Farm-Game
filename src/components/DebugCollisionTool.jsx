import { Graphics } from '@pixi/react';
import { useState, useCallback, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import collisionConfig from '../config/collisionAreas.json';

const DebugCollisionTool = ({ cameraPosition, onCollisionAreasChange }) => {
    const [activeArea, setActiveArea] = useState(0);
    const [collisionAreas, setCollisionAreas] = useState(collisionConfig.areas);
    const [debugKey, setDebugKey] = useState(0);

    // 处理点击事件，收集坐标点
    const handleDebugClick = useCallback((e) => {
        if (e.button !== 2) return;
        e.preventDefault();
        
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - cameraPosition.x;
        const y = e.clientY - rect.top - cameraPosition.y;
        
        setCollisionAreas(areas => {
            const newAreas = [...areas];
            newAreas[activeArea] = {
                ...newAreas[activeArea],
                points: [...(newAreas[activeArea].points || []), { x, y }]
            };
            return newAreas;
        });
        setDebugKey(prev => prev + 1);
        
        if (onCollisionAreasChange) {
            onCollisionAreasChange(collisionAreas);
        }
    }, [cameraPosition, activeArea, onCollisionAreasChange]);

    // 创建和管理调试UI
    useEffect(() => {
        const controlsDiv = document.createElement('div');
        controlsDiv.style.position = 'fixed';
        controlsDiv.style.top = '10px';
        controlsDiv.style.left = '10px';
        controlsDiv.style.zIndex = '1000';
        controlsDiv.style.display = 'flex';
        controlsDiv.style.flexDirection = 'column';
        controlsDiv.style.gap = '10px';

        // 区域选择器容器
        const areaSelectorDiv = document.createElement('div');
        areaSelectorDiv.style.display = 'flex';
        areaSelectorDiv.style.gap = '5px';
        areaSelectorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        areaSelectorDiv.style.padding = '5px';
        areaSelectorDiv.style.borderRadius = '3px';

        // 创建区域切换按钮
        collisionAreas.forEach((area, index) => {
            const areaButton = document.createElement('button');
            areaButton.textContent = area.name;
            areaButton.style.padding = '5px 10px';
            areaButton.style.cursor = 'context-menu';
            areaButton.style.backgroundColor = index === activeArea ? '#4CAF50' : '#666';
            areaButton.style.color = 'white';
            areaButton.style.border = 'none';
            areaButton.style.borderRadius = '3px';
            
            areaButton.addEventListener('mousedown', (e) => {
                if (e.button !== 2) return;
                e.preventDefault();
                setActiveArea(index);
                // 更新所有按钮的样式
                areaSelectorDiv.querySelectorAll('button').forEach((btn, idx) => {
                    btn.style.backgroundColor = idx === index ? '#4CAF50' : '#666';
                });
            });
            areaButton.addEventListener('contextmenu', (e) => e.preventDefault());
            areaSelectorDiv.appendChild(areaButton);
        });

        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';

        // 清除按钮
        const clearButton = document.createElement('button');
        clearButton.textContent = '清除当前区域';
        clearButton.style.padding = '5px 10px';
        clearButton.style.cursor = 'context-menu';
        clearButton.addEventListener('mousedown', (e) => {
            if (e.button !== 2) return;
            e.preventDefault();
            setCollisionAreas(areas => {
                const newAreas = [...areas];
                newAreas[activeArea] = { ...newAreas[activeArea], points: [] };
                return newAreas;
            });
            setDebugKey(prev => prev + 1);
        });

        // 撤销按钮
        const undoButton = document.createElement('button');
        undoButton.textContent = '撤销';
        undoButton.style.padding = '5px 10px';
        undoButton.style.cursor = 'context-menu';
        undoButton.addEventListener('mousedown', (e) => {
            if (e.button !== 2) return;
            e.preventDefault();
            setCollisionAreas(areas => {
                const newAreas = [...areas];
                newAreas[activeArea] = {
                    ...newAreas[activeArea],
                    points: (newAreas[activeArea].points || []).slice(0, -1)
                };
                return newAreas;
            });
            setDebugKey(prev => prev + 1);
        });

        // 导出按钮
        const exportButton = document.createElement('button');
        exportButton.textContent = '导出所有区域';
        exportButton.style.padding = '5px 10px';
        exportButton.style.cursor = 'context-menu';
        exportButton.addEventListener('mousedown', (e) => {
            if (e.button !== 2) return;
            e.preventDefault();
            const exportData = {
                areas: collisionAreas
            };
            const formattedData = JSON.stringify(exportData, null, 2);
            navigator.clipboard.writeText(formattedData);
            console.log('Exported collision config:', formattedData);
        });

        // 为所有按钮添加统一样式
        [clearButton, undoButton, exportButton].forEach(button => {
            button.style.backgroundColor = '#666';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.addEventListener('contextmenu', (e) => e.preventDefault());
        });

        buttonContainer.appendChild(clearButton);
        buttonContainer.appendChild(undoButton);
        buttonContainer.appendChild(exportButton);

        controlsDiv.appendChild(areaSelectorDiv);
        controlsDiv.appendChild(buttonContainer);
        document.body.appendChild(controlsDiv);

        // 添加画布事件
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            canvas.addEventListener('mousedown', handleDebugClick);
        }

        // 提示文本
        const tipDiv = document.createElement('div');
        tipDiv.style.position = 'fixed';
        tipDiv.style.bottom = '10px';
        tipDiv.style.left = '10px';
        tipDiv.style.color = '#00FF00';
        tipDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tipDiv.style.padding = '5px 10px';
        tipDiv.style.borderRadius = '3px';
        tipDiv.style.zIndex = '1000';
        tipDiv.textContent = `当前编辑: ${collisionAreas[activeArea].name} | 右键点击添加点`;

        document.body.appendChild(tipDiv);

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousedown', handleDebugClick);
            }
            if (document.body.contains(controlsDiv)) {
                document.body.removeChild(controlsDiv);
            }
            if (document.body.contains(tipDiv)) {
                document.body.removeChild(tipDiv);
            }
        };
    }, [handleDebugClick, collisionAreas, activeArea]);

    return (
        <Graphics
            key={debugKey}
            draw={(g) => {
                g.clear();
                
                // 绘制所有区域
                collisionAreas.forEach((area, areaIndex) => {
                    const points = area.points || [];
                    if (points.length === 0) return;

                    // 当前编辑的区域用绿色，其他区域用灰色
                    const color = areaIndex === activeArea ? 0x00FF00 : 0x666666;
                    const alpha = areaIndex === activeArea ? 1 : 0.5;

                    g.lineStyle(2, color, alpha);
                    g.moveTo(points[0].x, points[0].y);
                    points.forEach(point => {
                        g.lineTo(point.x, point.y);
                    });
                    if (points.length > 2) {
                        g.lineTo(points[0].x, points[0].y);
                    }

                    // 只为当前编辑的区域显示点和序号
                    if (areaIndex === activeArea) {
                        points.forEach((point, index) => {
                            g.beginFill(color);
                            g.drawCircle(point.x, point.y, 5);
                            g.endFill();

                            const text = new PIXI.Text(index.toString(), {
                                fontSize: 16,
                                fill: color
                            });
                            text.position.set(point.x + 10, point.y + 10);
                            g.addChild(text);
                        });
                    }
                });
            }}
        />
    );
};

export default DebugCollisionTool; 