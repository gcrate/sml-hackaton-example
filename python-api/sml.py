import os
import json
import random
import uuid
#import requests
import boto3

DYNAMO_TABLE = "sml-table"

#Register a new user, and return UUID
def register(body):
        userDetails = {
            'uuid' : uuid.uuid4(),
            'phone' : body['phone'],
            'name' : body ['name'],
            'pin' : generatePIN(),
            'goal' : body['goal'],
            'secret' : uuid.uuid4(),
            'count' : 0,
            'reported' : 
        }
        pin = generatePIN()
        print(pin)
        return "123ABC"
    
#verify pin, and return secret     
def verify():
        print('ver')
        return "ABCD"

#log a successful day or a failure
def logAction():
        print('logaction')
        return "ok"
        
#set users friend
def setFriend():
        print('setFriend')
        return "ok"

#get count of days
def getCount():
        print('count')
        return 2

#send a text message
def sendTextMsg(to, message):
    requestData = {
        'api_key' : os.environ['NEXMO_API_KEY'],
        'api_secret' : os.environ['NEXMO_API_SECRET'],
        'to' : to,
        'from' : os.environ['NEXMO_PHONE'],
        'text' : message
    }
#    requests.post(url = "https://rest.nexmo.com/sms/json", data = requestData)     

def get_user_details(uuid):
    dynamodb = boto3.client('dynamodb')
    dynamodb.get_item(TableName=DYNAMO_TABLE, Key={'uuid': uuid})
    
def save_user_details(item):
    dynamodb = boto3.client('dynamodb')
    dynamodb.put_item(TableName=DYNAMO_TABLE, Item=item)

def generatePIN():
    PIN = ""
    for i in range(5):
        PIN = PIN + str(random.randint(0,9))
    return(PIN)

def lambda_handler(event, context):
    urlsToFuncion = {
        '/register': register,
        '/verify': verify,
        '/log-action' : logAction,
        '/set-friend' : setFriend,
        '/get-count' : getCount
    }
    
    body = json.loads(event['body'])
    urlsToFuncion.get(event['path'])(body)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }


