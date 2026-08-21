import { findByProps } from "@vendetta/metro";

// Token namespace — same lookup Bunny itself uses for theming
const tokenReference: any = findByProps("SemanticColor");

// Default export holds colors / unsafe_rawColors / space / radii / modules / internal
export const Themes = tokenReference.default;

export const colors = Themes.colors;
export const rawColors = Themes.unsafe_rawColors;
export const space = Themes.space;
export const radii = Themes.radii;

// Internal resolver — the SAME function object Bunny patches for theme injection
const internalResolver = tokenReference.default.meta ?? tokenReference.default.internal;

// useTheme hook
const UseThemeMod: any = findByProps("useThemeIndex", "getThemeIndex");

export const TILE = 48;
export const MARGIN = 4;

export const CompassIcon = findByProps("CompassIcon").CompassIcon;
export const CircleXIcon = findByProps("CircleXIcon").CircleXIcon;
export const CheckmarkLargeIcon = findByProps("CheckmarkLargeIcon").CheckmarkLargeIcon;

const WrapperStylesMod = findByProps("useGuildsBarAnimatedWrapperStyles");

export function useStockTileStyles() {
    return WrapperStylesMod.useGuildsBarAnimatedWrapperStyles();
}

// Resolve a semantic token descriptor ({ [Symbol]: NAME }) to a real color through
// the client's own resolver so Bunny/Vendetta theme injection applies.
// Must be called during render (it consumes the useTheme hook internally).
export function resolve(token: any): string {
    return internalResolver.resolveSemanticColor(UseThemeMod.useTheme(), token);
}

export interface Palette {
    pageBg: string;
    surfaceLow: string;
    surfaceHigh: string;
    card: string;
    input: string;
    modSubtle: string;
    borderSubtle: string;
    brand: string;
    positive: string;
}

export function usePalette(): Palette {
    const theme = UseThemeMod.useTheme();
    const r = (token: any) => internalResolver.resolveSemanticColor(theme, token);
    return {
        pageBg: r(colors.BACKGROUND_BASE_LOWEST),
        surfaceLow: r(colors.BACKGROUND_BASE_LOW),
        surfaceHigh: r(colors.BACKGROUND_SURFACE_HIGH),
        card: r(colors.CARD_BACKGROUND_DEFAULT),
        input: r(colors.INPUT_BACKGROUND_DEFAULT),
        modSubtle: r(colors.BACKGROUND_MOD_SUBTLE),
        borderSubtle: r(colors.BORDER_SUBTLE),
        brand: r(colors.BACKGROUND_BRAND),
        positive: rawColors.GREEN_600,
    };
}

// Spacing / radius helpers using the client's scales
export const px = (n: number): number => space[`PX_${n}`];
export const RADIUS = {
    sm: radii.sm,
    md: radii.md,
    lg: radii.lg,
    round: radii.round,
};
