const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(process.env.NODE_ENV == 'development'
		? "./handlerEvents.dev.js"
		: "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {

		const delay = ms => new Promise(res => setTimeout(res, ms));

		// typing effect
		if (event.type === "message" || event.type === "message_reply") {
			api.sendTypingIndicator(event.threadID, true);
			await delay(Math.floor(Math.random() * 500) + 500);
			api.sendTypingIndicator(event.threadID, false);
		}

		// anti inbox
		if (
			global.GoatBot.config.antiInbox == true &&
			(event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
			(event.senderID || event.userID || event.isGroup == false)
		)
			return;

		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);

		// --------- NOPREFIX SUPPORT ----------
		if (global.GoatBot.config.noPrefixMode && event.body && event.type === "message") {

			const args = event.body.trim().split(/\s+/);
			const commandName = args.shift().toLowerCase();

			if (global.GoatBot.commands.has(commandName)) {

				const command = global.GoatBot.commands.get(commandName);

				try {
					await command.onStart({
						api,
						event,
						message,
						args,
						threadsData,
						usersData
					});
				} catch (err) {
					console.error("NoPrefix Command Error:", err);
				}

				return; // stop normal handler
			}
		}
		// ------------------------------------

		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat)
			return;

		const {
			onAnyEvent, onFirstChat, onStart, onChat,
			onReply, onEvent, handlerEvent, onReaction,
			typ, presence, read_receipt
		} = handlerChat;

		onAnyEvent();

		switch (event.type) {

			case "message":
			case "message_reply":
			case "message_unsend":
				onFirstChat();
				onChat();
				onStart();
				onReply();
				break;

			case "event":
				handlerEvent();
				onEvent();
				break;

			case "message_reaction": {

				const isAdmin = global.GoatBot.config.adminBot.includes(event.userID);

				// admin reaction kick
				if (
					event.reaction === "🚫" ||
					event.reaction === "🦶" ||
					event.reaction === "🦵" ||
					event.reaction === "🦿" ||
					event.reaction === "🖕"
				) {
					if (isAdmin && event.senderID !== api.getCurrentUserID()) {
						api.removeUserFromGroup(event.senderID, event.threadID);
					}
				}

				// angry reaction unsend
				if (
					event.reaction === "😠" ||
					event.reaction === "😡" ||
					event.reaction === "😾" ||
					event.reaction === "🤬"
				) {
					message.unsend(event.messageID);
				}

				onReaction();
				break;
			}

			case "typ":
				typ();
				break;

			case "presence":
				presence();
				break;

			case "read_receipt":
				read_receipt();
				break;

			default:
				break;
		}
	};
};
