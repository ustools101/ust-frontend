const mongoose = require('mongoose');
const { config } = require('dotenv');

config();

async function dropIndex() {
    try {
        // Connect to MongoDB
        const MONGO_URI = process.env.MONGO_URI || '';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get the links collection
        const collection = mongoose.connection.collection('links');
        
        // Drop the userId index
        await collection.dropIndex('userId_1');
        console.log('Successfully dropped userId_1 index');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

dropIndex();
