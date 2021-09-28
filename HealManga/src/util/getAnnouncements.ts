//  _____         _ _____                 
// |  |  |___ ___| |     |___ ___ ___ ___! 
// |     | -_| .'| | | | | .'|   | . | .'|
// |__|__|___|__,|_|_|_|_|__,|_|_|_  |__,|
//                               |___|    
// This file will return an array of "announcements"



import chalk from "chalk";
import fetch from "node-fetch-extra";
import db from "../db";
import secretConfig from "./secretConfig";
import Bot from "./bot";
import { months } from "../routers/settings";

const gistUrl =
	"https://raw.githubusercontent.com/healer-op/HealCloud/main/json/HealUpdates.json";

export interface Announcement {
	message: string;
	date: string;
	importance: 0 | 1;
	id: number;
	priority: number;
	readableDate?: string;
}

let data: { at: number; data: Announcement[] } = {
	at: 0,
	data: [],
};

export async function getAnnouncements(): Promise<Announcement[]> {
	try {
		// See if announcement cache is valid or not
		const diff = Date.now() - data.at;
		if (diff > 1e3 * 60 * 30) {  // Every 30 Mins
			data.data = await (await fetch(gistUrl)).json();
			data.at = Date.now();
		}

		const notifiedAnnouncements = db.get("other.announcements-sent") || [];
		const dismissedAnnouncements =
			db.get("other.announcements-dismissed") || [];

		for (const announcement of data.data) {
			const d = new Date(announcement.date);
			const fmtDate = `${
				months[d.getMonth()]
			} ${d.getDate()} ${d.getFullYear()}`;
			announcement.readableDate = fmtDate;

			// Notify people
			if (!notifiedAnnouncements.includes(announcement.id)) {
				console.info(
					chalk.green("[NOTIFS]") +
						` New announcement. Attempting methods of sending out notifications.`
				);

				const bot = Bot.get();
				if (bot) {
					// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
					console.info(
						chalk.green("[NOTIFS]") +
							` New announcement: ${announcement.message}, notifying user with Telegram bot`
					);

					Bot.send(
						`**Word has come from The Creator:** ${announcement.message}`
					);
				}

				// Discord webhook
				if (process.env.DISCORDWEBHOOK ?? secretConfig.discord_webhook) {
					const discordReq = await fetch(
						process.env.DISCORDWEBHOOK ?? secretConfig.discord_webhook,
						{
							method: "POST",
							headers: {
								"content-type": "application/json",
							},
							body: JSON.stringify({
								avatar_url:
									"https://user-images.githubusercontent.com/65026164/134838977-8ce8e4d2-3550-4ffb-921e-cf2b6c7af591.png",
								username: "HealManga",
								embeds: [
									{
										title: "🚒Announcement From HealManga!",
										description: announcement.message,
										color: 4959182,
										author: {
											name: "HealManga",
											url: "https://manga.healdb.me",
											icon_url:
												"https://user-images.githubusercontent.com/65026164/134838977-8ce8e4d2-3550-4ffb-921e-cf2b6c7af591.png",
										},
									},
								],
							}),
						}
					);

					console.info(
						chalk.green("[NOTIFS]") +
							` New announcement: ${announcement.message}, attempted to notify user over Discord Webhook. HTTP status ${discordReq.status}`
					);
				}

				notifiedAnnouncements.push(announcement.id);
			}
		}

		db.set("other.announcements-sent", notifiedAnnouncements);

		// Unread announcements
		const unreadAnnouncements = data.data.filter((announcement) => {
			return !dismissedAnnouncements.includes(announcement.id);
		});

		return unreadAnnouncements;
	} catch (err) {
		console.error(
			chalk.red("[Announcements]") + ` Unable to fetch announcements: ${err}`
		);
		return [];
	}
}
