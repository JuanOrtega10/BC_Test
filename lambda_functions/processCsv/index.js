/*
  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify,
  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict'

const AWS = require("aws-sdk");
const { promises: fs } = require("fs");
const csv = require("@fast-csv/parse");
const parse = require("csv-parse/lib/sync");
const crypto = require("crypto");
const stringify = require("csv-stringify/lib/sync");
const fastCsv = require("fast-csv");
var ses = new AWS.SES({ region: "us-east-1" });


// Main Lambda entry point
const handler = async (event) => {
  console.log(event)
  const postParams = event.queryStringParameters
  console.log(postParams)
  const params = {
      Bucket: 'uploaded-csvs-bucket',
      Key: postParams.key
  };
  let path
  const s3 = new AWS.S3();
  
  const csvFile = s3.getObject(params).createReadStream();
  
  let response;
  const data = [];
  let myBody;
  const str = await new Promise((resolve, reject) => {
    let myStr = "";
    fastCsv.parseStream(csvFile, { headers: true }).on("data", (dataRow) => {
      dataRow["cedula_hash"] = crypto.createHash("sha256")
        .update(dataRow.cedula).digest("hex");
      data.push(dataRow);
    }).on("end", () => resolve(myStr));
  });
  const dataString = stringify(data, { header: true });
  myBody =  Buffer.from(dataString);
  const reqParams = {
        Bucket: 'uploaded-csvs-bucket',
        Key: `transformed-${postParams.key}`,
        Body: myBody,
        ACL: 'public-read'
  };
  console.log(params);
  console.log(myBody);
  try{
    //Upload transformed csv
    const resS3 = await s3.upload(reqParams).promise();
    response = resS3
    path = response.Location
    //Send Email
    var paramsSES = {
      Destination: {
        ToAddresses: [postParams.email],
      },
      Message: {
        Body: {
          Text: { Data: "You can download your csv transformed file from: "+response.Location },
        },
  
        Subject: { Data: "Your CSV file were transformed" },
      },
      Source: "juanalbertoortega456@gmail.com",
    };
 
  try{
    let responseSES = await ses.sendEmail(paramsSES).promise()
    response = responseSES
    
    //Put item in Dynamo
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    var dynamoParams = {
      TableName: 'processedCsvs',
      Item: {
        id: {
            N: postParams.id
          },
        key: {
            S: resS3.key
          },
        path: {
            S: resS3.Location
          },
        email: {
            S: postParams.email
          },
      }
    };
    try{
      const responseDynamo = await ddb.putItem(dynamoParams).promise()
      response = true
    }
    catch(err){
      response = err.message
    }
  }
  catch(err){
    response = err.message
  }
  
  }
  catch(err){
    console.log(err);
  }
  return JSON.stringify({
    response: response,
    params: postParams,
    path: path
  })
  
}

exports.handler = handler;

