import * as cdk from '@aws-cdk/core';
import * as event from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from '@aws-cdk/aws-dynamodb';
export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

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

    const BookmarkTable = new dynamodb.Table(this, "dynamotableeventbasedBookmark", {
      tableName: "BookmarkTable",
      partitionKey: {
        name: "link",
        type: dynamodb.AttributeType.STRING
      }
    })
    const DynamodbAsaDS = api.addDynamoDbDataSource("dynamodss", BookmarkTable);
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/",
      {
        name: "EventBridges",
        description: "From Appsync to Eventbridges",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "eventss",
        },
      }
    );



    event.EventBus.grantPutEvents(httpDs);

    DynamodbAsaDS.createResolver({
      typeName: "Query",
      fieldName: "listBookmark",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()

    })

    httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "createBookmark",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("response.vtl"),
    });

    DynamodbAsaDS.createResolver({
      typeName: "Mutation",
      fieldName: "deleteBookmark",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem("link", "link"),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()
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
        source: ["ForCreatingBookmark"],
      },
    });
    rule.addTarget(new targets.LambdaFunction(consumerLambda));
  }
}
