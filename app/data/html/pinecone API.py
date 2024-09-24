PINECONE_API_KEY="YOUR_API_KEY"

from pinecone import Pinecone
pc = Pinecone(api_key="f256ff03-43d2-4ddc-bfbe-bd2ba739de29")

assistants = pc.assistant.list_assistants()