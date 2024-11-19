if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://leilabenh:${process.env.MONGO_DB_PASSWORD}@signupcluster.mp5f9.mongodb.net/?retryWrites=true&w=majority&appName=SignupCluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    ssl: true,
    autoSelectFamily: false,
  },
});

async function connectToDb() {
  try {
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to the database.");
    return client.db("signup");
  } catch (e) {
    console.log("Failed to connect to the database: ", e);
    throw e;
  }
}

module.exports = connectToDb;
