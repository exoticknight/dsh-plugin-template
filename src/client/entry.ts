// Client bundle entry. scripts/build.mjs wraps the CJS output in
// window.__ModuleLoader__.load({ id, factory }); externals such as react are
// resolved through the factory's require.
export { apply, inject } from './index.js'
