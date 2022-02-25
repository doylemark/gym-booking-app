import { exec, ChildProcess } from "child_process";

import Logger from "./logger";

export default class ElectronProgramManager {
  private electronProcess: ChildProcess | undefined;
  private logger: Logger;

  constructor() {
    this.logger = new Logger("main::electron", true);
  }

  public startProcess = () => {
    this.logger.log("info", "Starting main process");

    if (this.electronProcess) {
      this.killProcess();
    } else {
      this.electronProcess = exec("electron .");
      this.electronProcess.stdout?.pipe(process.stdout);
      this.logger.log(
        "warn",
        "Started process with PID: " + this.electronProcess?.pid ?? "unknown"
      );
    }
  };

  public killProcess = () => {
    this.logger.log(
      "warn",
      "Trying to kill process " + this.electronProcess?.pid ?? "unknown"
    );

    this.electronProcess?.kill();
    this.electronProcess?.on("close", () => {
      this.logger.log(
        "warn",
        "Killed process with PID " + this.electronProcess?.pid ?? "unknown"
      );
      this.electronProcess = undefined;
    });
  };

  public restartElectronProcess = () => {
    this.logger.log("info", "Restarting main process");

    if (this.electronProcess) {
      this.killProcess();
      this.electronProcess.on("close", this.startProcess);
    }
  };
}
