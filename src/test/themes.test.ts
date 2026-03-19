import { describe, it, expect } from "vitest";
import {
  getTheme,
  getThemeList,
  getLightThemes,
  getDarkThemes,
  themes,
} from "@/lib/themes";

describe("themes", () => {
  it("should have at least 10 themes defined", () => {
    const themeKeys = Object.keys(themes);
    expect(themeKeys.length).toBeGreaterThanOrEqual(10);
  });

  it("should have wechat-classic as default theme", () => {
    const theme = getTheme("wechat-classic");
    expect(theme).toBeDefined();
    expect(theme.id).toBe("wechat-classic");
    expect(theme.nameKey).toBe("themes.wechatClassic");
  });

  it("should have both light and dark themes", () => {
    const lightThemes = getLightThemes();
    const darkThemes = getDarkThemes();
    expect(lightThemes.length).toBeGreaterThan(0);
    expect(darkThemes.length).toBeGreaterThan(0);
  });

  it("should return default theme for unknown id", () => {
    const theme = getTheme("unknown-theme");
    expect(theme).toBeDefined();
    expect(theme.id).toBe("wechat-classic");
  });

  it("each theme should have required style properties", () => {
    const requiredStyles = [
      "background",
      "foreground",
      "accent",
      "border",
      "heading",
      "link",
      "code",
      "blockquote",
    ];

    Object.values(themes).forEach((theme) => {
      requiredStyles.forEach((style) => {
        expect(theme.styles).toHaveProperty(style);
        expect(typeof theme.styles[style as keyof typeof theme.styles]).toBe(
          "string",
        );
      });
    });
  });

  it("each theme should have CSS defined", () => {
    Object.values(themes).forEach((theme) => {
      expect(theme.css).toBeDefined();
      expect(typeof theme.css).toBe("string");
      expect(theme.css.length).toBeGreaterThan(0);
    });
  });
});

describe("getThemeList", () => {
  it("should return all themes", () => {
    const allThemes = getThemeList();
    expect(allThemes.length).toBeGreaterThanOrEqual(10);
  });

  it("should include wechat-classic", () => {
    const allThemes = getThemeList();
    const wechatClassic = allThemes.find((t) => t.id === "wechat-classic");
    expect(wechatClassic).toBeDefined();
  });
});

describe("getLightThemes", () => {
  it("should return only light themes", () => {
    const lightThemes = getLightThemes();
    lightThemes.forEach((theme) => {
      expect(theme.category).toBe("light");
    });
  });

  it("should include wechat-classic", () => {
    const lightThemes = getLightThemes();
    const wechatClassic = lightThemes.find((t) => t.id === "wechat-classic");
    expect(wechatClassic).toBeDefined();
  });
});

describe("getDarkThemes", () => {
  it("should return only dark themes", () => {
    const darkThemes = getDarkThemes();
    darkThemes.forEach((theme) => {
      expect(theme.category).toBe("dark");
    });
  });

  it("should have at least one dark theme", () => {
    const darkThemes = getDarkThemes();
    expect(darkThemes.length).toBeGreaterThan(0);
  });
});
