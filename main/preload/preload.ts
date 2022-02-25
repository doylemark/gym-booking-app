import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  book: (url: string, id: string) => ipcRenderer.send("booking", url, id),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  onBookingResponse: (callback: (...args) => void) =>
    ipcRenderer.on("booking-response", (_, ...args) => callback(args)),
});
