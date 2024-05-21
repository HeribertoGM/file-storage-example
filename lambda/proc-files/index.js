const fs = require("fs");
const gm = require("gm").subClass({ imageMagick: true });

const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const generate_image = async (bucket, fileKey, imgKey) => {
	console.log("Generating image...");
	console.log("Getting PDF file...");
	const pdf = await s3
		.getObject({
			Bucket: bucket,
			Key: fileKey,
		})
		.promise();
	console.log("converting PDF to image...");

	console.log(`gm process started.`);
	gm(pdf.Body, `pdf.pdf[0]`)
		.resize(1536)
		.density(200)
		.quality(100)
		.setFormat("webp")
		.stream((error, stdout, stderr) => {
			if (error) {
				console.log("gm conversion process error");
				throw new Error("gm conversion process error");
			}
			const chunks = [];
			stdout.on("data", (chunk) => {
				chunks.push(chunk);
			});
			stdout.on("end", () => {
				console.log(`gm process complete.`);
				const buffer = Buffer.concat(chunks);
				s3.putObject(
					{
						Bucket: bucket,
						Key: imgKey,
						ContentType: "image/webp",
						Body: buffer,
						StorageClass: "GLACIER_IR",
					},
					(error, data) => {
						if (error) {
							console.log("Upload image error...");
							throw new Error("Upload image error...");
						}
						console.log("Image Uploaded");
					}
				);
			});
			stderr.on("data", (data) => {
				console.log("stderr:", data);
			});
		});
};

const generate_record = async (filename, fileKey, imgKey) => {
	let parts = filename.replace(".pdf", "").split(" - Vol ");

	let params = {
		TableName: "<ddb-table>",
		Item: {
			name: { S: filename },
			series: { S: parts[0] },
			volume: { N: parts[1] },
			file_url: {
				S: `https://<s3-storage>.s3.amazonaws.com/${fileKey}`,
			},
			img_url: {
				S: `https://<s3-storage>.s3.amazonaws.com/${imgKey}`,
			},
			finished: { BOOL: false },
		},
	};

	ddb.putItem(params, function (err, data) {
		if (err) {
			console.log("Error adding record to ddb: ", err);
		} else {
			console.log("Success adding record to ddb: ", data);
		}
	});
};

async function handler(event, context, callback) {
	// get backet & key
	const bucket = event.Records[0].s3.bucket.name;
	const fileKey = decodeURIComponent(event.Records[0].s3.object.key).replace(
		/\+/g,
		" "
	);

	if (fileKey.length <= 6 || fileKey.includes("img/")) {
		return {
			statusCode: 200,
			message: "Folder created.",
		};
	}

	const filename = fileKey.split("/")[1];
	const imgKey = `img/${filename.replace(".pdf", ".webp")}`;

	try {
		console.log("starting process...");
		// generate img
		await generate_image(bucket, fileKey, imgKey);

		// generate record
		await generate_record(filename, fileKey, imgKey);

		console.log("Finishing process...");
		callback(null, {
			statusCode: 200,
			message: "Success",
		});
	} catch (error) {
		console.error(JSON.stringify(error));
		callback(null, {
			statusCode: 400,
			message: "Failed",
		});
	}
}
exports.handler = handler;
