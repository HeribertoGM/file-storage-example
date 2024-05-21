const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

async function handler(event, context) {
	try {
		const { series, volume, status } = event.queryStringParameters;
		console.log(
			"🚀 ~ handler ~ event.queryStringParameters:",
			event.queryStringParameters
		);

		if (!series || !volume || !status) {
			throw new Error("Missing data");
		}

		let params = {
			TableName: "<ddb-table>",
			Key: {
				series,
				volume: Number(volume),
			},
			ConditionExpression: "#series = :series AND #volume = :volume",
			UpdateExpression: "SET #finished=:status",
			ExpressionAttributeNames: {
				"#series": "series",
				"#volume": "volume",
				"#finished": "finished",
			},
			ExpressionAttributeValues: {
				":series": series,
				":volume": Number(volume),
				":status": status === "true",
			},
		};
		console.log("🚀 ~ handler ~ params:", params);

		let response = await ddb.update(params).promise();

		return {
			statusCode: 200,
			message: "Updating success",
		};
	} catch (error) {
		console.error(JSON.stringify(error));
		return {
			statusCode: 400,
			message: "Updating failed",
			body: JSON.stringify(error),
		};
	}
}
exports.handler = handler;
