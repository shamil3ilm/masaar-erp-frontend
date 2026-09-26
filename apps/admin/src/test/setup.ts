import '@testing-library/jest-dom'

/*
 * jsdom implements no media queries, and ThemeProvider asks for the system
 * colour scheme as it mounts. Answer "light", which is what the console shows
 * a visitor whose machine has expressed no preference.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
