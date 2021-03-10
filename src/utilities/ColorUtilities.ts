export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export class ColorUtilities {
  public static hexToRgb(hex: string): ColorRGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  public static rgbToHex(rOrRgb: number | ColorRGB, g?: number, b?: number): string {
    if (typeof rOrRgb === 'number') {
      if (g === undefined || b === undefined) {
        throw new Error('g and b are required when passing number as first argument.');
      }

      return '#' + ((1 << 24) + (rOrRgb << 16) + (g << 8) + b).toString(16).slice(1);
    }

    return '#' + ((1 << 24) + (rOrRgb.r << 16) + (rOrRgb.g << 8) + rOrRgb.b).toString(16).slice(1);
  }

  public static isClose(color1: string | ColorRGB, color2: string | ColorRGB, threshold: number = 30): boolean {
    const color1Rgb = typeof color1 === 'string' ? this.hexToRgb(color1) : color1;
    const color2Rgb = typeof color2 === 'string' ? this.hexToRgb(color2) : color2;

    const distance =
      Math.abs(color1Rgb!.r - color2Rgb!.r) +
      Math.abs(color1Rgb!.g - color2Rgb!.g) +
      Math.abs(color1Rgb!.b - color2Rgb!.b);

    return distance < threshold;
  }
}
