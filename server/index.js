import dotenv from "dotenv";

import { app } from "./app.js";
import connectDB, { getDBStatus } from "./database/connectDB.js";

dotenv.config({
  path: "./env",
});

(async () => {
  try {
    await connectDB();

    // Test DB status here
    if (process.env.NODE_ENV === "development") {
      const status = getDBStatus();
      console.log("📝 DB Status:", status);
    }

    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server is up and running at port : ${process.env.PORT || 8000} `
      );
    });

    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
  } catch (err) {
    console.error("Error during initialization:", err);
  }
})();
