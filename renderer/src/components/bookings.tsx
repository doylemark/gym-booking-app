import clsx from "clsx";
import { useEffect } from "react";
import { suspend } from "suspend-react";

import {
  getAvailableDays,
  getSessionsFromPage,
  getToken,
  Session,
} from "../../lib/gym-sessions";
import type { GymFilter } from "../App";

type GymData = {
  sessions: Session[];
  days: string[];
  token: string;
};

const gymDataFetcher = (url: string): Promise<GymData> => {
  return new Promise(async (resolve) => {
    try {
      const response = await fetch(url);
      const data = await response.text();

      const sessions = getSessionsFromPage(data);
      const days = getAvailableDays(data);
      const token = getToken(data);

      resolve({ sessions, days, token });
    } catch (error) {}
  });
};

const timeFmt = (d: Date) => {
  return new Intl.DateTimeFormat("en-us", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(d);
};

type BookingsProps = {
  url: string;
  setDays: (s: string[]) => void;
  activeDay: number;
  filter: GymFilter;
};

const Bookings = ({ url, setDays, activeDay, filter }: BookingsProps) => {
  const data = suspend(() => gymDataFetcher(url), ["bookingState"]);

  useEffect(() => {
    setDays(data.days);
  }, [data.days, setDays]);

  return (
    <ol className="flex flex-col gap-6 p-6 w-full">
      {data.sessions
        .filter(({ location }) => location.includes(filter))
        .map((session) => {
          const startDate = new Date(data.days[activeDay] + "-" + session.time);
          const endDate = new Date(startDate.getTime() + 75 * 60000);
          return (
            <li
              key={session.id}
              className="flex justify-between items-center p-4 border shadow rounded-lg"
            >
              <div>
                <p className="text-gray-900 text-lg flex items-center">
                  {session.location}
                </p>
                <p className="text-gray-700">
                  {timeFmt(startDate)} - {timeFmt(endDate)}
                </p>
              </div>
              <button
                className={clsx(
                  "bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md text-white focus:outline-none",
                  "focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white"
                )}
              >
                Schedule for Booking
              </button>
            </li>
          );
        })}
    </ol>
  );
};

export default Bookings;
