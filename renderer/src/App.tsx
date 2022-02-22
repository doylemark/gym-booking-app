import { Suspense } from "react";

import Bookings from "./components/bookings";
import Header from "./components/header";

const App = () => {
  return (
    <div>
      <Suspense fallback={<p>loading...</p>}>
        <Bookings url="https://hub.ucd.ie/usis/W_HU_MENU.P_PUBLISH?p_tag=GYMBOOK" />
      </Suspense>
    </div>
  );
};

export default App;
