import { getDBStatus } from "../database/connectDB.js";

function getReadyStateText(state) {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";

    default:
      return "unknown";
  }
}

export const checkHealth = async (req, res) => {
  try {
    const dbStatus = getDBStatus();

    const healthStatus = {
      status: "OK",
      timeStamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "Healthy" : "Unhealthy",
          ...dbStatus,
          readyState: getReadyStateText(dbStatus.readyState),
        },

        server: {
          status: "Healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };

    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 503;

    return res.state(httpStatus).json(healthStatus);
  } catch (error) {
    console.log("Health Check Failed", error);

    res.status(500).json({
      staus: "ERROR",
      timeStatus: new Date().toISOString(),
      error: error.message,
    });
  }
};
