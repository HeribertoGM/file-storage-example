const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

async function handler(event, context) {
	try {
		let query = {};
		if (event && event.queryStringParameters) {
			console.log(
				"🚀 ~ handler ~ event.queryStringParameters:",
				event.queryStringParameters
			);
			query = event.queryStringParameters;
		}

		let params = {
			TableName: "<ddb-table>",
		};

		if ("series" in query) {
			params.isQuery = true;
			if ("volume" in query) {
				// query series & volume
				const { series, volume } = event.queryStringParameters;
				params.ExpressionAttributeValues = {
					":series": series,
					":volume": Number(volume),
				};

				params.KeyConditionExpression =
					"series = :series and volume = :volume";
			} else {
				// query series
				const { series } = event.queryStringParameters;
				params.ExpressionAttributeValues = {
					":series": series,
				};

				params.KeyConditionExpression = "series = :series";
			}
		} else {
			params.isQuery = false;
			if ("status" in query) {
				// scan status
				const { status } = event.queryStringParameters;
				params.ExpressionAttributeValues = {
					":status": status === "true",
				};

				params.FilterExpression = "finished = :status";
			}
		}

		let items = [];
		let result;

		do {
			if (params.isQuery) {
				result = await ddb.query(params).promise();
			} else {
				result = await ddb.scan(params).promise();
			}

			result.Items.forEach((item) => items.push(item));
			params.ExclusiveStartKey = result.LastEvaluatedKey;
		} while (typeof result.LastEvaluatedKey !== "undefined");

		return {
			statusCode: 200,
			message: "Get success",
			body: JSON.stringify({
				length: items.length,
				items,
			}),
		};
	} catch (error) {
		console.error(JSON.stringify(error));
		return {
			statusCode: 400,
			message: "Get failed",
			body: JSON.stringify(error),
		};
	}
}
exports.handler = handler;
