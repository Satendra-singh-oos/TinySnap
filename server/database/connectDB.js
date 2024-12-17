import mongoose from "mongoose";
import { DB_MAX_RETRIES, DB_NAME, DB_RETRY_INTERVAL } from "../constant.js";

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    // Configure mongoose settings
    mongoose.set("strictQuery", true);

    // Handle Connection event

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
      this.isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      this.isConnected = false;
      this.handleDisconnection();
    });

    // Handle application termination
    process.on("SIGINT", this.handleAppTermination.bind(this));
    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDB URI is not defined in environment variables");
      }

      const connectionOptions = {
        maxPoolSize: 10, // depends of the tier of atals you have
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(
        `${process.env.MONGO_URI}/${DB_NAME}`,
        connectionOptions
      );
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error.message);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < DB_MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${DB_MAX_RETRIES}`
      );
      await new Promise((resolve) => setTimeout(resolve, DB_RETRY_INTERVAL));
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${DB_MAX_RETRIES} attempts`
      );
      process.exit(1);
    }
  }

  handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB...");
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error during database disconnection:", err);
      process.exit(1);
    }
  }

  // Get the current connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// Create a singleton instance
const dbConnection = new DatabaseConnection();

// Export the connect function and the instance
export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
