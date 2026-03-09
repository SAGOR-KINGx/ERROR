const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const log = require("./logger/log.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
				res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
				console.log(`✅ Server running at http://localhost:${PORT}`);
});

function startProject() {
				const child = spawn("node", ["Goat.js"], {
								cwd: __dirname,
								stdio: "inherit",
								shell: true
				});

				child.on("close", (code) => {
								if (code === 2) {
												log.info("Restarting Project...");
												startProject();
								}
				});
}

startProject();
