from openai import OpenAI
from io import BytesIO
from dotenv import load_dotenv
import os

# Configure OpenAI API Key
load_dotenv()
api_key = os.getenv("api-key")
client = OpenAI(api_key=api_key)

# Prepare prompt for generating alt text based on section title and hover text
prompt ='''You are a chatbot's RAG pipeline validation assistant and you are expected to generate questions based of the given document. Those questions would then be used against the DialogFlow's Datastore features which answers questions based on the document shared. Your tasks as a validation assistant includes the following:
          1. Generate Question and Answer pair based of the document provided.
                a. Generate a total of 3 category of questions namlely: Easy, Medium and Difficult. Each category to include a total of 10 QA pairs. So, that I can evaluate the Datastore's capability towards answering questions of varying difficulty.
                b. The answer should be purely based on the document provided. No made up answers allowed. Since you are the one who's generating questions, create question answer pairs only when you know the answer exists in the document.
                c. Each question should be unique and shouldn't be repetititve.
                d. The questions should'nt just be answer the text from the document. Make sure to include a fee questions that answer URLs as the response.
                e. DO NOT reference ".... as per the document", ".... from the document". As we want to simulate that the questions are coming from users and they do not know that the questions are being answered from the document.
            Format of the output:
            Level: Easy
                Q1. 
                A:

                Q2
                A:

            Level: Medium
                Q1. 
                A:

                Q2
                A:

            Level: Difficult
                Q1. 
                A:

                Q2
                A:
          '''

User_request = f"{open(r"DataStore\\Thoracic-DLDR.txt","r").read()}"
# print(User_request)

# Use the OpenAI API to generate alt text
response = client.chat.completions.create(
model="gpt-4-turbo",
messages=[
    {
        "role": "developer", "content": [
            {
            "type" :"text",
            "text" : prompt
    }
        ]
    },
    {
        "role" : "user",
        "content" : [
            { "type" :"text",
            "text" : f"Document : + {User_request}"
            }
        ]
    }
        ]
);

# Output generated alt text
print(response.choices[0].message.content)

os.makedirs(os.path.join("DataStore","Questionnaire"), exist_ok=True)
# transfer the questionnaire to a text document
f= open(r"DataStore\\Questionnaire\\Thoracic-DLDR-Questionnaire.txt","w")
f.write(response.choices[0].message.content)
f.close()
