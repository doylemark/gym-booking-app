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
    if (i === 3) {
      // ucd can't spell their own gym right
      if (text.includes("Perfomance")) {
        ctx.location = "Performance Gym";
      } else {
        ctx.location = text;
      }
    }
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

const bookingErrors = {
  invalidUrl:
    "The booking URL received from UCD was invalid, please try restarting the application",
  invalidStudentNo: "Student Number could not be found in UCD system",
};

export const bookGymSession = async (bookingUrl: string, studentNo: string) => {
  const response = await fetch(bookingUrl);
  const html = await response.text();

  const params = new URLSearchParams(bookingUrl);

  const token = params.get("p_parameters");

  if (!token) throw new Error(bookingErrors.invalidUrl);

  const formData = new FormData();

  formData.append("p_query", "SW-GYMPROV");
  formData.append("p_confirmed", "Y");
  formData.append("p_parameters", getToken(html));
  formData.append("MEMBER_NO", "21385593");

  const response2 = await fetch(
    "https://hub.ucd.ie/usis/!W_HU_REPORTING.P_RUN_SQL",
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response2.text();

  console.log(data);
  console.log(response);

  if (data.includes("We cannot find your membership. Please try again")) {
    throw new Error(bookingErrors.invalidStudentNo);
  }
};
