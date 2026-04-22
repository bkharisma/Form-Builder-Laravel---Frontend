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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { FormField } from '../../../types';
import SortableFieldItem from './SortableFieldItem';

interface FieldListProps {
  fields: FormField[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onDelete: (id: string) => void;
}

function FieldList({
  fields,
  onReorder,
  onEdit,
  onDuplicate,
  onToggleEnabled,
  onDelete,
}: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      const fromIndex = fields.findIndex((_, i) => `field_${i}_${fields[i].id}` === activeId);
      const toIndex = fields.findIndex((_, i) => `field_${i}_${fields[i].id}` === overId);

      if (fromIndex !== -1 && toIndex !== -1) {
        onReorder(fromIndex, toIndex);
      }
    }
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-[#f5f5f5] border-2 border-dashed border-[rgba(0,0,0,0.15)] rounded-lg">
        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[#a1a1a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m6.75-9h3.75m-3.75 3h3.75m-3.75 3h3.75M3 9h3.75M3 12h3.75M3 15h3.75M3 18h3.75M9 21h3.75m3.75 0h3.75M3 21h3.75M9 3h6v3H9V3z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-[#1a1a1a]">No fields yet</h3>
        <p className="mt-1 text-sm text-[#737373]">Get started by adding your first form field.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={fields.map((_, i) => `field_${i}_${fields[i].id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1.5 sm:space-y-2">
          {fields.map((field, index) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              index={index}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onToggleEnabled={onToggleEnabled}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default FieldList;