const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');
require('dotenv').config({ path: './credentials.env' }); // Load environment variables from credentials.env

// Path to the JSON file
const dataFilePath = path.join(__dirname, 'userActivity.json');

// Load user activity from the JSON file
let userActivity = {};
if (fs.existsSync(dataFilePath)) {
	userActivity = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

// Function to save user activity to the JSON file
function saveUserActivity() {
	fs.writeFileSync(dataFilePath, JSON.stringify(userActivity, null, 2), 'utf8');
}

// Configuration for word sets and achievements
const wordSets = [
	{
		words: ['secte', 'sectes'],
		achievement: 'sectaire',
		threshold: 0.8,
		requiredCount: 5
	},
	// Add more word sets here as needed
];

// Function to check achievements
function checkAchievements(user, message, client, channel) {
	let currentTime = new Date();
	let userActivityData = userActivity[user];

	checkNightOwlAchievement(user, currentTime, userActivityData, client, channel);
	checkPoliteAchievement(user, message, userActivityData, client, channel);
	checkChatterboxAchievement(user, userActivityData, client, channel);
	checkLoyalViewerAchievement(user, currentTime, userActivityData, client, channel);
	checkFirstBloodAchievement(user, userActivityData, client, channel);
	checkHelpfulUserAchievement(user, message, userActivityData, client, channel);
	checkEmoteLoverAchievement(user, message, userActivityData, client, channel);
	checkGlitteryzouzAchievement(user, message, userActivityData, client, channel);
	checkWordUsageAchievements(user, message, userActivityData, client, channel);

	// Save user activity after checking achievements
	saveUserActivity();
}

function checkNightOwlAchievement(user, currentTime, userActivityData, client, channel) {
	if ((currentTime.getHours() >= 23 || currentTime.getHours() < 6) && !userActivityData.achievements.includes("Oiseau de nuit")) {
		client.say(channel, `${user} a gagné le badge "Oiseau de nuit" !`);
		userActivityData.achievements.push("Oiseau de nuit");
	}
}

function checkPoliteAchievement(user, message, userActivityData, client, channel) {
	const politeWords = ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou'];
	const threshold = 0.8; // Similarity threshold

	if (userActivityData.messages.length === 1) {
		for (const word of politeWords) {
			const similarity = stringSimilarity.compareTwoStrings(message.toLowerCase(), word);
			if (similarity >= threshold && !userActivityData.achievements.includes("Poli")) {
				client.say(channel, `${user} a gagné le badge "Poli" !`);
				userActivityData.achievements.push("Poli");
				break;
			}
		}
	}
}

function checkChatterboxAchievement(user, userActivityData, client, channel) {
	if (userActivityData.messages.length === 10 && !userActivityData.achievements.includes("Bavard")) {
		client.say(channel, `${user} a gagné le badge "Bavard" !`);
		userActivityData.achievements.push("Bavard");
	}
}

function checkLoyalViewerAchievement(user, currentTime, userActivityData, client, channel) {
	const activeDuration = (currentTime - new Date(userActivityData.firstMessageTime)) / (1000 * 60); // Duration in minutes
	if (activeDuration >= 30 && !userActivityData.achievements.includes("Spectateur fidèle")) {
		client.say(channel, `${user} a gagné le badge "Spectateur fidèle" !`);
		userActivityData.achievements.push("Spectateur fidèle");
	}
}

function checkFirstBloodAchievement(user, userActivityData, client, channel) {
	if (Object.keys(userActivity).length === 1 && !userActivityData.achievements.includes("Premier sang")) {
		client.say(channel, `${user} a gagné le badge "Premier sang" !`);
		userActivityData.achievements.push("Premier sang");
	}
}

function checkHelpfulUserAchievement(user, message, userActivityData, client, channel) {
	if (message.toLowerCase().includes('help') && !userActivityData.achievements.includes("Utilisateur utile")) {
		client.say(channel, `${user} a gagné le badge "Utilisateur utile" !`);
		userActivityData.achievements.push("Utilisateur utile");
	}
}

function checkEmoteLoverAchievement(user, message, userActivityData, client, channel) {
	const emoteCount = (message.match(/:\w+:/g) || []).length;
	if (emoteCount > 5 && !userActivityData.achievements.includes("Amoureux des émoticônes")) {
		client.say(channel, `${user} a gagné le badge "Amoureux des émoticônes" !`);
		userActivityData.achievements.push("Amoureux des émoticônes");
	}
}

function checkGlitteryzouzAchievement(user, message, userActivityData, client, channel) {
	const glitteryzouzWords = ['vegan', 'veganism', 'tofu', 'glitch', 'bouclettes', 'didier'];
	if (glitteryzouzWords.some(word => message.toLowerCase().includes(word)) && !userActivityData.achievements.includes("glitteryzouz")) {
		client.say(channel, `${user} a gagné le badge "glitteryzouz" !`);
		userActivityData.achievements.push("glitteryzouz");
	}
}

function checkWordUsageAchievements(user, message, userActivityData, client, channel) {
	const words = message.toLowerCase().split(/\s+/);
	const wordUsage = userActivityData.wordUsage || {};

	words.forEach(word => {
		wordSets.forEach(set => {
			set.words.forEach(targetWord => {
				const similarity = stringSimilarity.compareTwoStrings(word, targetWord);
				if (similarity >= set.threshold) {
					if (!wordUsage[targetWord]) {
						wordUsage[targetWord] = 0;
					}
					wordUsage[targetWord]++;
				}
			});
		});
	});

	userActivityData.wordUsage = wordUsage;

	wordSets.forEach(set => {
		set.words.forEach(targetWord => {
			if (wordUsage[targetWord] === set.requiredCount && !userActivityData.achievements.includes(set.achievement)) {
				client.say(channel, `${user} a gagné le badge "${set.achievement}" !`);
				userActivityData.achievements.push(set.achievement);
			}
		});
	});
}

// Twitch chat client configuration
const client = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.TWITCH_USERNAME, // Your Twitch username from environment variable
		password: process.env.TWITCH_OAUTH_TOKEN // Your OAuth token from environment variable
	},
	channels: [ process.env.TWITCH_CHANNEL ] // Your Twitch channel name from environment variable
});

// Event: On Chat Message
client.on('message', (channel, tags, message, self) => {
	if (self) return;

	let user = tags['display-name'];
	let currentTime = new Date();

	// Track user activity
	if (!userActivity[user]) {
		userActivity[user] = {
			firstMessageTime: currentTime,
			messages: [],
			achievements: [],
			wordUsage: {}
		};
	}
	userActivity[user].messages.push({ content: message, time: currentTime });

	// Check for achievements
	checkAchievements(user, message, client, channel);

	// Display achievements command
	if (message.toLowerCase() === '!achievements' || message.toLowerCase() === '!badges') {
		let achievements = userActivity[user].achievements.join(', ');
		let totalBadges = userActivity[user].achievements.length;
		if (totalBadges === 0) {
			achievements = 'Aucun badge gagné pour le moment.';
		}
		client.say(channel, `${user}, vos badges (${totalBadges}): ${achievements}`);
	}
});

// Connect to Twitch
client.connect().catch(console.error);