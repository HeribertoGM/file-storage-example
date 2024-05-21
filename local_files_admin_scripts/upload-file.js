const fs = require("fs");
const path = require("path");
const process = require("process");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

async function upload(filename, data) {
	const bucket = process.env.S3_BUCKET_NAME;

	const params = {
		Bucket: bucket,
		Key: `books/${filename}`,
		ContentType: "application/pdf",
		Body: data,
		StorageClass: "GLACIER_IR",
	};

	try {
		const stored = await s3.upload(params).promise();
	} catch (error) {
		console.log("ERR - Error while trying to upload file to S3: ");
		console.log(error);
		fs.appendFileSync(
			path.join(__dirname, "logs", "upload-error-log.txt"),
			`ERR - Error while trying to upload file (${file_path}) to S3: ${JSON.stringify(
				error
			)}\n`
		);
	}
}

async function main() {
	const file_path = process.argv[2];

	console.log("###########################################################");
	console.log("Upload File: ", file_path);
	console.log("###########################################################");

	try {
		const buff = fs.readFileSync(file_path);

		upload(path.basename(file_path), buff);
	} catch (error) {
		console.log("ERR - Error while trying to read file to S3: ");
		console.log(error);
		fs.appendFileSync(
			path.join(__dirname, "logs", "upload-error-log.txt"),
			`ERR - Error while trying to read file (${file_path}) to S3: ${JSON.stringify(
				error
			)}\n`
		);
	}
}

if (require.main === module) {
	main();
}
