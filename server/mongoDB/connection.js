// import mongoose from "mongoose";

// const mongoDBConnect = () => {
//   try {
//     mongoose.connect(process.env.URI, {
//       useUnifiedTopology: true,
//       useNewUrlParser: true,
//     });
//     console.log("MongoDB - Connected");
//   } catch (error) {
//     console.log("Error - MongoDB Connection " + error);
//   }
// };

// export default mongoDBConnect;

import mongoose from "mongoose";

const mongoDBConnect = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI); // 🔥 This is likely undefined
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default mongoDBConnect;
