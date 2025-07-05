import { MongoClient, Db, ChangeStream, ChangeStreamDocument } from "mongodb";
import winston from "winston";

interface DatabaseConfig {
  signalFlowUri: string;
  signalFlowDb: string;
  signalFlowCollection: string;
  safeDeploymentUri: string;
  safeDeploymentDb: string;
  safeCollection: string;
}

class DatabaseService {
  private signalFlowClient: MongoClient | null = null;
  private safeDeploymentClient: MongoClient | null = null;
  private signalFlowDb: Db | null = null;
  private safeDeploymentDb: Db | null = null;
  private config: DatabaseConfig;
  private logger: winston.Logger;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "database.log" }),
      ],
    });
  }

  async connect(): Promise<void> {
    try {
      // Connect to signal flow database
      this.signalFlowClient = new MongoClient(this.config.signalFlowUri);
      await this.signalFlowClient.connect();
      this.signalFlowDb = this.signalFlowClient.db(this.config.signalFlowDb);

      // Connect to safe deployment database
      this.safeDeploymentClient = new MongoClient(
        this.config.safeDeploymentUri
      );
      await this.safeDeploymentClient.connect();
      this.safeDeploymentDb = this.safeDeploymentClient.db(
        this.config.safeDeploymentDb
      );

      this.logger.info("Successfully connected to both databases");
    } catch (error) {
      this.logger.error("Failed to connect to databases:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.signalFlowClient) {
        await this.signalFlowClient.close();
      }
      if (this.safeDeploymentClient) {
        await this.safeDeploymentClient.close();
      }
      this.logger.info("Disconnected from databases");
    } catch (error) {
      this.logger.error("Error disconnecting from databases:", error);
    }
  }

  getSignalFlowDb(): Db {
    if (!this.signalFlowDb) {
      throw new Error("Signal flow database not connected");
    }
    return this.signalFlowDb;
  }

  getSafeDeploymentDb(): Db {
    if (!this.safeDeploymentDb) {
      throw new Error("Safe deployment database not connected");
    }
    return this.safeDeploymentDb;
  }

  createSignalChangeStream(): ChangeStream {
    const collection = this.getSignalFlowDb().collection(
      this.config.signalFlowCollection
    );

    // Watch for insert operations only
    const pipeline = [
      {
        $match: {
          operationType: "insert",
        },
      },
    ];

    return collection.watch(pipeline, { fullDocument: "updateLookup" });
  }

  async getUserSafe(username: string): Promise<any | null> {
    try {
      const safesCollection = this.getSafeDeploymentDb().collection(
        this.config.safeCollection
      );

      const safe = await safesCollection.findOne({
        "userInfo.userId": username,
        status: "active",
      });

      return safe;
    } catch (error) {
      this.logger.error(`Error fetching safe for user ${username}:`, error);
      return null;
    }
  }

  async getActiveDeployments(safeDoc: any): Promise<any[]> {
    const activeDeployments = [];

    if (safeDoc.deployments) {
      for (const [networkKey, deployment] of Object.entries(
        safeDoc.deployments
      )) {
        if (
          (deployment as any).isActive &&
          (deployment as any).deploymentStatus === "deployed"
        ) {
          activeDeployments.push({
            networkKey,
            ...(deployment as any),
          });
        }
      }
    }

    return activeDeployments;
  }
}

export default DatabaseService;
export { DatabaseConfig };
