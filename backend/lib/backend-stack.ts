import * as cdk from "@aws-cdk/core";
import * as event from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from '@aws-cdk/aws-dynamodb';
// import * as cloudfront from '@aws-cdk/aws-cloudfront';
// import * as origins from '@aws-cdk/aws-cloudfront-origins';
// import * as s3 from '@aws-cdk/aws-s3';
// import * as s3deploy from '@aws-cdk/aws-s3-deployment';
export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // const myBucket = new s3.Bucket(this, 'Todobucket');

    // const CloudFront = new cloudfront.Distribution(this, 'Cloudfront-dist-for-todo', {
    //   defaultBehavior: { origin: new origins.S3Origin(myBucket) },
    //   defaultRootObject: "index.html"
    // });

    // new s3deploy.BucketDeployment(this, 'DeployTodoEvent', {
    //   sources: [s3deploy.Source.asset('. ./front-end/public')],
    //   destinationBucket: myBucket,
    //   distribution: CloudFront,
    //   distributionPaths: ["/*"]
    // });

    // new cdk.CfnOutput(this, "bookmarkdomain", {
    //   value: CloudFront.domainName,
    // });

    const api = new appsync.GraphqlApi(this, "BookmarkeventAppsync", {
      name: "BookmarkeventAppsync",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY
        }
      },
      xrayEnabled: true
    });

    const BookmarkTable = new dynamodb.Table(this, "dynamotablebookmarktodo", {
      tableName: "BookmarkTable",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      }
    })
    const DynamodbAsaDS = api.addDynamoDbDataSource("dynamodatasource", BookmarkTable);
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/",
      {
        name: "EventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );



    event.EventBus.grantPutEvents(httpDs);

    httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "createBookmark",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("response.vtl"),
    });

    DynamodbAsaDS.createResolver({
      typeName: "Query",
      fieldName: "listBookmark",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()

    })
    
    DynamodbAsaDS.createResolver({
      typeName: "Mutation",
      fieldName: "deleteBookmark",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem("id", "id"),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })

    const consumerLambda = new lambda.Function(this, "EventBookmarkFunction", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "consumer.handler",
    });
    consumerLambda.addEnvironment("BookmarkTable", BookmarkTable.tableName)
    BookmarkTable.grantFullAccess(consumerLambda);
    const rule = new event.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: ["ForBookmarkTodo"],
      },
    });
    rule.addTarget(new targets.LambdaFunction(consumerLambda));
  }
}
