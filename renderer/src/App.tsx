import { Suspense, useState } from "react";

import Bookings from "./components/bookings";
import Header from "./components/header";

export type GymFilter = "poolside" | "performance";

const App = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [days, setDays] = useState<string[]>();
  const [filter, setFilter] = useState<GymFilter>("poolside");

  return (
    <div className="overflow-visible">
      <Header
        days={days}
        activeDayIdx={activeDay}
        setActiveDay={setActiveDay}
        setFilter={setFilter}
      />
      <Suspense fallback={<p>loading...</p>}>
        <Bookings
          url="https://hub.ucd.ie/usis/W_HU_MENU.P_PUBLISH?p_tag=GYMBOOK"
          setDays={setDays}
          activeDay={activeDay}
          filter={filter}
        />
      </Suspense>
    </div>
  );
};

export default App;
