import React, { forwardRef, PropsWithChildren } from "react";

export interface IShape {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  className: string;
}

export const Shape = forwardRef<HTMLDivElement, PropsWithChildren<IShape>>(
  (
    { x, y, width, height, color, text, className }: PropsWithChildren<IShape>,
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: `${color}`,
          position: "absolute"
        }}
      >
        {text}
      </div>
    );
  }
);
