const fs = require("fs");
const path = require("path");
const process = require("process");

require("dotenv").config({ path: path.join(__dirname, ".env") });

function getParams(file_path) {
	const filename = path.basename(file_path).replace(".pdf", "");

	const parts = filename.split(" - Vol ");

	return {
		series: parts[0],
		volume: parts[1],
		status: true,
	};
}

function getUrl(config) {
	const { series, volume, status } = config;
	return `${process.env.LAMBDA_UPDATE_ENDPOINT}?series=${series}&volume=${volume}&status=${status}`;
}

async function main() {
	const file_path = process.argv[2];

	if (path.basename(path.dirname(file_path)) !== "light_novels") {
		return;
	}

	console.log("###########################################################");
	console.log("Update File: ", file_path);
	console.log("###########################################################");

	try {
		let params = getParams(file_path);
		let url = getUrl(params);

		const response = await fetch(url);

		if (response.status !== 200) {
			throw params;
		}

		fs.renameSync(
			file_path,
			path.join(
				path.dirname(file_path),
				"Terminadas",
				path.basename(file_path)
			)
		);
	} catch (error) {
		console.log("ERR - Error while trying to update status in DynamoDB: ");
		console.log(JSON.stringify(error));
		fs.appendFileSync(
			path.join(__dirname, "logs", "update-error-log.txt"),
			`ERR - Error while trying to update status (${file_path}) in DynamoDB: ${JSON.stringify(
				error
			)}\n`
		);
	}
}

if (require.main === module) {
	main();
}
