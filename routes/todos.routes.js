const express = require("express")
const utils = require("../utils/utils")
const fs = require("fs/promises")
const { body, validationResult } = require("express-validator")
const { isAuthenticated } = require("../middlewares")

const todoRouter = express.Router()

todoRouter.get("/", (req, res) => {
	return utils.readData().then((data) => {
		return res.status(200).json({
			message: "All todos fetched.",
			data,
			error: null,
		})
	})
})

todoRouter.post(
	"/",
	isAuthenticated,
	body("title")
		.custom((title) => {
			if (typeof title === "string" && title.length >= 3) {
				return true
			}
			return false
		})
		.withMessage(
			"Title should be string and of length greater than 3 or equal"
		),
	body("completed")
		.custom((completed) => {
			if (typeof completed === "boolean") {
				return true
			}
			return false
		})
		.withMessage("Completed should be true or false"),
	(req, res) => {
		const newTodo = req.body
		console.log("---body--- ", newTodo)

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log("---errors--- ", errors.array())

			return res.status(400).json({
				message: "Todo creation failed.",
				error: errors.array(),
				data: {},
			})
		}

		return utils
			.readData()
			.then((data) => {
				data.push(newTodo)
				return fs.writeFile("db.json", JSON.stringify(data))
			})
			.then(() => {
				return res.status(201).json({
					message: "Todo created successfully.",
					data: newTodo,
					error: null,
				})
			})
			.catch((error) => {
				return res.status(400).json({
					message: "Todo creation failed.",
					data: {},
					error: error.message ? error.message : error.toString(),
				})
			})
	}
)

todoRouter.get("/:title", isAuthenticated, (req, res) => {
	const title = req.params.title.toLowerCase()

	return utils.readData().then((dataArr) => {
		const todoObj = dataArr.find((todo) => {
			return todo.title === title
		})

		return res.status(200).json({
			message: "Todo fetched successfully.",
			data: todoObj,
			error: null,
		})
	})
})

todoRouter.put("/:title", isAuthenticated, (req, res) => {
	const title = req.params.title.toLowerCase()
	const updateTodo = req.body

	return utils
		.readData()
		.then((dataArr) => {
			const idx = dataArr.findIndex((todo) => {
				return todo.title === title
			})

			if (idx != -1) {
				dataArr[idx] = {
					...dataArr[idx],
					...updateTodo,
				}
			}

			return fs.writeFile("db.json", JSON.stringify(dataArr))
		})
		.then(() => {
			return res.status(200).json({
				message: "Todo updated successfully.",
				data: updateTodo,
				error: null,
			})
		})
})

todoRouter.delete("/:title", isAuthenticated, (req, res) => {
	const title = req.params.title.toLowerCase()
	let deletedObj

	return utils
		.readData()
		.then((dataArr) => {
			const idx = dataArr.findIndex((todo) => {
				return todo.title.toLowerCase() === title
			})

			if (idx != -1) {
				deletedObj = dataArr.splice(idx, 1)
			}
			return fs.writeFile("db.json", JSON.stringify(dataArr))
		})
		.then(() => {
			return res.status(200).json({
				message: "Todo deleted successfully.",
				data: deletedObj,
				error: null,
			})
		})
})
todoRouter.delete("/deleteMany", (req, res) => {
	const titleArr = req.body
})

module.exports = todoRouter
