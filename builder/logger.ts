import { writeFileSync, appendFileSync } from "fs";

import colors = require("picocolors");

type LogType = "error" | "warn" | "info";
export default class Logger {
  private prefix = "main";
  private fileName = "";
  private writeToFile = false;

  constructor(prefix: string, writeToFile = false) {
    this.prefix = prefix;

    if (writeToFile) {
      this.writeToFile = true;
      this.createLogFile();
    }
  }

  public log(type: LogType, msg: string) {
    const tag = this.logTag(type, this.prefix);
    const date = colors.dim(new Date().toLocaleTimeString());
    const out = `${date} ${tag} ${msg}\n`;

    console.log(out);

    if (this.writeToFile) this.logToFile(out);
  }

  private logTag(type: LogType, prefix: string) {
    const pre = colors.bold(`[${prefix}]`);
    switch (type) {
      case "warn":
        return colors.yellow(pre);
      case "error":
        return colors.red(pre);
      default:
        return colors.cyan(pre);
    }
  }

  private createLogFile() {
    const date = new Date().toISOString();
    const fileName = "electron-log.txt";

    writeFileSync(fileName, date + "\n");
    this.fileName = fileName;
  }

  private logToFile(msg: string) {
    // eslint-disable-next-line no-control-regex
    msg = msg.replace(/\u001b\[.*?m/g, ""); // remove ascii coloring

    appendFileSync(this.fileName, msg.toString());
  }
}
