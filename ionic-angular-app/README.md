# Ionic / Angular7 Example

This is a simple Ionic 4 app, using Angular 7.

## Getting Started
You'll need to install [nodeJS](https://nodejs.org/en/download/) -- if you're on mac use homebrew!

You'll then need to install cordova and Ionic
```bash
npm install -g cordova
npm install -g ionic
```

Then in this project directory run:
```
ionic cordova prepare
```
And then:
```
ionic serve
```
And answer 'Y' to any install prompts. And now the app will be running!

## Hows this all work?
The files you care about are all the in src/app/home directory.

home.page.html is all the standard html code.
``{{ something }}`` notation is used for templating in data. And the `*ngIf` properties let you run if statements to evaluate if something should be shown or not.

home.page.scss has all the css styling

home.page.ts has all the logic. It's typescript rather than plain js, but its not that different.

I'm doing some hacky things here, like just using 1 page, and making http calls without a service. But it's pretty simple, and should be easy to pick up. Enjoy!

## Note
The app only lets you add a successful day after 8pm, you can change this time by updating the ENABLE_ADD_AFTER_HOUR value in the index.js

You can also only submit once a day (but you can edit the db values from the dynamo console, or remove the front end validation)
