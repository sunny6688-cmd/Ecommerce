const app = require("./app");

const dotenv = require("dotenv");

const connectDb = require("./config/database");
const connectDatabase = require("./config/database");

//Handling Uncaught Exception.
process.on("uncaughtException",(err)=> {
    console.log(`Error: ${err.message}`);
    console.log(`Closing the server due to uncaught Exceeption`);
    process.exit(1);
});

//config
dotenv.config({path: "backend/config/config.env"});

//Connecting to mongodb DataBase
connectDatabase();

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

//Unhandled Promise Rejection.
process.on("unhandledRejection", (err) =>{
    console.log(`error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);

    server.close(()=>{
        process.exit(1);
    });
});
