import { Suspense } from "react";

import Bookings from "./components/bookings";

const App = () => {
  return (
    <Suspense fallback={<p>loading...</p>}>
      <Bookings url="https://hub.ucd.ie/usis/W_HU_MENU.P_PUBLISH?p_tag=GYMBOOK" />
    </Suspense>
  );
};

export default App;
