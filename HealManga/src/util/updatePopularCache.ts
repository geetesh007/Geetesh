import chalk from "chalk";
import fetch from "node-fetch-extra";

import cfg from "../config.json";
import updateManga from "./updateManga";
import * as scrapers from "../scrapers";
import db from "../db";
import getReading from "./getReading";
import Bot from "./bot";
import cache from "../util/cache";
import secretConfig from "../util/secretConfig";

import { Progress } from "../types";
import { getProviderId } from "../routers/manga-page";
import { getAnnouncements } from "./getAnnouncements";

const clean = (str: string | number) => {
	return str.toString().replace(/\./g, "_");
};

class Updater {
	start() {
		this.updateCache();
		setInterval(() => {
			this.updateCache();
		}, cfg.cache.duration);
	}

	private async updateCache() {
		/**
		 * UPDATE "POPULAR" CACHE
		 */
		console.info(
			chalk.yellowBright("[CACHE]") +
				` Updating popular cache at ${new Date().toLocaleString()}`
		);
		const popular = await scrapers.Mangasee.search("");

		await Promise.all(
			popular
				.map((obj) => (obj.success ? obj : null))
				.filter(Boolean)
				.map(async (obj) => {
					// Update manga and store new value in cache
					await updateManga(
						obj.provider ?? "mangasee",
						obj.constant.slug,
						true
					);
				})
		);

		console.info(chalk.green("[CACHE]") + " Updated cache for popular manga");

		/**
		 * UPDATE "READING" CACHE
		 */
		console.info(
			chalk.yellowBright("[NOTIFS]") +
				` Looking for new chapters at ${new Date().toLocaleString()}`
		);
		const reading = await getReading();

		await Promise.all(
			reading
				.map((obj) => (obj.success ? obj : null))
				.filter(Boolean)
				.map(async (obj) => {
					// Update manga and store new value in cache + variable

					const data = await updateManga(obj.provider, obj.constant.slug, true);
											console.info(
												chalk.green("[NOTIFS]") +
													` New chapter found for ${data.constant.title}, attempted to notify user over Discord Webhook. HTTP status ${webhookNotif.status}`
											);
											doSet = true;
										} else {
											console.info(
												chalk.red("[NOTIFS]") +
													` New chapter found for ${data.constant.title} but Discord webhook is not configured`
											);
										}

										if (doSet) db.set(dbString, true);
									}
								}
							}
						}
					}
				})
		);

		console.info(
			chalk.green("[NOTIFS]") + " Checked for new chapters, now done"
		);

		/**
		 * Remove old items from cache
		 */

		// Get data

		console.info(
			chalk.yellowBright("[CLEANUP]") +
				" Checking each cache entry for old data"
		);

		// Check each entry and
		for (const provider of Object.keys(cache)) {
			for (const slug of Object.keys(cache[provider])) {
				// Get difference from saved time in MS
				const diff = Date.now() - (cache[provider]?.[slug]?.savedAt ?? 9e9);

				// Check if cache is old. How old should be fairly obvious
				if (diff > 1e3 * 60 * 60 * 24) {
					cache[provider][slug] = undefined;
					delete cache[provider][slug];
					console.info(
						chalk.green("[CLEANUP]") +
							` Deleting cache for ${slug} since it's ${Math.floor(
								diff / (60 * 1e3)
							)} minutes old`
					);
				}
			}
		}

		// Write to db
		console.info(chalk.green("[CLEANUP]") + " Done cleaning up");

		getAnnouncements();
	}
}

const updatePopularCache = new Updater();
export default updatePopularCache;
