const fs = require("fs/promises")

function readData() {
	return fs.readFile("db.json", "utf8").then((data) => {
		return JSON.parse(data.toString())
	})
}

function writeUsers(data) {
	return fs.writeFile("users.json", JSON.stringify(data))
}

function readUsers() {
	return fs.readFile("users.json", "utf8").then((data) => {
		return JSON.parse(data.toString())
	})
}

module.exports = {
	readUsers,
	readData,
	writeUsers,
}
