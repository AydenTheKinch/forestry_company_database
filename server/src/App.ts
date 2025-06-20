import { Server } from "./rest/Server.js";
import { config } from "./config/config.js";

/**
 * Main app class that is run with the node command. Starts the server.
 */
export class App {
	public async initServer(port: number): Promise<void> {
		console.log(`App::initServer( ${port} ) - start`);

		const server = new Server(port);
		try {
			await server.start();
			console.log("App::initServer() - started");
		} catch (err: any) {
			console.error(`App::initServer() - ERROR: ${err.message}`);
			process.exit(1);
		}
	}
}

// Initialize the server with configuration
console.log("App - starting");
const app = new App();
(async (): Promise<void> => {
	await app.initServer(Number(config.port));
})();
