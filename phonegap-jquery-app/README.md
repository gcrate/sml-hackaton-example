# Phonegap / jQuery Example

This is a simple PhoneGap app, using jQuery.

## Getting Started
The easiest way to get started with this is to just download the phonegap desktop app from https://phonegap.com/getstarted/

You can then open the app in there, and serve it up in your browser.

Nothing else needed!

## Hows this all work?
The www/index.html file contains all the html. All the different 'pages' are just divs, that are hidden/shown depending on the state

All the javascript can be found in the www/js/index.js file.

All the CSS is in the www/js/css/index.css file

## Note
The app only lets you add a successful day after 8pm, you can change this time by updating the ENABLE_ADD_AFTER_HOUR value in the index.js

You can also only submit once a day (but you can edit the db values from the dynamo console, or remove the front end validation)
