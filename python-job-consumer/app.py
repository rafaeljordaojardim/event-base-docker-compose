import boto3
import json
import os
import time

# Create an SQS client (configured for LocalStack)
sqs = boto3.client('sqs',
                    endpoint_url='http://localstack:4566',
                    region_name=os.getenv("AWS_DEFAULT_REGION"),
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))

# Get queue URL from environment variable
queue_url = os.getenv("QUEUE_URL")

def process_message(message):
    """Processes a message received from the SQS queue."""
    try:
        message_body = json.loads(message['Body'])
        print(f"Processing message: {message_body}")

    except Exception as e:
        print(f"Error processing message: {e}")

if __name__ == "__main__":
    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=queue_url,
                MaxNumberOfMessages=1,  # Get up to 10 messages at once
                WaitTimeSeconds=5,       # Use long polling for efficiency
            )

            for message in response.get('Messages', []):
                process_message(message)

                # Delete the message from the queue after successful processing
                sqs.delete_message(
                    QueueUrl=queue_url,
                    ReceiptHandle=message['ReceiptHandle']
                )

        except Exception as e:
            print(f"Error receiving messages: {e}")
            time.sleep(5)  # Wait before retrying