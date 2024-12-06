declare module 'simple-statistics' {
  export function linearRegression(data: Array<[number, number]>): { m: number; b: number };
  export function linearRegressionLine(regression: { m: number; b: number }): (x: number) => number;
}

declare module 'chartjs-node-canvas' {
  export class ChartJSNodeCanvas {
    constructor(options: { width: number; height: number; backgroundColour?: string });
    renderToBuffer(configuration: any): Promise<Buffer>;
  }
}

declare module 'date-fns' {
  export function format(date: Date | number, format: string): string;
  export function subMonths(date: Date | number, amount: number): Date;
}
