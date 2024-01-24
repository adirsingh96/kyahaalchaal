
require('dotenv').config();

const {MongoClient}=require('mongodb');
const mongoClient=new MongoClient(process.env.MONGODB_URL)

var Imap = require('imap'),
    inspect = require('util').inspect;

 
var imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  tls: true
});
/*
function openInbox() {
    imap.openBox('INBOX', false, function(err, box) {
      if (err) throw err;
  
      var messageNumber = box.messages.total; // Get the number of the most recent message
      var f = imap.seq.fetch(messageNumber + ':' + messageNumber, {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT']
      });
  
      f.on('message', function(msg, seqno) {
       
     

        msg.on('body', function(stream, info) {
          let buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
        
          stream.once('end', function() {
            if (info.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)') {
              // Parse and extract the date from the header
              let header = Imap.parseHeader(buffer);
              if (header.date) {
                console.log('Date of the email:', header.date[0]); // Print the date
              }
            } else if (info.which === 'TEXT') {
              // Check if HTML content is available using regex
              let regexPattern = /<div[^>]*>[\s\S]*?<\/div>/gi;
              let htmlMatches = buffer.match(regexPattern);
        
              if (htmlMatches && htmlMatches.length > 0) {
                console.log(htmlMatches[0]); // Print the HTML content
              } else {
                console.log('No HTML <div> content found in the email.');
              }
            }
          });
        });
        
        msg.once('end', function() {
         
        });
      });
  
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
  
      f.once('end', function() {
       
        imap.end();
      });
    });
  }
  */
  


  async function fetchAndPrintData() {
    const uri = process.env.MONGODB_URL; // MongoDB URI
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      const database = client.db('kay_haal_chaal'); // Replace with your database name
      const collection = database.collection('emails'); // Replace with your collection name
  
      // Fetch all documents from the collection
      const documents = await collection.find({}).toArray();
  
      // Print each document
      documents.forEach(doc => {
        console.log(doc);
      });
  
    } catch (error) {
      console.error('An error occurred while fetching data:', error);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }

  function openInbox() {
    imap.openBox('INBOX', false, async function(err, box) {
      if (err) throw err;
  
      // Connect to MongoDB
      await mongoClient.connect();
      const db = mongoClient.db('kay_haal_chaal'); // Replace with your actual db name
      const collection = db.collection('emails'); // Replace with your actual collection name
  
      var messageNumber = box.messages.total; // Get the number of the most recent message
      var f = imap.seq.fetch(messageNumber + ':' + messageNumber, {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT']
      });
  
      f.on('message', function(msg, seqno) {
        let emailData = {
          html: '',
          text: '',
          date: '',
          subject: '',
          from: ''
        };
  
        msg.on('body', function(stream, info) {
          let buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
  
          stream.once('end', function() {
            if (info.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)') {
              let header = Imap.parseHeader(buffer);
              if (header.date) {
                emailData.date = header.date[0];
              }
              if (header.subject) {
                emailData.subject = header.subject[0];
              }
              if (header.from) {
                emailData.from = header.from[0];
              }
            } else if (info.which === 'TEXT') {
              // Assume we want to save the text part of the email as well
              emailData.text = buffer;
            }
          });
        });
  
        msg.once('end', async function() {
          // Insert email data into MongoDB
          try {
            await collection.insertOne(emailData);
            console.log('Email data inserted into MongoDB');
            mongoClient.close().then(() => {
              console.log('MongoDB connection closed.');
              process.exit(); // Exit the node process if required
            }).catch((error) => {
              console.error('Error closing MongoDB connection:', error);
              process.exit(1); // Exit with an error code
            });

          } catch (insertError) {
            console.error('Error inserting email data into MongoDB:', insertError);
          }
        });
      });
  
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
  
      f.once('end', function() {
        console.log('Done fetching the most recent message.');
        imap.end();
      });
    });
  } 

imap.once('ready', function() {



  openInbox();
});


   
imap.connect();


fetchAndPrintData();
