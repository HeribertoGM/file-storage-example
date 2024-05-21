import { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import { useLoaderData } from "react-router-dom";

import Book from "./components/Book";

export default function App() {
	const [items, setItems] = useState([]);
	const { filter } = useLoaderData();

	useEffect(() => {
		getData(filter);
	}, [filter]);

	const getData = async (filter) => {
		let url = import.meta.env.VITE_LAMBDA_GET_ENDPOINT || "";

		if (filter) {
			if (filter.length === 2) {
				// series & volume
				url += `?series=${filter[0]}&volume=${filter[1]}`;
			} else if (filter.length === 1) {
				if (filter[0].includes("finished")) {
					// finished
					// not-finished
					url += `?status=${!filter[0].includes("not")}`;
				} else {
					// series
					url += `?series=${filter[0]}`;
				}
			}
		}

		const dynamicData = await fetch(url, { cache: "no-store" });

		let books = await dynamicData.json();

		if (filter.length === 0 || filter[0].includes("finished")) {
			let sorted = books.items.sort((a, b) => {
				let textA = a.name.toUpperCase();
				let textB = b.name.toUpperCase();
				return textA < textB ? -1 : textA > textB ? 1 : 0;
			});

			setItems(sorted);
		} else {
			setItems(books.items);
		}
	};

	return (
		<div style={{ backgroundColor: "#282C34", paddingBottom: 30 }}>
			<Typography variant="h2" color="#D1E9FD" textAlign="center">
				Light Novels Index
			</Typography>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<div
					style={{
						width: "90%",
						marginTop: 15,
						marginBottom: 15,
						border: "1px solid #D1E9FD",
					}}
				/>
			</div>
			<Grid
				container
				spacing={2}
				alignItems="center"
				justifyContent="center"
			>
				{items.map((elem, idx) => (
					<Book data={elem} key={idx} />
				))}
			</Grid>
		</div>
	);
}
