const express = require('express');
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
swaggerDefinition: {
    info: {
    version: "1.0.0",
    title: "Ecommerce API's",
    description: "Ecommerce Backend Api's",
    contact: {
        name: "Sunny Kumar"
    },
    servers: ["http://localhost:4000"]
    }
},
apis: ['app.js']
};

const app = express();
app.use(express.json());
app.use(cookieParser());

//Routes Import
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs",order , swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1',product);
app.use('/api/v1',user);
app.use('/api/v1',order);

//Middleware for error.
app.use(errorMiddleware);

module.exports = app