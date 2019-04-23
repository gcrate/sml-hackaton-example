# Hackathon AWS Setup

## AWS Console access
You'll need an AWS account. You can signup [here](https://aws.amazon.com/) -- Sign up with your personal email. And unfortunately you can't link your corporate card to you account - but everything we do should fit into the AWS free tier

## Lambda Function Setup
Before you start these steps you'll have to have built an artifact for your API. (It can be a work in progress, but you'll want something)

1. Login to your the AWS console using your account.
2. In the services menu (top left) select Lambda - it's under compute
3. Click the 'Create Function' orange button (Top left)
4. Leave the top part as 'Author from scratch' and fill in the form below (name & runtime - choosing Java 8 or Python 3.7 or whatever you've decided) and leave the execution role as the 'Create a new role' option
5. Click 'Create Function' at the bottom
6. In the 'Function Code' section you can upload your jar or python zip, and set the correct handler
7. Below that if you're using the example code, or want to use the Nexmo to send out text messages you'll want to set the following environment variables:
  * NEXMO_PHONE_NUM = 12012790705
  * NEXMO_API_KEY = 3f36b6b3
  * NEXMO_API_SECRET = [We'll send this out separately, don't want to put secrets on github!]
8. Lastly you'll want to click save at the top.

You can test using the lambda console. You'll want to use the 'Amazon API Gateway AWS Proxy' event template, and fill in the path and body values

## Dynamo DB setup
The example API uses [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) to store it's data, as it's super simple to use from Lambda (and super fast & cheap)

So if you want to use it too you'll need to perform the following.

1. Create your table:
  1. Under the services menu select DynamoDB (It's in the database section)
  2. Click the 'create table' button
  3. Enter the table name, and primary key. If you're using the example API, the java versions points to a table called 'since-my-last-data' and the python points to 'sml-table'. Both use `uuid` as the primary key
  4. Click the 'Create' button
2. Grant your lambda function permissions to use DynamoDB
  1. Under services menu select IAM (It's in the Security, Identity, & Compliance section)
  2. Click 'Polices' in the left hand menu, and click 'Create Policy'
  3. In the visual editor add the following:
    * Services = DynamoDB
    * Actions = GetItem, Scan, PutItem, UpdateItem
    * Resources = restrict to your new dynamo table (or leave open, this is a hackathon)
  4. Click review policy, name it, and create it
  5. Click Roles on the left hand menu, and select your lambda's role
  6. Click 'Attach Policy', and chose your new policy

## API Gateway
The API gateway allows you to call your lambda function via HTTP requests.

You'll want to perform these following steps to set it up:
1. Under the services menu select API Gateway (It's in the Networking & Content Delivery section)
2. Click the 'Create API button'
3. Leave all the settings at default, and just name your Api, then click create
4. Click Actions -> Create Resource
5. Check the 2 checkboxes, and click the create button
6. On the next screen, select your lambda function and click save
7. Click Actions -> Deploy API, select [New Stage], name it, and click Deploy
8. Now you're done! Copy the url for your API (from that blue box) and use that for accessing your function. If you're using the example app, you can replace the SERVICE_URL with your own
