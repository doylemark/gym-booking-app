import { useCallback, useEffect, useState } from "react";
import { suspend } from "suspend-react";
import toast from "react-hot-toast";

import Bookings from "../components/bookings";
import Header from "../components/header";
import ScheduledBookings from "../components/scheduled-bookings";
import useInterval from "../hooks/use-interval";
import {
  bookGymSession,
  getAvailableDays,
  getSessionsFromPage,
  getToken,
  Session,
} from "../../lib/gym-sessions";

export type GymFilter = "Poolside Gym" | "Performance Gym";

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

const threeHrs = 3 * 60000 * 60;
const defaultUrl = "https://hub.ucd.ie/usis/W_HU_MENU.P_PUBLISH?p_tag=GYMBOOK";

export const isBookable = (d: Date) =>
  d.getTime() < new Date().getTime() + threeHrs;

const Home = () => {
  const data = suspend(() => gymDataFetcher(defaultUrl), ["bookingState"]);

  const [activeDay, setActiveDay] = useState(0);
  const [filter, setFilter] = useState<GymFilter>("Poolside Gym");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [queue, setQueue] = useState<Record<string, Session>>({});
  const [inProgressBooking, setInProgressBooking] = useState<string>();

  useEffect(() => {
    console.log(queue);
  }, [data, queue]);

  const removeFromQueue = useCallback((s: Session) => {
    setQueue((q) => {
      // immutable delete key from object
      return Object.keys(q)
        .filter((key) => key !== s.id)
        .reduce((ctx, cur) => {
          ctx[cur] = q[cur];
          return ctx;
        }, {} as Record<string, Session>);
    });
  }, []);

  const book = useCallback(
    async (session: Session) => {
      if (inProgressBooking === session.id || !session.bookingLink) return;

      setInProgressBooking(session.id);

      const success = await toast.promise(
        bookGymSession(session.bookingLink, ""), // TODO: Insert student number
        {
          loading: "Booking Session " + session.location,
          error: "Failed to book session",
          success: "Successfully booked session at " + session.location,
        }
      );

      if (success) {
        removeFromQueue(session);
      }

      setInProgressBooking(undefined);
    },
    [inProgressBooking, removeFromQueue]
  );

  const addToQueue = useCallback(
    (s: Session) => {
      setQueue((q) => ({ ...q, [s.id]: s }));

      if (isBookable(new Date(`${data.days[activeDay]}-${s.time}`))) {
        book(s);
      }
    },
    [activeDay, book, data.days]
  );

  useInterval(async () => {
    for (let item of Object.values(queue)) {
      (async () => {
        const d = new Date(data.days[activeDay] + "-" + item.time);

        if (isBookable(d)) {
          // as session is now bookable we need to immediately
          // fetch the booking link if it's missing, otherwise we risk
          // missing the booking
          if (!item.bookingLink) {
            const { sessions } = await gymDataFetcher(defaultUrl);
            const updatedItem = sessions.find((s) => s.id === item.id);
            if (!updatedItem) return;
            item = updatedItem;
          }

          if (item.bookingLink) book(item);
        }
      })();
    }
  }, 15000);

  return (
    <div className="overflow-visible">
      <ScheduledBookings
        open={scheduleOpen}
        setOpen={setScheduleOpen}
        bookings={Object.values(queue)}
        activeDay={data.days[activeDay]}
        removeBooking={removeFromQueue}
      />
      <Header
        days={data.days}
        activeDayIdx={activeDay}
        setActiveDay={setActiveDay}
        setFilter={setFilter}
        openSchedule={() => setScheduleOpen(true)}
      />
      <Bookings
        days={data.days}
        sessions={data.sessions}
        activeDay={activeDay}
        filter={filter}
        addToQueue={addToQueue}
      />
    </div>
  );
};

export default Home;
