import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "../dashboard/Dashboard";
import CityMap from "../map/CityMap";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "map", element: <div style={{ height: "100%" }}><CityMap /></div> },
    ],
  },
]);
