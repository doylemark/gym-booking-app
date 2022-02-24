import { Suspense } from "react";

import Home from "./screens/home";

const App = () => {
  return (
    <Suspense fallback={<p>loading...</p>}>
      <Home />
    </Suspense>
  );
};

export default App;
