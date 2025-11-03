import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createRoutesFromElements, Route, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import PrivateRoute from "./redux/features/auth/PrivateRoute.jsx";
import NonAuthenticatedUser from "./redux/features/auth/NonAuthenticatedUser.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx"; 

axios.defaults.withCredentials = true;

const queryClient = new QueryClient({});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<NonAuthenticatedUser />}>
        <Route index={true} path="/" element={<Home />} />
      </Route>
      <Route path="" element={<PrivateRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider> 
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
);
