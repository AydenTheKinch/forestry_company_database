import { Server } from "./rest/Server.ts";

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

// This ends up starting the whole system and listens on a hardcoded port (4321)
console.log("App - starting");
const port = 4321;
const app = new App();
(async (): Promise<void> => {
	await app.initServer(port);
})();
