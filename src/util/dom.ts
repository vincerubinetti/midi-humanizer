export type Theme = Record<`--${string}`, string>;

/** https://stackoverflow.com/a/78994961/2180570 */
/** get all css variables on root */
export const getTheme = (styles = getStyles()): Theme =>
  Object.fromEntries(
    Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules);
        } catch (error) {
          return [];
        }
      })
      .filter((rule) => rule instanceof CSSLayerBlockRule)
      .filter((rule) => rule.name === "theme")
      .flatMap((rule) => Array.from(rule.cssRules))
      .filter((rule) => rule instanceof CSSStyleRule)
      .flatMap((rule) => Array.from(rule.style))
      .filter((style) => style.startsWith("--"))
      .map((variable) => {
        const value = styles.getPropertyValue(variable);
        return [variable, value];
      }),
  );

/** get styles on target element */
export const getStyles = (target?: Element | null) =>
  window.getComputedStyle(target || document.documentElement);
