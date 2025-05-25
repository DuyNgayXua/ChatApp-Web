import React from "react";
import ReactDOM from "react-dom/client"; // Sử dụng 'react-dom/client'
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";

// Tạo root và render ứng dụng
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
