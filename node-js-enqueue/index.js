const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure AWS SDK (credentials are loaded from environment variables or ~/.aws/credentials)
AWS.config.update({ region: 'your-aws-region' }); // Replace with your AWS region
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });


const queueUrl = process.env.QUEUE_URL; 

// Middleware
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Route to enqueue a message
app.post('/enqueue', async (req, res) => {
  try {
    const { messageBody } = req.body; // Expecting message data in the request body

    if (!messageBody) {
      return res.status(400).json({ error: 'Missing messageBody in request body' });
    }

    const params = {
      MessageBody: JSON.stringify(messageBody), // Convert to string if needed
      QueueUrl: queueUrl,
    };

    const data = await sqs.sendMessage(params).promise();

    res.json({
      message: 'Message enqueued successfully',
      messageId: data.MessageId,
    });
  } catch (error) {
    console.error('Error enqueuing message:', error);
    res.status(500).json({ error: 'Failed to enqueue message' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});