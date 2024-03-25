'use client';
import { useRef, useEffect } from 'react';
import { SketchCanvasProvider } from '../hooks/useSketchCanvasProvider';
import { useResizeListener } from '../hooks/useResizeListener';
import drawCircle from '../utils/draw-circle';
import drawLine from '../utils/draw-line';
import { Circle, Line, ShapeType } from '../models/shapes';

interface SketchCanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
    provider: SketchCanvasProvider;
    handleStartDraw?: (x: number, y: number) => void;
    handleMoveDraw?: (x: number, y: number) => void;
    handleEndDraw?: () => void;
}

export const SketchCanvas: React.FC<SketchCanvasProps> = ({
    provider,
    handleStartDraw,
    handleMoveDraw,
    handleEndDraw,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { getShapes } = provider;
    useResizeListener(canvasRef);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            getShapes().forEach((shape) => {
                if (shape.type === ShapeType.Circle) {
                    drawCircle(ctx, shape as Circle);
                } else if (shape.type === ShapeType.Line) {
                    drawLine(ctx, shape as Line);
                }
            });
        }
    }, [getShapes()]);

    return (
        <canvas
            {...props}
            ref={canvasRef}
            onMouseDown={(event) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                if (handleStartDraw) {
                    handleStartDraw(x, y);
                }
            }}
            onMouseMove={(event) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                if (handleMoveDraw) {
                    handleMoveDraw(x, y);
                }
            }}
            onMouseUp={() => {
                if (handleEndDraw) {
                    handleEndDraw();
                }
            }}
            onTouchStart={(event) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect || !event.touches[0]) return;
                const x = event.touches[0].clientX - rect.left;
                const y = event.touches[0].clientY - rect.top;
                if (handleStartDraw) {
                    handleStartDraw(x, y);
                }
            }}
            onTouchMove={(event) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect || !event.touches[0]) return;
                const x = event.touches[0].clientX - rect.left;
                const y = event.touches[0].clientY - rect.top;
                if (handleMoveDraw) {
                    handleMoveDraw(x, y);
                }
            }}
            onTouchEnd={() => {
                if (handleEndDraw) {
                    handleEndDraw();
                }
            }}
        />
    );
};
