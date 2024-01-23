
require('dotenv').config();
const { simpleParser } = require('mailparser');


var Imap = require('imap'),
    inspect = require('util').inspect;

 
var imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  tls: true
});

function openInbox(cb) {
    imap.openBox('INBOX', false, function(err, box) {
      if (err) throw err;
  
      var messageNumber = box.messages.total; // Get the number of the most recent message
      var f = imap.seq.fetch(messageNumber + ':' + messageNumber, {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT']
      });
  
      f.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        var headerBuffer = '';
        var bodyBuffer = '';
  

        msg.on('body', function(stream, info) {
          if (info.which === 'TEXT') {
            // Accumulate the stream data into a buffer
            let rawEmail = '';
            stream.on('data', function(chunk) {
              rawEmail += chunk.toString('utf8');
            });
        
            stream.once('end', function() {
              // Check if HTML content is available using regex
              let regexPattern = /<div[^>]*>[\s\S]*?<\/div>/gi;
              let htmlMatches = rawEmail.match(regexPattern);
        
              if (htmlMatches && htmlMatches.length > 0) {
                console.log('Extracted HTML content:', htmlMatches[0]);
              } else {
                console.log('No HTML <div> content found in the email.');
              }
            });
          }
        }); 
        
        msg.once('end', function() {
          //console.log('Headers: %s', inspect(Imap.parseHeader(headerBuffer)));
          console.log('Body: %s', bodyBuffer);
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

  openInbox(function(err, box) {
    if (err) throw err;
    var f = imap.seq.fetch(box.messages.total+':'+box.messages.total, {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)','TEXT'],
      struct: true
    });
    f.on('message', function(msg, seqno) {
     
      var prefix = '(#' + seqno + ') ';
      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
          console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
        });
      });
      msg.once('attributes', function(attrs) {
        console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
      });
      msg.once('end', function() {
        console.log(prefix + 'Finished');
      });
    });
    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });
    f.once('end', function() {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
});


imap.once('error', function(err) {
    console.log(err);
  });
   
  imap.once('end', function() {
    console.log('Connection ended');
  });
   
  imap.connect();