import os
import json
import random
import uuid
import requests
import boto3
import datetime

# In true hackathon style this is the first API i've written in python
# So please forgive anything not done in the correct python way

DYNAMO_TABLE = 'sml-table'
HEADERS = {
    'Context-Type' : 'application/json',
    'Access-Control-Allow-Origin' : '*'
    }

#Register a new user, and return UUID
def register(body):
    #Missing validation but it's a hackaton ¯\_(ツ)_/¯
        pin = generatePIN()
        userUuid = str(uuid.uuid4())

        userDetails = {
            'uuid' : userUuid,
            'phone' : body['phone'],
            'name' : body ['name'],
            'pin' : pin,
            'goal' : body['goal'],
            'secret' : str(uuid.uuid4()),
            'count' : 0,
            'reported' : '2000-01-01',
            'friend' : ' '
        }

        print('pin: ' + pin)

        save_user_details(userDetails)

        sendTextMsg(body['phone'], 'SinceMyLast Verification Code:' + pin)

        return {
            'statusCode': 200,
            'body': json.dumps({ 'uuid' : userUuid }),
            'headers' : json.dumps(HEADERS)
        }

#verify pin, and return secret
def verify(body):
        userDetails = get_user_details(body['uuid'])
        if body['pin'] != userDetails['pin']:
            return {
                'statusCode': 401,
                'body': json.dumps({ 'error' : 'Invalid pin!' }),
                'headers' : json.dumps(HEADERS)
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps({ 'secret' : userDetails['secret'] }),
                'headers' : json.dumps(HEADERS)
            }

#log a successful day or a failure
def logAction(body):
        userDetails = get_user_details(body['uuid'])
        #Validate user
        if body['secret'] != userDetails['secret']:
            return {
                'statusCode': 401,
                'body': json.dumps({ 'error' : 'Invalid secret' }),
                'headers' : json.dumps(HEADERS)
            }
        else:
            if body['action'] == 'success':
                userDetails['count'] = userDetails['count'] + 1
            #else we'll assume it's reset (hackathon = assumptions)
            else:
                userDetails['count'] = 0

            userDetails['reported'] = getFormattedEstDate()

            if userDetails['friend'] != ' ':
                print('notifiying friend ' + userDetails['friend'])
                sendTextMsg(userDetails['friend'], userDetail['name'] + ' ' + userDetail['goal'] + " today!")

        save_user_details(userDetails)
        return {
            'statusCode': 200,
            'body': json.dumps({ 'success' : True }),
            'headers' : json.dumps(HEADERS)
        }

#set users friend
def setFriend(body):
        userDetails = get_user_details(body['uuid'])
        if body['secret'] != userDetails['secret']:
            return {
                'statusCode': 401,
                'body': json.dumps({ 'error' : 'Invalid secret' }),
                'headers' : json.dumps(HEADERS)
            }
        else:
            userDetails['friend'] = body['friend']
            save_user_details(userDetails)
            return {
                'statusCode': 200,
                'body': json.dumps({ 'success' : True }),
                'headers' : json.dumps(HEADERS)
            }

#get count of days
def getCount(body):
        userDetails = get_user_details(body['uuid'])
        if body['secret'] != userDetails['secret']:
            return {
                'statusCode': 401,
                'body': json.dumps({ 'error' : 'Invalid secret' }),
                'headers' : json.dumps(HEADERS)
            }
        else:
            returnBody = {
                'count' : int(userDetails['count']),
                'goal' : userDetails['goal'],
                'reported' : userDetails['reported'],
                'allowReport' : userDetails['reported'] != getFormattedEstDate(),
                'friend' : userDetails['friend'] if userDetails['friend'] != ' ' else ''
            }

            return {
                'statusCode': 200,
                'body': json.dumps(returnBody),
                'headers' : json.dumps(HEADERS)
            }


#send a text message
def sendTextMsg(to, message):
    requestData = {
        'api_key' : os.environ['NEXMO_API_KEY'],
        'api_secret' : os.environ['NEXMO_API_SECRET'],
        'to' : to,
        'from' : os.environ['NEXMO_PHONE'],
        'text' : message
    }
    requests.post(url = "https://rest.nexmo.com/sms/json", data = requestData)

def get_user_details(userUuid):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(DYNAMO_TABLE)
    return table.get_item(Key={'uuid': userUuid})['Item']

#If user isn't found this breaks... but... hackaton
def save_user_details(item):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(DYNAMO_TABLE)
    table.put_item(Item=item)

def generatePIN():
    PIN = ""
    for i in range(5):
        PIN = PIN + str(random.randint(0,9))
    return(PIN)

def getFormattedEstDate():
    return (datetime.datetime.utcnow() - datetime.timedelta(hours=4)).strftime('%Y-%m-%d')

def lambda_handler(event, context):
    urlsToFuncion = {
        '/register': register,
        '/verify': verify,
        '/log-action' : logAction,
        '/set-friend' : setFriend,
        '/get-count' : getCount
    }

    body = json.loads(event['body'])
    return urlsToFuncion.get(event['path'])(body)
