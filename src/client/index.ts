// Client entry: runs in the DSH web page. Bundled to lib/client.js.
// Client services come from the packages listed in package.json dsh.client.inject.

interface ClientContext {
  effect: (effect: () => (() => void) | void, label?: string) => void
}

// Client services this entry needs, e.g. ['slots', 'theme'].
export const inject: string[] = []

export function apply(ctx: ClientContext) {
  ctx.effect(() => {
    console.info(`[${__PLUGIN_NAME__}] client ${__PLUGIN_VERSION__} ready`)
  })
}
