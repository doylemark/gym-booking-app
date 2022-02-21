import {
  CompilerOptions,
  createSemanticDiagnosticsBuilderProgram,
  createWatchCompilerHost,
  createWatchProgram,
  Diagnostic,
  findConfigFile,
  flattenDiagnosticMessageText,
  FormatDiagnosticsHost,
  sys,
} from "typescript";

import ElectronProgramManager from "./electron-process";
import Logger from "./logger";

const tsCodes = { startingCompilation: 6031 };

const formatHost: FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: sys.getCurrentDirectory,
  getNewLine: () => sys.newLine,
};

export default class ProgramBuilder {
  private electron: ElectronProgramManager;
  private logger: Logger;

  constructor() {
    this.electron = new ElectronProgramManager();
    this.logger = new Logger("main::tsc");
  }

  public start() {
    this.buildWatchProgram();
    this.electron.startProcess();
  }

  private tsLogger = (
    { messageText, code }: Diagnostic,
    type: "error" | "info"
  ) => {
    const text = flattenDiagnosticMessageText(
      messageText,
      formatHost.getNewLine()
    );

    this.logger.log(type, `${text} (TS${code})`);
  };

  private reportDiagnostic = (d: Diagnostic) => this.tsLogger(d, "error");

  private reportWatchStatusChanged = (
    d: Diagnostic,
    _: string,
    __: CompilerOptions,
    errorCount?: number
  ) => {
    if (d.code !== tsCodes.startingCompilation) {
      if (errorCount === 0) {
        this.electron.restartElectronProcess();
      } else {
        this.logger.log(
          "error",
          "Observed changes but errors existed. Not restarting"
        );
      }
    }

    this.tsLogger(d, "info");
  };

  private buildWatchProgram = () => {
    const configPath = findConfigFile(
      "./main",
      sys.fileExists,
      "tsconfig.json"
    );

    if (!configPath) throw new Error("Could not find tsconfig.json");

    const host = createWatchCompilerHost(
      configPath,
      undefined,
      sys,
      createSemanticDiagnosticsBuilderProgram,
      this.reportDiagnostic,
      this.reportWatchStatusChanged
    );

    if (!host) throw new Error("Error creating Watch Compiler Host");

    const orig = host.createProgram;

    host.createProgram = (rootNames, options, h, oldProgram) => {
      return orig(rootNames, options, h, oldProgram);
    };

    const postCreate = host.afterProgramCreate;

    if (!postCreate) throw new Error("Could not create start post-creation");

    host.afterProgramCreate = (program) => {
      if (program) postCreate(program);
    };

    createWatchProgram(host);
  };
}
