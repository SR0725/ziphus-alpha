import { cn } from '@/utils/cn';
import { EraserInfo } from '@/hooks/card/useCardEditor';

const eraserWidths = [4, 16, 32, 64];

interface CardEditorHeadToolbarEraserProps {
  eraserInfo: EraserInfo;
  setEraserInfo: (info: EraserInfo) => void;
}
function CardEditorHeadToolbarEraser({
  eraserInfo,
  setEraserInfo,
}: CardEditorHeadToolbarEraserProps) {
  return (
    <div className="flex items-center gap-2">
      {eraserWidths.map((width) => (
        <button
          key={width}
          className={cn(
            'h-6 rounded-full border',
            eraserInfo.eraserSize === width
              ? 'border-gray-200'
              : 'border-transparent',
          )}
          style={{
            width: `${width}px`,
            backgroundColor: eraserInfo.eraserSize === width ? 'gray' : 'white',
          }}
          onClick={() =>
            setEraserInfo({
              eraserSize: width,
            })
          }
        />
      ))}
    </div>
  );
}

export default CardEditorHeadToolbarEraser;
