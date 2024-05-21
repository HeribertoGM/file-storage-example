import React from "react";
import { Grid } from "@mui/material";
import {
	Typography,
	Link,
	Card,
	CardMedia,
	CardContent,
	CardActions,
} from "@mui/material";
import { Download } from "@mui/icons-material";

function Book({ data, idx }) {
	return (
		<Grid item key={idx}>
			<Card sx={{ width: 250, padding: 1, backgroundColor: "#E6E6E6" }}>
				<CardMedia
					component="img"
					height={300}
					src={data.img_url}
					alt={`cover - ${data.series} - ${data.volume}`}
					sx={{ objectFit: "contain" }}
					loading="lazy"
				/>
				<CardContent>
					<Typography variant="h6" color="black" textAlign="center">
						{data.series} - Vol{" "}
						{data.volume < 10 ? "0" + data.volume : data.volume}
					</Typography>
				</CardContent>
				<CardActions
					disableSpacing
					sx={{
						justifyContent: "right",
						alignItems: "center",
					}}
				>
					<Link
						href={data.file_url}
						sx={{
							height: 35,
							width: 35,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#C0C0C0",
							borderRadius: 25,
							color: "#2C4579",
						}}
						target="_blank"
					>
						<Download />
					</Link>
				</CardActions>
			</Card>
		</Grid>
	);
}

export default Book;
