const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async(event:any) => {

    console.log("The event coming from http data source is = ", event)
    const params = {
        TableName: process.env.BookmarkTable,
        Item: {
            id: event.detail.id,
            title: event.detail.title,
            desc: event.detail.desc,
            url: event.detail.url
        }
    };



    try{

        await docClient.put(params).promise()
        return event;

    }catch(err){

        console.log('DynamoDB error: ', err);
        return null;
    }   

}