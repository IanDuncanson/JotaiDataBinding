import React, { forwardRef, PropsWithChildren } from "react";

export interface IBox {
  /** Class name */
  className?: string;
  width: number;
  height: number;
  color: string;
}

export const Box = forwardRef<HTMLDivElement, PropsWithChildren<IBox>>(
  (
    { children, width, height, color, className }: PropsWithChildren<IBox>,
    ref
  ) => {
    return (
      <div
        className={className}
        ref={ref}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: `${color}`,
          position: "relative"
        }}
      >
        {children}
      </div>
    );
  }
);

Box.displayName = "Box";
