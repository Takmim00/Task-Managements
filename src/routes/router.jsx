import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Login from "../pages/authentication/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main/>,
    children:[
        {
            path:'/login',
            element:<Login/>
        }
    ]
  },
]);
