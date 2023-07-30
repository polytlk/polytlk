import type { PluginListenerHandle } from "@capacitor/core";

export interface EchoPluginPlugin {
    renderLogin(data: { buttonElem?: HTMLElement, baseUrl: string }): Promise<void>;
    addListener(
        eventName: "loginResult",
        listenerFunc: (data: { token: string }) => void
    ): PluginListenerHandle;
}
