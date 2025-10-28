import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "~/router";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="flex flex-col px-6 max-w-[calc(100%-2px)] lg:max-w-4xl w-full mx-auto border-x border-border-primary">
      <div className="flex flex-col border-x border-border-primary w-full flex-1">
        <RouterProvider router={router} />
        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
