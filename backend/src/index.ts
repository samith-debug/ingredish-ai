import "dotenv/config";
import { applySchema } from "./db/client.js";
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3001);

async function start() {
  try {
    await applySchema();
    app.listen(PORT, () => {
      console.log(`\n🍽️  IngreDish AI backend running`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/health`);
      console.log(`   DB:      Postgres (${process.env.POSTGRES_URL?.split("@")[1] ?? "local"})\n`);
    });
  } catch (err) {
    console.error("[boot] Failed to start server:", err);
    process.exit(1);
  }
}

start();
