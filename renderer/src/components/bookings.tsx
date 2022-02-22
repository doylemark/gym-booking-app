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

type BookingsProps = { url: string };

const Bookings = ({ url }: BookingsProps) => {
  const data = suspend(() => gymDataFetcher(url), ["bookingState"]);

  return (
    <ol className="flex flex-col gap-6 p-6">
      {data.sessions.map((session) => (
        <li className="flex flex-col p-4 border shadow rounded">
          <p className="text-lg">
            {session.time} @ {session.location}
          </p>
          {session.duration}
        </li>
      ))}
    </ol>
  );
};

export default Bookings;
