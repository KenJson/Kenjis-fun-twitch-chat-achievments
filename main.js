const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');
const { wordSets, checkAchievements, titles, items, natures } = require('./achievments'); // Import items and natures from achievments.js
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

// Function to get a random title from the titles list
function getUniqueRandomTitle(user) {
    const availableTitles = titles.filter(t => !userActivity[user].titles.includes(t));
    if (availableTitles.length === 0) return null;
    return availableTitles[Math.floor(Math.random() * availableTitles.length)];
}

function getUniqueRandomItem(user) {
    const allPossibleItems = items.flatMap(item => natures.map(nature => `${item} de ${nature}`));
    const availableItems = allPossibleItems.filter(i => !userActivity[user].items.includes(i));
    if (availableItems.length === 0) return null;
    return availableItems[Math.floor(Math.random() * availableItems.length)];
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
            achievements: [],
            wordUsage: {},
            titles: [],
            items: []
        };
    }
    //This was to log messages in useractivity, but it's obsolete now, since we don't allow duplicate achievements
   // userActivity[user].messages.push({ content: message, time: currentTime });

    // Check for achievements
    checkAchievements(user, message, userActivity[user], client, channel);

    // Assign title based on the number of achievements
    const achievementsCount = userActivity[user].achievements.length;
    
    // Award unique title
    if (achievementsCount >= 5) {
        const newTitle = getUniqueRandomTitle(user);
        if (newTitle) {
            userActivity[user].titles.push(newTitle);
            client.say(channel, `${user} a reçu le titre "${newTitle}" pour avoir obtenu 5 réalisations !`);
        }
    }
    
    // Award unique item
    if (achievementsCount >= 10) {
        const newItem = getUniqueRandomItem(user);
        if (newItem) {
            userActivity[user].items.push(newItem);
            client.say(channel, `${user} a reçu l'objet "${newItem}" pour avoir obtenu 10 réalisations !`);
        }
    }

    // Check if the user is a subscriber and award achievements based on subscription duration
    if (tags.subscriber) {
        const monthsSubscribed = tags['badge-info'] && tags['badge-info'].subscriber ? parseInt(tags['badge-info'].subscriber, 10) : 0;

        if (monthsSubscribed >= 1 && !userActivity[user].achievements.includes('cultiste néophite')) {
            userActivity[user].achievements.push('cultiste néophite');
            client.say(channel, `${user} a gagné le badge "cultiste néophite" pour être abonné(e) depuis 1 mois !`);
        }
        if (monthsSubscribed >= 3 && !userActivity[user].achievements.includes('fidèle cultiste confirmé')) {
            userActivity[user].achievements.push('fidèle cultiste confirmé');
            client.say(channel, `${user} a gagné le badge "fidèle cultiste confirmé" pour être abonné(e) depuis 3 mois !`);
        }
        if (monthsSubscribed >= 6 && !userActivity[user].achievements.includes('cultiste supérieur')) {
            userActivity[user].achievements.push('cultiste supérieur');
            client.say(channel, `${user} a gagné le badge "cultiste supérieur" pour être abonné(e) depuis 6 mois !`);
        }
        if (monthsSubscribed >= 12 && !userActivity[user].achievements.includes('1ère révélation mystique, accès au cercle intérieur du culte')) {
            userActivity[user].achievements.push('1ère révélation mystique, accès au cercle intérieur du culte');
            client.say(channel, `${user} a gagné le badge "1ère révélation mystique, accès au cercle intérieur du culte" pour être abonné(e) depuis 12 mois !`);
        }
    }

    // Display achievements command
    if (message.toLowerCase() === '!achievements' || message.toLowerCase() === '!badges') {
               let achievements = userActivity[user].achievements;
        let achievementsList = achievements.join(', ');
        let titles = userActivity[user].titles.length ? ` | Titres : ${userActivity[user].titles.join(', ')}` : '';
        let items = userActivity[user].items.length ? ` | Objets : ${userActivity[user].items.join(', ')}` : '';
        
        if (achievements.length === 0 && userActivity[user].titles.length === 0 && userActivity[user].items.length === 0) {
            client.say(channel, `${user}, vous n'avez pas encore de réalisations.`);
        } else {
            client.say(channel, `${user}, vos réalisations: ${achievementsList}${titles}${items}`);
        }
    }

    // Save user activity data after handling the message
    saveUserActivity();
});

// Connect to Twitch
client.connect().catch(console.error);