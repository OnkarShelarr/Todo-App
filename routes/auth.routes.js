const express = require("express")
const { body, validationResult } = require("express-validator")
const JWT = require("jsonwebtoken")
const router = express.Router()
const bcrypt = require("bcryptjs")
const USER = []
const { writeUsers, readUsers } = require("../utils/utils")
const { SECRET } = require("../config")

router.post(
	"/register",
	body("name")
		.custom((name) => {
			if (typeof name === "string" && name.length >= 3) {
				return true
			}
			return false
		})
		.withMessage("Name should be of minimum 3 characters."),
	body("email")
		.custom((email) => {
			if (typeof email === "string") {
				return true
			}
			return false
		})
		.withMessage("Please enter valid Email")
		.isEmail()
		.withMessage("Enter email in proper format. E.g example@xyz.com"),
	body("password")
		.custom((password) => {
			if (typeof password === "string" && password.length >= 8) {
				return true
			}
			return false
		})
		.withMessage("Password should be of minimum 8 characters."),
	async (req, res) => {
		const { name, email, password } = req.body

		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.status(400).json({
				message: "User registration failed.",
				error: errors.array(),
				data: {},
			})
		}
		

		let hashedPassword = await bcrypt.hashSync(password, 10)

		console.log(hashedPassword)
		console.log(password)
		const newUser = {
			name: name,
			email: email,
			password: hashedPassword,
		}
		USER.push(newUser)
		writeUsers(USER)

		// create access tokens
		let token = JWT.sign({ email }, SECRET)

		return res.status(201).json({
			message: "User registration successful.",
			error: null,
			data: {
				newUser,
				access_token: token,
				user: newUser.name,
			},
		})
	}
)

router.post("/login", async (req, res) => {
	const { email, password } = req.body

	console.log("---user info ---", email, password)
	let users = await readUsers()
	console.log(users)

	USER.push(...users)
	if (USER.length <= 0) {
		return res.status(400).json({
			message: "User login failed.",
			error: "User does not exists.",
			data: {},
		})
	}

	const userIndex = USER.findIndex((user) => user.email === email)

	if (userIndex === -1) {
		return res.status(404).json({
			message: "User login failed.",
			error: "User not found.",
			data: {},
		})
	}
	var match = bcrypt.compareSync(password, USER[userIndex].password)

	console.log(password)
	console.log(password)

	if (match === false) {
		return res.status(404).json({
			message: "User login failed.",
			error: "Invalid password.",
			data: {},
		})
	}

	const token = JWT.sign({ email }, SECRET)

	return res.status(200).json({
		message: "User login successful.",
		error: null,
		data: {
			access_token: token,
		},
	})
})

module.exports = router
