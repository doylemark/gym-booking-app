import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

import Home from "./screens/home";

const App = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<p>loading...</p>}>
        <Home />
      </Suspense>
    </>
  );
};

export default App;
