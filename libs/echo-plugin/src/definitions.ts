export interface EchoPluginPlugin {
    echo(options: { value: string }): Promise<{ value: string }>;
}
  