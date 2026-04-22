import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export interface UseFieldDragDropReturn {
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent, onReorder: (fromIndex: number, toIndex: number) => void) => void;
}

export function useFieldDragDrop(): UseFieldDragDropReturn {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent, onReorder: (fromIndex: number, toIndex: number) => void) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const activeId = active.id as string;
        const overId = over.id as string;

        const fromIndex = parseInt(activeId.split('_')[1], 10);
        const toIndex = parseInt(overId.split('_')[1], 10);

        if (!isNaN(fromIndex) && !isNaN(toIndex)) {
          onReorder(fromIndex, toIndex);
        }
      }
    },
    []
  );

  return {
    sensors,
    handleDragEnd,
  };
}

export { DndContext, closestCenter, SortableContext, verticalListSortingStrategy, arrayMove };