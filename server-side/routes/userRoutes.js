// server-side/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const uniqueUsersFilePath = "./uniqueUsers.json";
require('dotenv').config();

const mongoUrl = process.env.MONGO_URL;// Connection URL for MongoDB
const dbName = "company"; // Database name
const collectionName = "users"; // Collection name
const postUrl = "https://challenge.sedilink.co.za:12022"; // URL to post user data
const maxRetries = 3; // Maximum number of retries for failed requests

// Helper functions to read and write JSON files
function readJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}

// Simulate Secure Login Form Submission
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      "https://challenge.sedilink.co.za:12022",
      {
        username: req.body.username,
        password: req.body.password,
        action: "LOGIN",
      },
      {
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      }
    );

    if (response.data && response.data.users) {
      const users = response.data.users;
      const token = response.data.token;
      fs.writeFileSync("users.json", JSON.stringify(users));
      encryptFile("users.json", "encryptedUsers.json");
      await insertUsersIntoDatabase(users); // Insert users into MongoDB
      res.json({ message: "Login successful", token, users });
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error(
      "Error during login:",
      error.response ? error.response.data : error.message
    );

    res.status(500).json({
      message: "Login failed",
      error: error.response ? error.response.data : error.message,
    });
  }
});

// Function to Insert Users into MongoDB
async function insertUsersIntoDatabase(users) {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert multiple users into the database
    const result = await collection.insertMany(users);
    console.log(`${result.insertedCount} users inserted into the database.`);
  } catch (error) {
    console.error("Error inserting users into the database:", error.message);
  } finally {
    await client.close();
  }
}

// Encrypt file function
function encryptFile(inputPath, outputPath) {
  const cipher = crypto.createCipher("aes-256-cbc", "yourEncryptionKey");
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  input.pipe(cipher).pipe(output);
}

// Deduplicate users and create uniqueUsers.json
router.get("/deduplicate", (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    const uniqueUsers = {};
    const duplicates = {};

    users.forEach((user) => {
      const key = `${user.name}-${user.surname}`;
      if (!uniqueUsers[key]) {
        uniqueUsers[key] = { ...user, id: uuidv4() };
      } else {
        duplicates[key] = duplicates[key] ? duplicates[key] + 1 : 1;
      }
    });

    fs.writeFileSync(
      "uniqueUsers.json",
      JSON.stringify(Object.values(uniqueUsers))
    );
    writeDuplicatesToCSV(duplicates);
    res.json({ message: "Deduplication complete" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during deduplication", error: error.message });
  }
});

// Write duplicates to CSV file
function writeDuplicatesToCSV(duplicates) {
  const csvWriter = createCsvWriter({
    path: "duplicates.csv",
    header: [
      { id: "name", title: "Name" },
      { id: "surname", title: "Surname" },
      { id: "count", title: "Number of Times Duplicated" },
    ],
  });

  const records = Object.entries(duplicates).map(([key, count]) => {
    const [name, surname] = key.split("-");
    return { name, surname, count };
  });

  csvWriter
    .writeRecords(records)
    .then(() => console.log("Duplicates CSV created."))
    .catch((error) => console.error("Error writing CSV:", error.message));
}

// Simulate Secure User Data Posting
router.post("/post-users", async (req, res) => {
  try {
    // Read users from uniqueUsers.json
    const users = JSON.parse(fs.readFileSync("uniqueUsers.json", "utf-8"));
    const token = req.body.token; // Token should be passed from the request body or obtained earlier

    // Ensure token is provided
    if (!token) {
      return res
        .status(400)
        .json({ message: "Token is required to post users." });
    }

    // Post each user securely with retry mechanism
    for (const user of users) {
      await postUserWithRetries(user, token);
    }

    res.json({ message: "Users posted successfully." });
  } catch (error) {
    console.error("Error posting users:", error.message);
    res
      .status(500)
      .json({ message: "Failed to post users.", error: error.message });
  }
});

// Function to post a user with retries
async function postUserWithRetries(user, token) {
  let attempt = 0;
  const userData = {
    name: user.name,
    surname: user.surname,
    designation: user.designation,
    department: user.department,
    id: user.id,
    token: token,
  };

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(
        `Posting user ${userData.name} ${userData.surname}, attempt ${attempt}`
      );
      await axios.post(postUrl, userData, {
        headers: { "Content-Type": "application/json" },
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      });
      console.log(
        `Successfully posted user ${userData.name} ${userData.surname}`
      );
      break; // Exit loop on success
    } catch (error) {
      console.error(
        `Failed to post user ${userData.name} ${userData.surname} on attempt ${attempt}: ${error.message}`
      );
      if (attempt >= maxRetries) {
        console.error(
          `Max retries reached for user ${userData.name} ${userData.surname}. Skipping.`
        );
      }
    }
  }
}

