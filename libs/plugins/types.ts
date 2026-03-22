/**
 * Plugin architecture types for pyform external integrations.
 * Follows the Open/Closed principle: new plugins extend IExternalPlugin
 * without modifying existing code.
 */

/** Health status returned by a plugin's healthCheck. */
export interface PluginHealthStatus {
  healthy: boolean;
  latencyMs?: number;
  message?: string;
}

/** Metadata describing a registered plugin. */
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
}

/** Result wrapper for plugin execution. */
export interface PluginExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Contract that every external plugin must implement.
 * This provides a standardized lifecycle for initialization,
 * execution, health checking, and teardown.
 */
export interface IExternalPlugin<
  TInput = unknown,
  TOutput = unknown,
> {
  readonly metadata: PluginMetadata;

  /** One-time setup (authenticate, warm caches, etc.). */
  initialize(): Promise<void>;

  /** Core operation of the plugin. */
  execute(input: TInput): Promise<PluginExecutionResult<TOutput>>;

  /** Lightweight liveness probe. */
  healthCheck(): Promise<PluginHealthStatus>;

  /** Optional cleanup on shutdown. */
  destroy?(): Promise<void>;
}
