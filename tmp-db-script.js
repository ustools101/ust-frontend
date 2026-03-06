const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://ustools101:dZCo7Un5dv2A50hE@cluster0.eqit0.mongodb.net/utlimate-social-tools";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        const db = client.db("utlimate-social-tools");
        const links = db.collection("links");

        const latestScratch = await links.find({ linkType: 'scratch' })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

        if (latestScratch.length > 0) {
            console.log("LATEST SCRATCH LINK CUSTOM PAGES:");
            console.log(JSON.stringify(latestScratch[0].customPages, null, 2));
        } else {
            console.log("No scratch links found.");
        }
    } catch (err) {
        console.error("Error connecting or querying:", err);
    } finally {
        await client.close();
    }
}

main();
