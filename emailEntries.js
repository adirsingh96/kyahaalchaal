

require('dotenv').config();
const { MongoClient } = require('mongodb');
const { sendEmail } = require('./sendEmail')

const quotedPrintable = require('quoted-printable');
const cheerio = require('cheerio');
const utf8 = require('utf8');
const { askGPT } = require('./open_ai_test');

function extractInnerHtml(encodedHtmlContent) {
  // Decode the content
  let decodedContent = utf8.decode(quotedPrintable.decode(encodedHtmlContent));

  // Use cheerio to load the decoded HTML
  const $ = cheerio.load(decodedContent);

  // Extract the inner HTML of the first div
  return $('div').first().html();
}

async function dumpCollection(days) {
  const uri = process.env.MONGODB_URL; // Make sure to set your environment variable
  const client = new MongoClient(uri);
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  try {
    await client.connect();
    const database = client.db('kay_haal_chaal'); // Replace with your database name
    const collection = database.collection('emails'); // Replace with your collection name

    const documents = await collection.find({}).toArray(); // Fetches all documents from the collection
    let emailHtml = '<html><body>';
    documents.forEach(doc => {
      const emailDate = new Date(doc.date); // Assuming date is in a suitable format
      if (emailDate >= dateLimit) {
        emailHtml += `<h3>Date: ${doc.date}</h3>`;
        emailHtml += `<div>${extractInnerHtml(doc.text)}</div>`; // Assuming extractInnerHtml returns the cleaned HTML content
      }
    });
    emailHtml += '</body></html>';
  return emailHtml;
  ;
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await client.close();
  }
}
async function weeklyReview(days) {
  try {
    const emailHtml = await dumpCollection(days);
    return emailHtml;
  } catch (error) {
    console.error('Failed to dump collection:', error);
    return '';
  }
}


const days = 7; // Number of days you want to go back
/*
weeklyReview(days).then(content => {
  // You can now send this content via email or use it elsewhere
  //sendEmail('adirsingh96@gmail.com','last 5 days journal entries','NA',content); // or sendMail(content)
  askGPT(content).then(response =>{
    //console.log(response)
    sendEmail('adirsingh96@gmail.com','Do this to make you next week productive','NA',response)
  }).catch(error => console.log(error))
})
.catch(error => console.error('Error fetching email content:', error));
*/

module.exports = { weeklyReview };
