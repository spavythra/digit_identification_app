import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

const DrawCanvas = forwardRef(function DrawCanvas({ size = 280 }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  useImperativeHandle(ref, () => ({
    getBlob: (cb) => canvasRef.current.toBlob(cb, 'image/png'),
    clear: () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);
      setHasStrokes(false);
    },
    hasStrokes,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
  }, [size]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: ((src.clientX - rect.left) * size) / rect.width,
      y: ((src.clientY - rect.top) * size) / rect.height,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e);
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasStrokes(true);
  }

  function stopDraw() {
    drawing.current = false;
    lastPos.current = null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ touchAction: 'none', cursor: 'crosshair', display: 'block', borderRadius: '12px' }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={stopDraw}
      onMouseLeave={stopDraw}
      onTouchStart={startDraw}
      onTouchMove={draw}
      onTouchEnd={stopDraw}
      aria-label="Drawing canvas — draw a single digit here"
      role="img"
    />
  );
});

export default DrawCanvas;
