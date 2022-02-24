import clsx from "clsx";

import { Session } from "../../lib/gym-sessions";
import { isBookable } from "../screens/home";

import SessionItem from "./session-item";

export type GymFilter = "Poolside Gym" | "Performance Gym";

type BookingsProps = {
  sessions: Session[];
  days: string[];
  activeDay: number;
  filter: GymFilter;
  addToQueue: (s: Session) => void;
};

const Bookings = ({
  sessions,
  days,
  activeDay,
  filter,
  addToQueue,
}: BookingsProps) => {
  return (
    <ol className="flex flex-col gap-6 p-6 w-full">
      {sessions
        .filter(({ location }) => location.includes(filter))
        .map((session) => (
          <SessionItem
            activeDay={days[activeDay]}
            session={session}
            key={session.id}
          >
            <button
              className={clsx(
                "bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md text-white focus:outline-none",
                "focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white",
                "disabled:bg-indigo-400"
              )}
              onClick={() => addToQueue(session)}
              disabled={session.isFull}
            >
              {session.isFull
                ? "Full"
                : isBookable(new Date(days[activeDay] + "-" + session.time))
                ? "Book now"
                : "Schedule for Booking"}
            </button>
          </SessionItem>
        ))}
    </ol>
  );
};

export default Bookings;
