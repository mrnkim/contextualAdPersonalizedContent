import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
  throw new Error('PINECONE_API_KEY or PINECONE_INDEX is not defined');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

export const getPineconeClient = () => pinecone;
export const getPineconeIndex = () => pinecone.Index(process.env.PINECONE_INDEX!); 