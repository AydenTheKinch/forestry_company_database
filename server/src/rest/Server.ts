import express, { Application, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DatabaseFacade } from "../controller/DatabaseFacade.js";
import * as http from "http";
import cors from "cors";
import { config } from "../config/config.js";

export class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static controller: DatabaseFacade = new DatabaseFacade();

	constructor(port: number) {
		console.log(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public async start(): Promise<void> {
		await Server.controller.initialize();
		return new Promise((resolve, reject) => {
			console.log("Server::start() - start");
			if (this.server !== undefined) {
				console.log("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express
					.listen(this.port, () => {
						console.log(`Server::start() - server listening on port: ${this.port}`);
						resolve();
					})
					.on("error", (err: Error) => {
						// catches errors in server start
						console.log(`Server::start() - server ERROR: ${err.message}`);
						reject(err);
					});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public async stop(): Promise<void> {
		console.log("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.log("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.log("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware(): void {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({ type: "application/*", limit: "10mb" }));
		// Enable CORS with configuration
		this.express.use(cors({
			origin: config.cors.origin,
			methods: ['GET', 'POST'],
			credentials: true
		}));
	}

	// Registers all request handlers to routes
	private registerRoutes(): void {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.post("/query", Server.query);
	}

	private static async query(req: Request, res: Response): Promise<void> {
		try {
			console.log(`Server::query`);
			const response = await Server.controller.performQuery(req.body);
			res.status(StatusCodes.OK).json({ result: response });
		} catch (err) {
			console.error("Server::query - Error:", err);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				error: "An unexpected error occurred",
				details: err instanceof Error ? err.message : "Unknown error",
			});
		}
	}
}
