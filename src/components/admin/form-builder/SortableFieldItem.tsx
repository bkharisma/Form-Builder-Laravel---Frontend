import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField } from '../../../types';

interface SortableFieldItemProps {
  field: FormField;
  index: number;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableFieldItem({
  field,
  index,
  onEdit,
  onDuplicate,
  onToggleEnabled,
  onDelete,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `field_${index}_${field.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeLabels: Record<string, string> = {
    text: 'Text',
    textarea: 'Text Area',
    email: 'Email',
    number: 'Number',
    tel: 'Phone',
    select: 'Dropdown',
    checkbox: 'Checkbox',
    date: 'Date',
    time: 'Time',
    file_upload: 'File Upload',
    image_upload: 'Image Upload',
    signature: 'Signature',
    radio: 'Radio Button',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-3 sm:p-4 ${isDragging ? 'shadow-lg' : 'shadow-sm'} ${
        field.enabled ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 sm:mt-1 cursor-grab active:cursor-grabbing text-[#a1a1a1] hover:text-[#1a1a1a] focus:outline-none"
          title="Drag to reorder"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <h4 className="text-sm sm:text-base font-medium text-[#1a1a1a] truncate">{field.label}</h4>
            {field.required && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-red-100 text-red-700 rounded flex-shrink-0">
                Required
              </span>
            )}
            {!field.enabled && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-[#f0f0f0] text-[#525252] rounded flex-shrink-0">
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#737373] mt-1 truncate">
            {typeLabels[field.type]}
            {field.placeholder && ` · "${field.placeholder}"`}
          </p>
          {field.help_text && (
            <p className="text-xs sm:text-sm text-[#a1a1a1] mt-0.5 truncate">{field.help_text}</p>
          )}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => onEdit(field.id)}
            className="p-1 sm:p-1.5 text-[#a1a1a1] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] rounded"
            title="Edit field"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(field.id)}
            className="p-1 sm:p-1.5 text-[#a1a1a1] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] rounded"
            title="Duplicate field"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125h3.75V4.875c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v12.375z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onToggleEnabled(field.id)}
            className={`p-1 sm:p-1.5 rounded ${
              field.enabled
                ? 'text-[#a1a1a1] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]'
                : 'text-[#525252] hover:bg-[#f0f0f0]'
            }`}
            title={field.enabled ? 'Disable field' : 'Enable field'}
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(field.id)}
            className="p-1 sm:p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete field"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.678-.118 1.022-.166m0 0l.346 9m4.788-9L6.625 19.5m13.482-14.636l-.346 9M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SortableFieldItem;