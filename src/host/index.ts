// Host entry: runs in the DSH Node process. Bundled to lib/index.js as ESM.
// Services from DSH (settings, tools, webServer, systemPrompt, ...) are
// requested with ctx.inject so the plugin degrades when one is missing.
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

export const name = __PLUGIN_NAME__

// Services this plugin cannot start without. Prefer ctx.inject([...], fn)
// inside apply() for optional services.
export const inject: string[] = []

export interface Config {
  enabled: boolean
}

export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true).description('Enable the plugin.'),
})

export function apply(ctx: Context, config: Config) {
  if (!config.enabled) return

  // Everything registered in an effect is disposed when the plugin unloads.
  ctx.effect(() => {
    console.info(`[${name}] ${__PLUGIN_VERSION__} loaded`)
    return () => console.info(`[${name}] unloaded`)
  })
}
