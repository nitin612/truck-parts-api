require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const covers = {
  "tail-lifts-land-in-vic": "https://www.aurextruckparts.com.au/images/covers/news-tail-lift-range.svg",
  "tracks-caps-fittings-explained": "https://www.aurextruckparts.com.au/images/covers/news-tracks-fittings.svg",
  "stainless-hinges-paddle-latches": "https://www.aurextruckparts.com.au/images/covers/news-hinges-latches.svg",
  "toolbox-door-hardware-refresh": "https://www.aurextruckparts.com.au/images/covers/news-toolbox-hardware.svg"
};

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing from environment!');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas (database: test)...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  const collection = db.collection('blogs');

  // 1. STEP 1: Save current values for undo reference
  console.log('\n--- STEP 1: CURRENT VALUES (BEFORE UPDATE) ---');
  const beforeDocs = await collection
    .find({ slug: { $in: Object.keys(covers) } })
    .project({ slug: 1, coverImage: 1, img: 1 })
    .toArray();

  console.log(JSON.stringify(beforeDocs, null, 2));

  // 2. STEP 2: Update each post
  console.log('\n--- STEP 2: PERFORMING updateOne FOR EACH COVER ---');
  const updateResults = {};
  for (const [slug, url] of Object.entries(covers)) {
    const res = await collection.updateOne(
      { slug },
      { $set: { "coverImage.url": url, "coverImage.publicId": "", img: url } }
    );
    updateResults[slug] = {
      matchedCount: res.matchedCount,
      modifiedCount: res.modifiedCount,
      acknowledged: res.acknowledged
    };
    console.log(`Update ${slug}: matchedCount=${res.matchedCount}, modifiedCount=${res.modifiedCount}`);
  }

  // 3. STEP 3: Confirm new values after update
  console.log('\n--- STEP 3: NEW VALUES (AFTER UPDATE) ---');
  const afterDocs = await collection
    .find({ slug: { $in: Object.keys(covers) } })
    .project({ slug: 1, coverImage: 1, img: 1 })
    .toArray();

  console.log(JSON.stringify(afterDocs, null, 2));

  await mongoose.disconnect();
  console.log('\nDatabase update completed successfully.');
}

run().catch((err) => {
  console.error('Error during blog cover update:', err);
  process.exit(1);
});
