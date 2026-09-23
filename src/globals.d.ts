// Replaced at build time by scripts/build.mjs with package.json values.
declare const __PLUGIN_NAME__: string
declare const __PLUGIN_VERSION__: string

// CSS files are bundled into the client as text.
declare module '*.css' {
  const css: string
  export default css
}
