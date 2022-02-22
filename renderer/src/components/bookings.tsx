import clsx from "clsx";
import { useEffect } from "react";
import { suspend } from "suspend-react";

import {
  getAvailableDays,
  getSessionsFromPage,
  getToken,
  Session,
} from "../../lib/gym-sessions";

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

type BookingsProps = {
  url: string;
  setDays: (s: string[]) => void;
  activeDay: number;
};

const Bookings = ({ url, setDays, activeDay }: BookingsProps) => {
  const data = suspend(() => gymDataFetcher(url), ["bookingState"]);

  useEffect(() => {
    setDays(data.days);
  }, [data.days, setDays]);

  return (
    <>
      <ol className="flex flex-col gap-6 p-6">
        {data.sessions.map((session) => (
          <li
            key={session.id}
            className="flex justify-between items-center p-4 border shadow rounded-lg"
          >
            <div>
              <p className="text-lg flex items-center gap-1">
                <span className="text-xl">
                  {session.location.includes("Poolside") ? "🏖" : ""}
                </span>
                {session.location}{" "}
              </p>
              <p className="text-gray-800">
                {new Intl.DateTimeFormat("en-us", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: false,
                }).format(new Date(data.days[activeDay] + "-" + session.time))}
              </p>
            </div>
            <button
              className={clsx(
                "bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white focus:outline-none",
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white"
              )}
            >
              Schedule for Booking
            </button>
          </li>
        ))}
      </ol>
    </>
  );
};

export default Bookings;
