import Chart, { PluginServiceGlobalRegistration, PluginServiceRegistrationOptions } from 'chart.js';
import { colors } from 'vuetify/lib';

export type ChartPlugin = PluginServiceGlobalRegistration & PluginServiceRegistrationOptions;

export interface VerticalLinePluginOptions {
  lineColor?: string;
  lineWidth?: number;
}

export interface BackgroundColorPluginOptions {
  backgroundColor: string;
}

export class ChartPluginFactory {
  public static createVerticalLinePlugin(options?: VerticalLinePluginOptions): ChartPlugin {
    const { lineColor, lineWidth } = options ?? {};
    return {
      id: 'verticalLinePlugin',
      afterDatasetsDraw(chart: Chart & { tooltip: any; scales: any }): void {
        if (chart.tooltip?._active && chart.tooltip?._active?.length > 0) {
          const activePoint = chart.tooltip._active[0];
          const ctx = chart.ctx;
          const yAxis = Object.entries<{ top: number; bottom: number }>(chart.scales).find(([key]) =>
            key.startsWith('y-axis-')
          )?.[1]; // ensure a y axis has id starting with y-axis-.

          if (!yAxis) {
            throw new Error(
              'No scales with id starting with y-axis- found. Ensure at least one y axis has an id that starts with y-axis-.'
            );
          }

          const x = activePoint.tooltipPosition().x;
          const topY = yAxis.top;
          const bottomY = yAxis.bottom;

          if (!ctx || !topY || !bottomY) {
            return;
          }

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = lineWidth ?? 1;
          ctx.strokeStyle = lineColor ?? colors.grey.darken3;
          ctx.stroke();
          ctx.restore();
        }
      }
    };
  }

  public static createBackgroundColorPlugin(options: BackgroundColorPluginOptions): ChartPlugin {
    const { backgroundColor } = options;
    return {
      beforeDraw(chart: Chart): void {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;

        if (!ctx) {
          return;
        }

        ctx.save();
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        ctx.restore();
      }
    };
  }
}
