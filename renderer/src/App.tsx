import { Suspense, useState } from "react";

import Bookings from "./components/bookings";
import Header from "./components/header";

const App = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [days, setDays] = useState<string[]>();

  return (
    <div>
      <Header
        days={days}
        activeDayIdx={activeDay}
        setActiveDay={setActiveDay}
      />
      <Suspense fallback={<p>loading...</p>}>
        <Bookings
          url="https://hub.ucd.ie/usis/W_HU_MENU.P_PUBLISH?p_tag=GYMBOOK"
          setDays={setDays}
          activeDay={activeDay}
        />
      </Suspense>
    </div>
  );
};

export default App;
