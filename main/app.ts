import { join } from "path";

import { app, BrowserWindow, ipcMain } from "electron";
import * as puppeteer from "puppeteer";

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: join(__dirname, "preload/preload.js"),
      backgroundThrottling: false,
    },
  });

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: "*", ...details.requestHeaders } });
    }
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          "Access-Control-Allow-Origin": "*",
          ...details.responseHeaders,
        },
      });
    }
  );

  // and load the index.html of the app.
  // mainWindow.loadFile("index.html");
  mainWindow.loadURL("http://localhost:3000");
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const consentBtnId = "onetrust-accept-btn-handler";

const bookGymSession = async (url: string, studentId: string) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const consentBtn = await page.$("#" + consentBtnId);
    await consentBtn?.click();

    const idInput = await page.$("input[name='MEMBER_NO']");
    await idInput?.type(studentId);

    await page.waitForSelector("input[type='submit']");
    const idConfirm = await page.$("input[type='submit']");

    await page.waitForTimeout(500);

    await idConfirm?.focus();
    await idConfirm?.click();

    await page.waitForTimeout(500);

    await page.waitForSelector(".menubutton");
    const confirmBtn = await page.$(".menubutton");
    await confirmBtn?.click();

    await page.waitForNetworkIdle();

    const title = await page.title();
    return title.includes("Confirmation");
  } catch (error) {
    console.log(error);
    return false;
  }
};

ipcMain.on("booking", async (e, ...args) => {
  const [url, id] = args;
  const success = await bookGymSession(url, id);
  e.sender.send("booking-response", success);
});
