# UniversalChat-Nodejs

# Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- `npm run devStart` to start the local server

# Code Overview

## Dependencies

- [expressjs](https://github.com/expressjs/express) - The server for handling and routing HTTP requests

## Application Structure

- `app.js` - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also requires the routes and models we'll be using in the application.
- `.env` - This folder is a central location for configuration/environment variables.
- `routes/` - This folder contains the route definitions for our API.
- `views/` - This folder contains the ejs definitions for our API.
- `public/` - This folder contains the css and script definitions for our API.
- `models/` - This folder contains the schema definitions for our Mongoose models.

## People

The original author of UniversalChat is [Subanesh](https://github.com/subanesh-swe)

The current lead maintainer is [Subanesh](https://github.com/subanesh-swe)

[List of all contributors](https://github.com/subanesh-swe/graphs/contributors)

## License

  [MIT](LICENSE)