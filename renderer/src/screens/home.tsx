import { useCallback, useState } from "react";
import { suspend } from "suspend-react";

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
  const data = suspend(() => gymDataFetcher(defaultUrl), ["bookingState"], {
    lifespan: 1 * 60000,
  });

  const [activeDay, setActiveDay] = useState(0);
  const [filter, setFilter] = useState<GymFilter>("Poolside Gym");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [queue, setQueue] = useState<Record<string, Session>>({});

  const addToQueue = useCallback((s: Session) => {
    setQueue((q) => ({ ...q, [s.id]: s }));
  }, []);

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

          if (item.bookingLink) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            const success = await bookGymSession(item.bookingLink, "21385593");

            if (success) {
              removeFromQueue(item);
              console.log("success");
            } else {
              console.log("fail");
            }
          }
        }
      })();
    }
  }, 5000);

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
