export interface EchoPluginPlugin {
    echo(options: { value: string }): Promise<{ value: string }>;
    renderLogin(buttonElem: HTMLElement): Promise<void>;
}
  