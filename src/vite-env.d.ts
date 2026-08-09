/// <reference types="vite/client" />

declare module 'bwip-js' {
  export interface RenderOptions {
    bcid: string;
    text: string;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textxalign?: 'left' | 'center' | 'right' | 'justify';
    textyalign?: 'top' | 'center' | 'bottom';
    backgroundcolor?: string;
    barcolor?: string;
    bordercolor?: string;
    borderwidth?: number;
    borderpadding?: number;
    showborder?: boolean;
  }

  export function toCanvas(
    canvas: HTMLCanvasElement | string,
    options: RenderOptions
  ): HTMLCanvasElement;
}
