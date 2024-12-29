import { Container, Graphics } from '@pixi/react';
import { useState, useCallback, useEffect } from 'react';

const PositionCollector = ({ cameraPosition }) => {
    const [positions, setPositions] = useState([]);
    const [currentType, setCurrentType] = useState('tree');
    const [debugKey, setDebugKey] = useState(0);

    const types = ['tree', 'fruitTree', 'rock', 'cow', 'chicken', 'crop'];
    const typeColors = {
        tree: 0x2D5A27,
        fruitTree: 0x3B7A3B,
        rock: 0x808080,
        cow: 0xFFFFFF,
        chicken: 0xFFD700,
        crop: 0x8B4513
    };

    const handleClick = useCallback((e) => {
        if (e.button !== 2) return; // 只响应右键
        e.preventDefault();
        
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - cameraPosition.x;
        const y = e.clientY - rect.top - cameraPosition.y;
        
        setPositions(prev => [...prev, { type: currentType, x, y }]);
        setDebugKey(prev => prev + 1);
    }, [currentType, cameraPosition]);

    useEffect(() => {
        // 创建控制面板
        const controlsDiv = document.createElement('div');
        controlsDiv.style.position = 'fixed';
        controlsDiv.style.top = '10px';
        controlsDiv.style.left = '10px';
        controlsDiv.style.zIndex = '1000';
        controlsDiv.style.display = 'flex';
        controlsDiv.style.flexDirection = 'column';
        controlsDiv.style.gap = '10px';

        // 类型选择器容器
        const typeSelectorDiv = document.createElement('div');
        typeSelectorDiv.style.display = 'flex';
        typeSelectorDiv.style.gap = '5px';
        typeSelectorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        typeSelectorDiv.style.padding = '5px';
        typeSelectorDiv.style.borderRadius = '3px';

        // 创建类型按钮
        types.forEach(type => {
            const typeButton = document.createElement('button');
            typeButton.textContent = type;
            typeButton.style.padding = '5px 10px';
            typeButton.style.backgroundColor = type === currentType ? '#4CAF50' : '#666';
            typeButton.style.color = 'white';
            typeButton.style.border = 'none';
            typeButton.style.borderRadius = '3px';
            typeButton.style.cursor = 'context-menu';
            
            typeButton.addEventListener('mousedown', (e) => {
                if (e.button !== 2) return; // 只响应右键
                e.preventDefault();
                setCurrentType(type);
                // 更新所有按钮样式
                typeSelectorDiv.querySelectorAll('button').forEach(btn => {
                    btn.style.backgroundColor = btn.textContent === type ? '#4CAF50' : '#666';
                });
            });
            typeButton.addEventListener('contextmenu', e => e.preventDefault());
            typeSelectorDiv.appendChild(typeButton);
        });

        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';

        // 清除按钮
        const clearButton = document.createElement('button');
        clearButton.textContent = '清除';
        clearButton.addEventListener('mousedown', (e) => {
            if (e.button !== 2) return; // 只响应右键
            e.preventDefault();
            setPositions([]);
            setDebugKey(prev => prev + 1);
        });

        // 撤销按钮
        const undoButton = document.createElement('button');
        undoButton.textContent = '撤销';
        undoButton.addEventListener('mousedown', (e) => {
            if (e.button !== 2) return; // 只响应右键
            e.preventDefault();
            setPositions(prev => prev.slice(0, -1));
            setDebugKey(prev => prev + 1);
        });

        // 导出按钮
        const exportButton = document.createElement('button');
        exportButton.textContent = '导出';
        exportButton.addEventListener('mousedown', (e) => {
            if (e.button !== 2) return; // 只响应右键
            e.preventDefault();
            const grouped = positions.reduce((acc, pos) => {
                if (!acc[pos.type]) {
                    acc[pos.type] = [];
                }
                acc[pos.type].push({
                    id: `${pos.type}_${acc[pos.type].length + 1}`,
                    position: { x: pos.x, y: pos.y }
                });
                return acc;
            }, {});

            const config = {
                trees: grouped.tree || [],
                fruitTrees: grouped.fruitTree || [],
                rocks: grouped.rock || [],
                cows: grouped.cow || [],
                chickens: grouped.chicken || [],
                crops: grouped.crop || []
            };

            console.log('导出配置:', JSON.stringify(config, null, 2));
        });

        // 为所有按钮添加统一样式
        [clearButton, undoButton, exportButton].forEach(button => {
            button.style.backgroundColor = '#666';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.style.padding = '5px 10px';
            button.style.cursor = 'context-menu';
            button.addEventListener('contextmenu', e => e.preventDefault());
        });

        buttonContainer.appendChild(clearButton);
        buttonContainer.appendChild(undoButton);
        buttonContainer.appendChild(exportButton);

        controlsDiv.appendChild(typeSelectorDiv);
        controlsDiv.appendChild(buttonContainer);
        document.body.appendChild(controlsDiv);

        // 添加画布事件
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', e => e.preventDefault());
            canvas.addEventListener('mousedown', handleClick);
        }

        // 添加提示文本
        const tipDiv = document.createElement('div');
        tipDiv.style.position = 'fixed';
        tipDiv.style.bottom = '10px';
        tipDiv.style.left = '10px';
        tipDiv.style.color = '#00FF00';
        tipDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tipDiv.style.padding = '5px 10px';
        tipDiv.style.borderRadius = '3px';
        tipDiv.style.zIndex = '1000';
        tipDiv.textContent = `当前类型: ${currentType} | 右键点击添加点`;

        document.body.appendChild(tipDiv);

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousedown', handleClick);
            }
            if (document.body.contains(controlsDiv)) {
                document.body.removeChild(controlsDiv);
            }
            if (document.body.contains(tipDiv)) {
                document.body.removeChild(tipDiv);
            }
        };
    }, [handleClick, currentType, types]);

    return (
        <Graphics
            key={debugKey}
            draw={g => {
                g.clear();
                positions.forEach(pos => {
                    g.beginFill(typeColors[pos.type]);
                    g.drawCircle(pos.x, pos.y, 5);
                    g.endFill();
                });
            }}
        />
    );
};

export default PositionCollector; 