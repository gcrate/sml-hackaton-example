# Lambda Java API Example - SinceMyLast
This API was created for Java 8 (But it should build in 9+)

## Packaging for deployment
Build the project with Maven
`mvn clean install`

You'll upload the resulting SinceMyLastSvcs.jar from the target directory.

On the lambda console set the handler as `com.sincemylast.api.ApiHandler::handleRequest`

## Env Variables
* NEXMO_PHONE_NUM = 12012790705
* NEXMO_API_KEY = 3f36b6b3
* NEXMO_API_SECRET = [We'll send this out separately, don't want to put secrets on github!]

## API Endpoints
All the endpoints should be called as POST requests

### Register
**Description:** Registers a new user, sends an SMS with their pin and return the users UUID  
**Endpoint:** /register  
**POST Body:**  
```json
  {
    "phone": "1513123123",
    "name": "Gizmo",
    "goal": "ate after midnight"
  }
```
**Example Result:**  
```json
  {
    "uuid" : "77ef90fc-042a-479c-822b-81b481921d28"
  }
```

### Verify
**Description:** Verifies the user, and returns their secret  
**Endpoint:** /verify  
**POST Body:**  
```json
  {
    "uuid": "77ef90fc-042a-479c-822b-81b481921d28",
    "pin": "01234",
  }
``` 
**Example Result:**  
```json
  {
    "secret": "639b7209-997b-4292-a029-e03a14a5a280"
  }
```  

### Log action  
**Description:** Log another successful day or a failure  
**Endpoint:** /log-action  
**POST Body:**  
```json
  {
    "uuid": "77ef90fc-042a-479c-822b-81b481921d28",
    "secret": "639b7209-997b-4292-a029-e03a14a5a280",
    "action": "01234",
  }
```
possible action values are `success` or `reset`  
**Example Result:**  
```json
  {
    "count" : 2
  }
```  

### Set Friend
**Description:** Sets friends phone number (notified on failures)  
**Endpoint:** /set-friend  
**POST Body:**  
```json
  {
    "uuid": "77ef90fc-042a-479c-822b-81b481921d28",
    "secret": "639b7209-997b-4292-a029-e03a14a5a280",
    "friend": "1513098098",
  }
```
**Example Result:**  
```json
  {
    "success" : true
  }
```  

### Get Count / User state
**Description:** Returns all the user details  
**Endpoint:** /set-friend  
**POST Body:**  
```json
  {
    "uuid": "77ef90fc-042a-479c-822b-81b481921d28",
    "secret": "639b7209-997b-4292-a029-e03a14a5a280",
  }
```
**Example Result:**  
```json
  {
    "count": 3,
    "goal": "ate after midnight",
    "reported": "2019-01-01",
    "allowReport": true,
    "friend": "1513098098"
  }
```  
