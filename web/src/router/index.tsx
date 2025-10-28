import { createBrowserRouter } from "react-router-dom";
import Layout from "~/components/layout/Layout";
import Home from "~/pages/Home";
import Report from "~/pages/Report";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "report/:tokenAddress",
        element: <Report />,
      },
    ],
  },
]);
