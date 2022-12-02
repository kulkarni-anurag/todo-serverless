const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    };

    const routeKey = event.httpMethod + " " + event.resource;

    try {
        switch (routeKey) {
            case "DELETE /tasks/{name}":
                await dynamo
                    .delete({
                        TableName: "todo",
                        Key: {
                            name: event.pathParameters.name
                        }
                    })
                    .promise();
                body = `Deleted task ${event.pathParameters.name}`;
                break;

            case "GET /tasks/{name}":
                body = await dynamo
                    .get({
                        TableName: "todo",
                        Key: {
                            name: event.pathParameters.name
                        }
                    })
                    .promise();
                break;

            case "GET /tasks":
                body = await dynamo.scan({ TableName: "todo" }).promise();
                break;

            case "PUT /tasks/update":
                let requestJSON = JSON.parse(event.body);
                await dynamo
                    .put({
                        TableName: "todo",
                        Item: {
                            name: requestJSON.name,
                            description: requestJSON.description,
                            date: requestJSON.date,
                            status: requestJSON.status ? true : false
                        }
                    })
                    .promise();
                body = `Task updated: ${requestJSON.name}`;
                break;

            case "POST /tasks/add":
                let requestJSON2 = JSON.parse(event.body);
                await dynamo
                    .put({
                        TableName: "todo",
                        Item: {
                            name: requestJSON2.name,
                            description: requestJSON2.description,
                            date: requestJSON2.date,
                            status: requestJSON2.status ? true : false
                        }
                    })
                    .promise();
                body = `New task added: ${requestJSON2.name}`;
                break;

            default:
                throw new Error("Unsupported route: " + routeKey);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
}
