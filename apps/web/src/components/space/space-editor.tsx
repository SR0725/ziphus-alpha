'use client';
import useQuerySpaceById from '@/hooks/space/useQuerySpaceById';
import React, { useEffect, useRef, useState } from 'react';
import SpaceCardEditor from './space-card-editor';
import useYJSProvide from '@/hooks/card/useYJSProvider';
import { useParams } from 'next/navigation';
import useCreateSpaceCard from '@/hooks/space/useCreateSpaceCard';
import useQueryCardList from '@/hooks/card/useQueryCardList';
import useCreateCard from '@/hooks/card/useCreateCard';

export interface View {
  x: number;
  y: number;
  scale: number;
}

export interface ContextMenu {
  x: number;
  y: number;
}

// 滾輪放大縮小
const useViewScroll = (
  editorRef: React.RefObject<HTMLDivElement>,
  viewRef: React.MutableRefObject<View>,
) => {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onWheel = (event: WheelEvent) => {
      const view = viewRef.current!;
      event.preventDefault();

      const scale = Math.max(
        0.1,
        Math.min(10, view.scale - event.deltaY * 0.0005),
      );
      viewRef.current = {
        x: view.x,
        y: view.y,
        scale,
      };
    };

    editor.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      editor.removeEventListener('wheel', onWheel);
    };
  }, []);
};

// 右鍵單點招喚選單
const useViewContextMenu = (
  editorRef: React.RefObject<HTMLDivElement>,
  setContextMenu: (contextMenu: ContextMenu | null) => void,
  contextMenuComponentRef: React.RefObject<HTMLDivElement>,
) => {
  const mouseDownTimeRef = useRef(0);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (Date.now() - mouseDownTimeRef.current > 200) return;
      const editor = editorRef.current;
      if (!editor) return;
      const rect = editor.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setContextMenu({
        x,
        y,
      });
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) {
        mouseDownTimeRef.current = Date.now();
      }

      // 如果點擊到選單以外的地方，就關閉選單
      if (
        contextMenuComponentRef.current &&
        !contextMenuComponentRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    editor.addEventListener('contextmenu', onContextMenu);
    editor.addEventListener('mousedown', handleMouseDown);

    return () => {
      editor.removeEventListener('contextmenu', onContextMenu);
      editor.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
};

// 右鍵按住拖曳
const useViewDrag = (
  editorRef: React.RefObject<HTMLDivElement>,
  viewRef: React.MutableRefObject<View>,
  availableMove: boolean = true,
) => {
  const prevXRef = useRef(0);
  const prevYRef = useRef(0);
  const isDraggingRef = useRef(false);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!availableMove) return;
      if (event.button === 2) {
        isDraggingRef.current = true;
        prevXRef.current = event.clientX;
        prevYRef.current = event.clientY;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!availableMove) return;
      if (isDraggingRef.current) {
        const view = viewRef.current!;
        const deltaX = event.clientX - prevXRef.current;
        const deltaY = event.clientY - prevYRef.current;
        prevXRef.current = event.clientX;
        prevYRef.current = event.clientY;
        viewRef.current = {
          x: view.x + deltaX,
          y: view.y + deltaY,
          scale: view.scale,
        };
      }
    };

    const onMouseUp = () => {
      if (!availableMove) return;
      isDraggingRef.current = false;
    };

    editor.addEventListener('mousedown', onMouseDown);
    editor.addEventListener('mousemove', onMouseMove);
    editor.addEventListener('mouseup', onMouseUp);

    return () => {
      editor.removeEventListener('mousedown', onMouseDown);
      editor.removeEventListener('mousemove', onMouseMove);
      editor.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return isDraggingRef;
};

