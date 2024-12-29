import { Container, Graphics } from '@pixi/react';
import { useCallback } from 'react';

const Tree = ({ 
    id, 
    type = 'pine',
    position, 
    scale = [1, 1],
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

    return (
        <Container 
            position={[position.x, position.y]}
            interactive={canInteract}
            cursor={canInteract ? 'pointer' : 'default'}
            pointerdown={handleClick}
        >
            <Graphics
                draw={g => {
                    // 清除之前的绘制
                    g.clear();
                    
                    // 绘制树干
                    g.beginFill(0x8B4513);
                    g.drawRect(-5, -10, 10, 20);
                    g.endFill();
                    
                    // 绘制树冠
                    g.beginFill(type === 'pine' ? 0x2E8B57 : 0x228B22);
                    if (type === 'pine') {
                        // 松树：三角形
                        g.drawPolygon([
                            -20, 10,  // 左下
                            0, -30,   // 顶部
                            20, 10    // 右下
                        ]);
                    } else {
                        // 橡树：圆形
                        g.drawCircle(0, -15, 20);
                    }
                    g.endFill();
                }}
            />
        </Container>
    );
};

export default Tree; 