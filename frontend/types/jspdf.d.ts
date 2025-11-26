declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any)
    text(text: string, x: number, y: number, options?: any): void
    setFontSize(size: number): void
    setFont(font: string, style: string): void
    setTextColor(r: number, g: number, b: number): void
    setFillColor(r: number, g: number, b: number): void
    rect(x: number, y: number, w: number, h: number, style?: string): void
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void
    save(filename: string): void
    internal: {
      pageSize: {
        getWidth(): number
        getHeight(): number
      }
    }
  }
}

declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf'

  interface AutoTableOptions {
    startY?: number
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    theme?: 'striped' | 'grid' | 'plain'
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    margin?: { left?: number; right?: number; top?: number; bottom?: number }
    columnStyles?: Record<number, any>
    didParseCell?: (data: any) => void
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void
}
