import { v4 } from "uuid";

export type Session = {
  time: string;
  className: string;
  duration: string;
  location: string;
  classType: string;
  isFull: boolean;
  bookingLink: string | undefined;
  id: string;
};

const sessionFromRow = (cells: HTMLTableCellElement[]): Session => {
  return cells.reduce((ctx, cur, i) => {
    const text = cur.textContent ?? "Unknown";

    if (i === 0) ctx.time = text;
    if (i === 1) ctx.className = text;
    if (i === 2) ctx.duration = text;
    if (i === 3) ctx.location = text;
    if (i === 4) ctx.classType = text;
    if (i === 5) {
      ctx.id = v4();
      ctx.isFull = cur.innerText.includes("Full");

      const link = cur.querySelector("a")?.getAttribute("href");
      ctx.bookingLink = link ? "https://hub.ucd.ie/usis/" + link : undefined;
    }

    return ctx;
  }, {} as Session);
};

export const getSessionsFromPage = (html: string): Session[] => {
  const parser = new window.DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const table = document.getElementById("SW300-1Q");

  if (!table) return [];

  const [body] = table.getElementsByTagName("tbody");
  const rows = Array.from(body.getElementsByTagName("tr"));

  return rows.map((row) => {
    const cells = Array.from(row.getElementsByTagName("td"));

    return sessionFromRow(cells);
  });
};

// const dateKey = "p_code1";
const tokenKey = "p_parameters";

export const getAvailableDays = (html: string) => {
  const parser = new window.DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const days = document.querySelectorAll("option");

  return Array.from(days).map((el) => el.value);
};

export const getToken = (html: string) => {
  const parser = new window.DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const inputs = Array.from(document.querySelectorAll("input"));

  const [tokenInput] = inputs.filter((el) => el.name === tokenKey);

  return tokenInput.value;
};