// route to query Engineering Department for specific reportees
router.get("/query-engineering", async (req, res) => {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Aggregation pipeline to query users in the Engineering department
    // who are either Mechanics or Mechanic Assistants using case-insensitive matching
    const query = [
      {
        $match: {
          department: { $regex: /^engineering$/i }, // Case-insensitive match for 'Engineering'
          designation: { $regex: /^(mechanic|mechanic assistant)$/i }, // Case-insensitive match for 'Mechanic' and 'Mechanic Assistant'
        },
      },
      {
        $count: "totalReportees",
      },
    ];

    const result = await collection.aggregate(query).toArray();
    const totalReportees = result.length > 0 ? result[0].totalReportees : 0;

    console.log("Query result:", result); // Log the result of the query
    res.json({ totalReportees });
  } catch (error) {
    console.error("Error generating report:", error.message);
    res
      .status(500)
      .json({ message: "Error generating report", error: error.message });
  } finally {
    await client.close();
  }
});

// Endpoint: /uniqueUsers - Display unique users
router.get("/uniqueUsers", (req, res) => {
  const uniqueUsers = readJSONFile(uniqueUsersFilePath);
  res.json(uniqueUsers);
});

// Endpoint: /orderedUsers - Display users ordered by department and designation
router.get("/orderedUsers", (req, res) => {
  const users = readJSONFile(uniqueUsersFilePath);
  const orderedUsers = users.sort((a, b) => {
    if (a.department === b.department) {
      return a.designation.localeCompare(b.designation);
    }
    return a.department.localeCompare(b.department);
  });
  res.json(orderedUsers);
});

// Endpoint: /addUser - Add a new user
router.post("/addUser", (req, res) => {
  const { name, surname, department, designation } = req.body;
  if (!name || !surname || !department || !designation) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const uniqueUsers = readJSONFile(uniqueUsersFilePath);
  const newUser = {
    id: uuidv4(),
    name,
    surname,
    department,
    designation,
  };

  uniqueUsers.push(newUser);
  writeJSONFile(uniqueUsersFilePath, uniqueUsers);
  res.status(201).json({ message: "User added successfully.", user: newUser });
});

// Endpoint: /updateUser - Update an existing user
router.put("/updateUser/:id", (req, res) => {
  const { id } = req.params;
  const { name, surname, department, designation } = req.body;
  const uniqueUsers = readJSONFile(uniqueUsersFilePath);

  const userIndex = uniqueUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found." });
  }

  const updatedUser = {
    ...uniqueUsers[userIndex],
    name: name || uniqueUsers[userIndex].name,
    surname: surname || uniqueUsers[userIndex].surname,
    department: department || uniqueUsers[userIndex].department,
    designation: designation || uniqueUsers[userIndex].designation,
  };

  uniqueUsers[userIndex] = updatedUser;
  writeJSONFile(uniqueUsersFilePath, uniqueUsers);
  res.json({ message: "User updated successfully.", user: updatedUser });
});

module.exports = router;
