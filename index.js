
require('dotenv').config();


var Imap = require('imap'),
    inspect = require('util').inspect;

 
var imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  tls: true
});

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
  

imap.once('ready', function() {



  openInbox();
});


   
imap.connect();