

  require('dotenv').config();

async function loadOpenAI() {
  const { default: OpenAI } = await import('openai');
  return new OpenAI({
    apiKey: process.env.OPEN_AI_SECRET,
  });
}

async function askGPT(query) {
    try {
        const guide = 'This my journal entry for last weeks with html taks,based on it give me 3 action points specific to my problems to make this week productive (html format the response so that it looks good on email):';
        const openai = await loadOpenAI();
        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: guide + query }],
        });
    
        return chatCompletion.choices[0].message.content;
      } catch (error) {
        console.error("Error fetching completion from OpenAI:", error);
        // Return null (or "None") to indicate an error occurred
        return null;
      }
}

module.exports = { askGPT };



  