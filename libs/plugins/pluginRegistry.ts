import type {
  IExternalPlugin,
  PluginHealthStatus,
  PluginMetadata,
} from "./types";

/**
 * Central registry for external plugins.
 * Decouples API routes from specific service implementations
 * by providing dependency-injection-style plugin resolution.
 *
 * Usage:
 *   PluginRegistry.register(new ClaudePlugin());
 *   const claude = PluginRegistry.get<ClaudeInput, ClaudeOutput>("claude");
 *   const result = await claude.execute(input);
 */
class PluginRegistryImpl {
  private plugins = new Map<string, IExternalPlugin>();
  private initialized = new Set<string>();

  /** Register a plugin by its metadata.name (lowercased). */
  register(plugin: IExternalPlugin): void {
    const key = plugin.metadata.name.toLowerCase();
    if (this.plugins.has(key)) {
      console.warn(
        `[PluginRegistry] Overwriting existing plugin "${key}" (v${this.plugins.get(key)!.metadata.version}) with v${plugin.metadata.version}`
      );
    }
    this.plugins.set(key, plugin);
  }

  /** Resolve a plugin by name. Throws if not found. */
  get<TInput = unknown, TOutput = unknown>(
    name: string
  ): IExternalPlugin<TInput, TOutput> {
    const key = name.toLowerCase();
    const plugin = this.plugins.get(key);
    if (!plugin) {
      throw new Error(
        `[PluginRegistry] Plugin "${name}" not registered. Available: [${this.listNames().join(", ")}]`
      );
    }
    return plugin as IExternalPlugin<TInput, TOutput>;
  }

  /** Initialize a plugin (idempotent). */
  async initialize(name: string): Promise<void> {
    const key = name.toLowerCase();
    if (this.initialized.has(key)) return;
    const plugin = this.get(key);
    await plugin.initialize();
    this.initialized.add(key);
  }

  /** Initialize all registered plugins. */
  async initializeAll(): Promise<void> {
    for (const key of this.plugins.keys()) {
      await this.initialize(key);
    }
  }

  /** Check if a plugin is registered. */
  has(name: string): boolean {
    return this.plugins.has(name.toLowerCase());
  }

  /** Get metadata for all registered plugins. */
  listMetadata(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((p) => p.metadata);
  }

  /** Get names of all registered plugins. */
  listNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /** Run health checks on all registered plugins. */
  async healthCheckAll(): Promise<Record<string, PluginHealthStatus>> {
    const results: Record<string, PluginHealthStatus> = {};
    for (const [key, plugin] of this.plugins.entries()) {
      try {
        results[key] = await plugin.healthCheck();
      } catch (error) {
        results[key] = {
          healthy: false,
          message: error instanceof Error ? error.message : String(error),
        };
      }
    }
    return results;
  }

  /** Destroy all plugins and clear the registry. */
  async destroyAll(): Promise<void> {
    for (const [key, plugin] of this.plugins.entries()) {
      if (plugin.destroy) {
        await plugin.destroy();
      }
      this.initialized.delete(key);
    }
    this.plugins.clear();
  }
}

/** Singleton plugin registry instance. */
export const PluginRegistry = new PluginRegistryImpl();