// 隨時更新視差效果
const useViewTransformUpdate = (
  parallaxBoardRef: React.RefObject<HTMLDivElement>,
  viewRef: React.MutableRefObject<View>,
) => {
  const lastViewRef = useRef<View>({
    x: 0,
    y: 0,
    scale: 1,
  });
  useEffect(() => {
    let animationFrameId = 0;
    function handleViewChange() {
      animationFrameId = requestAnimationFrame(handleViewChange);
      const parallaxBoard = parallaxBoardRef.current;
      if (!parallaxBoard) return;
      if (
        lastViewRef.current.x === viewRef.current.x &&
        lastViewRef.current.y === viewRef.current.y &&
        lastViewRef.current.scale === viewRef.current.scale
      ) {
        return;
      }

      parallaxBoard.style.transform = `translate(${viewRef.current.x}px, ${viewRef.current.y}px) scale(${viewRef.current.scale})`;
      lastViewRef.current = { ...viewRef.current };
    }
    handleViewChange();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
};

// contextMenu: 右鍵選單
interface ContextMenuComponentProps {
  contextMenu: ContextMenu | null;
  viewRef: React.MutableRefObject<View>;
  spaceId: string;
}
const ContextMenuComponent = React.forwardRef(
  ({ contextMenu, viewRef, spaceId }: ContextMenuComponentProps, ref) => {
    const mutateCreateSpaceCard = useCreateSpaceCard();
    const mutateCreateCard = useCreateCard();
    const { cards } = useQueryCardList();

    return (
      <div
        className={`absolute flex h-fit w-fit flex-col gap-2 rounded-md bg-gray-800 p-2 text-gray-100 ${contextMenu ? '' : 'hidden'
          }`}
        style={{
          left: contextMenu ? contextMenu.x : 0,
          top: contextMenu ? contextMenu.y : 0,
        }}
        ref={ref as React.RefObject<HTMLDivElement>}
      >
        <button
          className="h-fit w-full cursor-pointer rounded px-2 py-1 text-left transition-all duration-300 hover:bg-gray-700"
          onClick={() =>
            mutateCreateCard.mutate(undefined, {
              onSuccess: (data) => {
                console.log('新增卡片成功', data.data);
                const view = viewRef.current;
                mutateCreateSpaceCard.mutate(
                  {
                    spaceId,
                    targetCardId: data.data.card.id,
                    x: view.x + (contextMenu?.x || 0) / view.scale,
                    y: view.y + (contextMenu?.y || 0) / view.scale,
                  },
                  {
                    onSuccess: (data: any) => {
                      console.log('新增卡片成功', data.data);
                    },
                  },
                );
              },
              onError: (error) => {
                console.error('新增卡片失敗', error);
              },
            })
          }
        >
          新增卡片
        </button>
        {/* <button className="h-fit w-full cursor-pointer rounded px-2 py-1 text-left transition-all duration-300 hover:bg-gray-700">
          將現有卡片加入
        </button> */}
      </div>
    );
  },
);

export default function SpaceEditor() {
  const { id } = useParams();
  const spaceId = id as string;
  const { space } = useQuerySpaceById(spaceId);
  const { doc, provider, status } = useYJSProvide({
    spaceId,
  });
  const viewRef = useRef<View>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const whiteBoardRef = useRef<HTMLDivElement>(null);
  const parallaxBoardRef = useRef<HTMLDivElement | null>(null);
  const contextMenuComponentRef = useRef<HTMLDivElement | null>(null);
  const [focusSpaceCardId, setFocusSpaceCardId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  useViewScroll(whiteBoardRef, viewRef);
  const isDraggingRef = useViewDrag(
    whiteBoardRef,
    viewRef,
    !focusSpaceCardId,
  );
  useViewContextMenu(whiteBoardRef, setContextMenu, contextMenuComponentRef);
  useViewTransformUpdate(parallaxBoardRef, viewRef);

  return (
    <div
      ref={whiteBoardRef}
      className="relative h-full w-full overflow-hidden bg-black"
    >
      {/* 內容 */}
      <div className=" origin-top-left" ref={parallaxBoardRef}>
        {space?.spaceCards.map((spaceCard) => (
          <SpaceCardEditor
            key={spaceCard.id}
            initialSpaceCard={spaceCard}
            socketIOProvider={provider}
            doc={doc}
            focusSpaceCardId={focusSpaceCardId}
            onFocus={() => setFocusSpaceCardId(spaceCard.id)}
            onBlur={() => setFocusSpaceCardId(null)}
          />
        ))}
      </div>
      {/* 右鍵生成選單 */}
      <ContextMenuComponent
        contextMenu={contextMenu}
        ref={contextMenuComponentRef}
        viewRef={viewRef}
        spaceId={spaceId}
      />
    </div>
  );
}