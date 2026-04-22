import { useRef, useState, useEffect, useCallback } from 'react';
import type { FormField } from '../../../types';

interface DynamicSignatureInputProps {
  field: FormField;
  value: string;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string, value: string) => void;
}

function DynamicSignatureInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur: _onBlur,
}: DynamicSignatureInputProps) {
  const hasError = touched && !!error;
  const [isDrawing, setIsDrawing] = useState(!value);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 150;

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (isDrawing) {
      const timer = setTimeout(() => {
        initCanvas();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isDrawing, initCanvas]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange(field.id, '');
    setIsDrawing(true);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onChange(field.id, dataURL);
      setIsDrawing(false);
    }
  };

  const handleRemove = () => {
    onChange(field.id, '');
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  return (
    <div className="space-y-1">
      <label className="block text-base font-semibold text-[#374151]">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isDrawing ? (
        <div>
          <canvas
            ref={canvasRef}
            className={`w-full h-[150px] border-2 rounded-lg bg-white touch-none ${
              hasError ? 'border-red-400' : 'border-[rgba(0,0,0,0.15)]'
            }`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border-2 border-[rgba(0,0,0,0.15)] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f5f5f5]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Confirm Signature
            </button>
          </div>
        </div>
      ) : (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Signature"
            className="w-full max-w-md h-[150px] object-contain border-2 border-[rgba(0,0,0,0.15)] rounded-lg bg-white"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            &times;
          </button>
        </div>
      )}
      {field.help_text && (
        <p className="text-sm text-[#737373] mt-1">{field.help_text}</p>
      )}
      {hasError && (
        <p className="text-red-600 text-sm" role="alert">{error}</p>
      )}
    </div>
  );
}

export default DynamicSignatureInput;
