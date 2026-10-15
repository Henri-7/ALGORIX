import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';
export function SvgViewport({
  width,
  height,
  left = 0,
  label,
  children,
}: {
  width: number;
  height: number;
  left?: number;
  label: string;
  children: ReactNode;
}) {
  const [zoom, setZoom] = useState(1),
    viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = viewport.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [width, zoom]);
  return (
    <div className="svg-viewport">
      <div className="svg-tools">
        <span>Arraste a barra de rolagem ou deslize para explorar</span>
        <button
          className="icon-button"
          aria-label="Diminuir zoom"
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
          disabled={zoom <= 0.25}
        >
          <Minus size={16} />
        </button>
        <span className="mono">{Math.round(zoom * 100)}%</span>
        <button
          className="icon-button"
          aria-label="Aumentar zoom"
          onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
          disabled={zoom >= 2}
        >
          <Plus size={16} />
        </button>
        <button
          className="icon-button"
          aria-label="Ajustar visualização"
          onClick={() => setZoom(Math.min(1, (viewport.current?.clientWidth ?? width) / width))}
        >
          <Maximize2 size={16} />
        </button>
      </div>
      <div
        className="svg-scroll"
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label="Área visual com rolagem"
      >
        <svg
          viewBox={`${left} 0 ${width} ${height}`}
          style={{ width: width * zoom, height: height * zoom, minWidth: '100%' }}
          aria-label={label}
          role="group"
        >
          {children}
        </svg>
      </div>
    </div>
  );
}
