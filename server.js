// This line configures a node server for the app
const express = require("express");
// Here we used the server in myAppServer
const myAppServer = express();
// This helps to find the root path in the server
// In the below three lines we have everything that needs to be imported
const path = require("path");
const mongodb = require("mongodb");
// body parser is used th fetch data easily from form if you have any in the webapp
const bodyParser = require("body-parser");

const mongo_client = mongodb.MongoClient;
// process.env is used to declare environment variable.we will have url,port,database here.so,we have env variable for these
// all of these are setup on heroku since i am using heroku for deployment
// "//localhost/database" here on the next line basically the mongodb mlab of heroku link goes so as to setup the webapp fully 
const URL = process.env.MONGODB_URL || "mongodb://localhost/database";
const PORT = process.env.PORT || 5000;
const DATABASE_NAME = process.env.DATABASE_NAME;
// so,what it does? below two lines help in extraction of data from form
// and to store in mongodb database
myAppServer.use(bodyParser.urlencoded({ extended: false }));
myAppServer.use(bodyParser.json());

// now created first route i.e. ('/routename') will get you to that linked page

// This route will be for the one who will be working for the magician to enter data
// into the form
// so,in line number 27 when goes to this page the function (res.res) is called and when it is called,it sends the 
// user to insider.html file.(res,res),(err,client) function are expree functions
myAppServer.get("/insider", (res, res) =>
    res.sendFile(path.join(__dirname, "insider.html"))
);
// so this is a post request route
// usenewurlparser is a flag which will update the database
myAppServer.post("/insider", (res, res) => {
    mongo_client.connect(URL, {useNewUrlParser : true}, (err,client)=>{
        // we will check here if there is an error and else we will connect the user to database
        if (err) {
            console.log(err);
        } else {
            // here passed database name is just an environment variable
            const db=client.db(DATABASE_NAME);
            
            const collection=db.collection("names");
            const entries={
                // from http requests name of the card
                name : req.body.name.toLowerCase(),
                // here card is difned like this bcz in the card folder, all the png images have names on this manner
                card : req.body.number+ "_Of_" + req.body.suit
            };
            collection.insertOne(entries,(err,result)=>{
                if (err) {
                    console.log(err);
                } else {
                    res.send("Database entry successful")
                }

            })
            db.close();
        }
    })

})
//when user enters their name at the end of the url name should be passed as an arguement
myAppServer.get("/:parameter*", (req,res)=>{
    const name=req.url.slice(1).toLocaleLowerCase();
    mongo_client.connect(URL,{useNewUrlParser:true},(err,client)=>{
        if (err) {
            // if there is error thn this will be executed
            console.log(err);
        } else {
            const db=client.db(DATABASE_NAME);
            const collection=db.collection("names");
            if (name=="deleteall") {
                collection.remove({});
                res.send("Database reset");
            } else {
                // second name is the name variable that we have assigned above
                collection.find({name : name}).toArray((err,result)=>{
                    if (err) {
                        console.log(err)
                    } else {
                        if (result.length) {
                            // here the .card you see is defined before
                            const card=result[result.length-1].card+".png";
                            // here /cards/ signifies that we are going to the cards folder to show the particular card that is on the card 
                            // variable
                            res.sendFile(path.join(__dirname+"/cards"+card));
                        } else {

                            res.status(404).send("First hire a magician! LOL");
                            
                        }
                        db.close();
                    }
                })
            }
        }
    })
})


// Now we need to make our database listen to the routes the user using
myAppServer.listen(PORT,()=> console.log('Server listening on port ${PORT}'));

// to run it on local machine we have to write code for mongodb database creation

// Before deploying in heroku using git add . ,its a good practice to make a git ignore file