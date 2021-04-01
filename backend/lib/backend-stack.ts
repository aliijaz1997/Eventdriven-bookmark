import * as cdk from "@aws-cdk/core";
import * as event from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from '@aws-cdk/aws-dynamodb';
// import * as cognito from "@aws-cdk/aws-cognito"
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const myBucket = new s3.Bucket(this, 'Bookmarkbucket');

    const CloudFront = new cloudfront.Distribution(this, 'Cloudfront-dist-for-Bookmark', {
      defaultBehavior: { origin: new origins.S3Origin(myBucket) },
      defaultRootObject: "index.html"
    });

    new s3deploy.BucketDeployment(this, 'DeployBookmarkEvent', {
      sources: [s3deploy.Source.asset('../frontend-bookmark/public')],
      destinationBucket: myBucket,
      distribution: CloudFront,
      distributionPaths: ["/*"]
    });

    new cdk.CfnOutput(this, "bookmarkdomain", {
      value: CloudFront.domainName,
    });
    // const userPool = new cognito.UserPool(this, "myuserpool", {
    //   selfSignUpEnabled: true,
    //   userVerification: {
    //     emailSubject: "Verify your email for our awesome app!",
    //     emailBody:
    //       "Hello, Thanks for signing up to our awesome app! Your verification code is {####}",
    //     emailStyle: cognito.VerificationEmailStyle.CODE,
    //   },
    //   signInAliases: {
    //     username: true,
    //     email: true,
    //   },
    //   autoVerify: { email: true },
    //   signInCaseSensitive: false,
    //   standardAttributes: {
    //     fullname: {
    //       required: true,
    //       mutable: true,
    //     },
    //     email: {
    //       required: true,
    //       mutable: false,
    //     },
    //   },
    //   accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    // });

    // const client = new cognito.UserPoolClient(this, "app-client", {
    //   userPool: userPool,
    //   generateSecret: true,
    //   oAuth: {
    //     flows: {
    //       authorizationCodeGrant: true,
    //     },
    //     scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
    //     callbackUrls: [`http://localhost:8000/dashboard`],
    //     logoutUrls: [`http://localhost:8000`],
    //   },
    // });

    // const domain = userPool.addDomain("CognitoDomain", {
    //   cognitoDomain: {
    //     domainPrefix: "my-bookmark-app",
    //   },
    // });

    // const signInUrl = domain.signInUrl(client, {
    //   redirectUri: `http://localhost:8000/dashboard`, // must be a URL configured under 'callbackUrls' with the client
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
