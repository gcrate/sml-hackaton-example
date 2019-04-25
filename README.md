# Hackathon Example

## Introduction
This repo contains example code for the hackathon for a simple accountability app - "SinceMyLast". The app keeps track of the number of days since the user did something (like smoke, drink soda, forget to put the new cover sheet on their TPS reports) and can inform a friend when they fail by text message.  

You can use this as a starting point for your project, or just inspiration.

## Mobile App
There are 2 examples of the same mobile app. One using plain vanilla [Phonegap + jQuery](/phonegap-jquery-app), and the other using [Ionic with the Angular framework](/ionic-angular-app).

If you know plain javascript/html/css the phonegap/jquery app should be easy to pickup.
If you know Angular7, or want to learn a framework, the Ionic option would be better.

*Disclaimer: I learnt Angular 7 while creating the angular project, so it's super hacky! For a less hacky ionic app w/ Facebook integration you should check out [Joe's example](https://github.com/joerust1978/ionic-application-starter)*

For both of these projects require you to install NodeJs and Cordova. And depending on the selected project you'll want to install ionic or phonegap. Instructions for installation can be found [here](/Software-Setup.md). If you want to run the app on Android, you'll also need AndroidSDK, or iOS you'll need a Mac and XCode - but you can always present your app from you laptops browser.

## The API
There are 2 examples for the backend. One written in [Java](/java-api) and the other in [Python](/python-api).

Both examples are made to the run on [AWS Lambda](https://aws.amazon.com/serverless/videos/video-lambda-intro/) -- If you've not heard of it, thats serverless compute provided by AWS. (Which means it only spins up a server when its called - That'll keep our infrastructure costs down to basically 0)

We'll also need to setup an [AWS Api Gateway](https://aws.amazon.com/api-gateway/) to invoke the lambda function.

Instructions for AWS Setup with Lambda and API Gateway can be found [here](/AWS-Setup.md)


## Additional Information
Additional info can be found [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
