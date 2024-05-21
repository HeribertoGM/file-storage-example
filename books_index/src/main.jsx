import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
	createBrowserRouter,
	RouterProvider,
	createHashRouter,
} from "react-router-dom";

const loader = ({ params }) => {
	return { filter: Object.values(params) };
};

const router = createHashRouter([
	{
		path: "/",
		loader: loader,
		element: <App />,
	},
	{
		path: "/:lvl1",
		loader: loader,
		element: <App />,
	},
	{
		path: "/:lvl1/:lvl2",
		loader: loader,
		element: <App />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
