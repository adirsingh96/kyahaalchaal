
require('dotenv').config();
const { sendEmail } = require('./sendEmail'); // Adjust the path as necessary
const {MongoClient}=require('mongodb');
const { weeklyReview } = require('./emailEntries');
const cron = require('node-cron');
const {askGPT}=require('./open_ai_test')

// Define time components
const hours = 21; // 3 PM
const minutes = 0;
const seconds = 0;

const schedule = `${seconds} ${minutes} ${hours} * * *`;




const mongoClient=new MongoClient(process.env.MONGODB_URL)

var Imap = require('imap'),
    inspect = require('util').inspect;

console.log(process.env.EMAIL_USER)    
console.log(process.env.EMAIL_PASS)

 
var imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  tls: true
});

  


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


  async function isMongoClientConnected() {
    try {
      // Try a simple operation to check if the client is connected
      await mongoClient.db().admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  function openInbox() {
    imap.openBox('INBOX', false, async function(err, box) {
      if (err) throw err;
  
      // Connect to MongoDB
      await mongoClient.connect();
      const db = mongoClient.db('kay_haal_chaal');
      const collection = db.collection('emails');
  
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
  
          stream.once('end', async function() {
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
              emailData.text = buffer;
            }
  
            // Create a unique identifier
            const emailId = emailData.date + emailData.from + emailData.subject;
  
            // Check if email already exists in the database
            const emailExists = await collection.findOne({ id: emailId });
           
            if (!emailExists) {
              // Insert email data into MongoDB
              try {
                await collection.insertOne({ ...emailData, id: emailId });
                console.log('Email data inserted into MongoDB');
              } catch (insertError) {
                console.error('Error inserting email data into MongoDB:', insertError);
              }
            } else {
              console.log('Duplicate email skipped');
             // mongoClient.close();
            }
          
            
  
     
          });
        });
  
        f.once('error', function(err) {
          console.log('Fetch error: ' + err);
        });
  
        f.once('end', async function() {
          console.log('Done fetching the most recent message.');
         imap.end();

          if (await isMongoClientConnected()) {
            try {
              await mongoClient.close();
              console.log('MongoDB connection closed.');
            } catch (error) {
              console.error('Error closing MongoDB connection:', error);
            }
          } else {
            console.log('MongoDB connection was already closed.');
          }
     
          

        
        
        });
      });

     
      

     
  
    });

   
  }
  





function reconnectAndOpenInbox() {
  console.log("inside reconnect and open Inbox")
  if (imap.state === 'disconnected') {
    console.log("imap disconnected")
    imap.connect();
  }
  openInbox();
}



// IMAP ready event
imap.once('ready', function() {
 // openInbox();

  // Schedule the inbox checking task to run every minute
  cron.schedule('* * * * *', () => {
    console.log("one minute timer triggered")
    reconnectAndOpenInbox();
  });
});



cron.schedule(schedule, () => {
  // Your scheduled task
  console.log("triggred...")
  sendEmail("adirsingh96@gmail.com", "daily update", "kya haal chaal hai bhai?", "<b>kya haal chaal hai bhai?</b>").catch(console.error);


}, {
  timezone: "Asia/Kolkata"
});

cron.schedule('45 8 * * *', () => {
  console.log('Running the scheduled task at 9 AM daily...');
  const days = 7; // Adjust as needed
  weeklyReview(days).then(content => {
    // Logic to handle the content, e.g., send an email
    console.log(content); // Example action
    askGPT(content).then(response =>{
      console.log(response)
      sendEmail('adirsingh96@gmail.com','Do this to make you next week productive','NA',response)
    }).catch(error => console.log(error))
  }).catch(console.error);
}
, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});


imap.connect();



