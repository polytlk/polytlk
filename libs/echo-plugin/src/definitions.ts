import type { PluginListenerHandle } from "@capacitor/core";

export interface EchoPluginPlugin {
    renderLogin(buttonElem: HTMLElement): Promise<void>;
    addListener(
        eventName: "loginResult",
        listenerFunc: (token: string) => void
    ): PluginListenerHandle;
}
