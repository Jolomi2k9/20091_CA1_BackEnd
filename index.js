const express = require('express')
//the app will use the express node module
const app = express()
const { MongoClient, ObjectId } = require("mongodb");

//connection to the mongodb server
const url = 'mongodb://localhost:3000';
const client = new MongoClient(url, { useUnifiedTopology: true });
 
 // Database name
const dbname = "library"; 
 
//make use of bodyparser middleware, which allows us to parse the body of the response
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false}))

let db, booksDb;

run().catch(console.dir);


//home page route
app.get('/', (req, res) => { 
    // console.log(booksDb)
    res.send('Hello world2')
})

//get 1 book by id 
app.get('/book/:id', (req, res) => {
    console.log('You are in the book route');
    let id = req.params.id;
    
    (async ()=> {
        try{
            const foundBook = await  booksDb.findOne({"_id":ObjectId(id)})
            res.json(foundBook)
        } catch(err){
            // res.sendStatus(404);
            res.send('Invalid user id');
        }
    });
})

//get all books
app.get('/book', (req,res) =>{
    console.log('Getting all books');

    (async ()=>{
        let books = [];
        const bookCursor = booksDb.find();
        await bookCursor.forEach(book =>{
            books.push(book);
        });
        res.send(books);
    })( );
});


//post book route
app.post('/book', (req, res) =>{
    console.log('I have received a post request in the /book route');
    //create a book object
    let book = new Book(req.body.title, req.body.model, req.body.availability, req.body.fuelType, req.body.warranty)
    //insert it to the database
    booksDb.insertOne(book)
    res.sendStatus(200)
})


// book router for the update
app.put('/book', (req, res) => {
    console.log(' Book router for update ');
    async function findBook() {
        try{
        const foundBook = await  booksDb.findOne({"_id": ObjectId(req.body.id)})
        //if the book is found edit it and send a message to the user
        if(foundBook !== null){
            let book = new Book(
                foundBook.title, 
                foundBook.author, 
                foundBook.availability, 
                foundBook.publisher, 
                foundBook.year)

            book.title = req.body.title;
            book.author = req.body.author;
            book.availability = req.body.availability;
            book.year = req.body.year;
            
            try{
            const updateResult = await booksDb.updateOne(
                                                {"_id": ObjectId(req.body.id)}, 
                                                {$set:book})
            } catch(err){
                console.log(err.stack)
            }
                   
            res.send("The book was updated");            
        } else {
              //if the book is not found send a message to the user saying that this entry doe not exist
            res.send("The book was not updated");
        }}catch(err){
            res.send("Object id is invalid")
        }
    };
    findBook();

})
// book router to delete by id
app.delete('/book', (req, res) =>{

    console.log('book router to delete one book');

    console.log("Deleting the book with the id: " + req.body.id)

    booksDb.deleteOne({"_id": ObjectId(req.body.id)})
    async function findBook() {
        const foundBook = await  booksDb.findOne({"_id": ObjectId(req.body.id)})
        if(foundBook !== null){
            res.send("The entry was not deleted")
        }
        res.send("The entry was deleted")
    };
    findBook();
})

//code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();
        
        //connect to the correct database 
        db = client.db(dbname);

        //get reference to our book "table"
        booksDb = db.collection("book");

        //start listening to requests 
        app.listen(3000);
    } catch (err) {
        //in the event we cannot connect to our database, throw an error in the console
         console.log(err.stack);
    }
}

//book class used to create book objects
class Book {
    constructor(title, author, availability =false, publisher, year){
        this.title = title;
        this.author = author;
        this.availability = availability;
        this.publisher = publisher;
        this.year = year;
    }  
}