import { useCallback, useEffect, useState } from 'react';
import DebugCollisionTool from './DebugCollisionTool';
import PositionCollector from './PositionCollector';

const DevTools = ({ cameraPosition }) => {
    const [currentTool, setCurrentTool] = useState(null); // null, 'debug', 'position'

    useEffect(() => {
        // 创建工具切换按钮
        const switchButton = document.createElement('button');
        switchButton.style.position = 'fixed';
        switchButton.style.top = '10px';
        switchButton.style.right = '10px';
        switchButton.style.zIndex = '1000';
        switchButton.style.padding = '5px 10px';
        switchButton.style.backgroundColor = '#666';
        switchButton.style.color = 'white';
        switchButton.style.border = 'none';
        switchButton.style.borderRadius = '3px';
        switchButton.style.cursor = 'pointer';

        const updateButtonText = () => {
            switch (currentTool) {
                case null:
                    switchButton.textContent = '开启调试工具';
                    switchButton.style.backgroundColor = '#666';
                    break;
                case 'debug':
                    switchButton.textContent = '切换到位置工具';
                    switchButton.style.backgroundColor = '#4CAF50';
                    break;
                case 'position':
                    switchButton.textContent = '关闭工具';
                    switchButton.style.backgroundColor = '#FF9800';
                    break;
            }
        };

        updateButtonText();

        switchButton.addEventListener('click', () => {
            setCurrentTool(current => {
                switch (current) {
                    case null:
                        return 'debug';
                    case 'debug':
                        return 'position';
                    case 'position':
                        return null;
                    default:
                        return null;
                }
            });
        });

        document.body.appendChild(switchButton);

        return () => {
            if (document.body.contains(switchButton)) {
                document.body.removeChild(switchButton);
            }
        };
    }, [currentTool]);

    return (
        <>
            {currentTool === 'debug' && (
                <DebugCollisionTool cameraPosition={cameraPosition} />
            )}
            {currentTool === 'position' && (
                <PositionCollector cameraPosition={cameraPosition} />
            )}
        </>
    );
};

export default DevTools; 