const stringSimilarity = require('string-similarity');

// Configuration for word sets and achievements
const wordSets = [
    {
        words: ['secte', 'sectes', 'dogme'],
        achievement: 'sectaire',
        threshold: 0.8,
        requiredCount: 2
    },
    {
        words: ['dieu', 'dieux', 'divin'],
        achievement: 'touchée par le divin',
        threshold: 0.8,
        requiredCount: 2
    },
    {
        words: ['pipi', 'caca', 'eupho', 'telenovela', 'Alyn', 'susumimi', 'euphoriasis'],
        achievement: '💩 Euphoriazouz 🧻',
        threshold: 0.8,
        requiredCount: 3 
    },
    {
        words: ['glitteryglitch', 'patate', 'gueuse', 'glitch', 'vegan', 'malignon', 'malignon-han' ],
        achievement: '☾ glitteryzouz ☾',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['terrestrine', 'feufeuille', 'terre', 'iwi', 'feuille'],
        achievement: '🍃 feuillu 🍂',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['ténèbres', 'obscurité', 'goth', 'susumimi', 'Alyn'],
        achievement: '☦️ Alynzouz ☠️',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['mode', 'vêtements', 'style', 'fashion', 'fashionista'],
        achievement: 'fashionista',
        threshold: 0.8,
        requiredCount: 2
    },
    {
        words: ['chat', 'miaou', 'félin', 'minou', 'ronron'],
        achievement: '🐾 Ami des chats 🐾',
        threshold: 0.8,
        requiredCount: 2
    },
    {
        words: ['chien', 'ouaf', 'canin', 'toutou', 'doggo'],
        achievement: '🐶 Ami des chiens 🐶',
        threshold: 0.8,
        requiredCount: 2
    },
    {
        words: ['pizza', 'pâtes', 'lasagne', 'italien', 'mozzarella'],
        achievement: '🍕 Gourmand italien 🍝',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['livre', 'lecture', 'roman', 'bibliothèque', 'histoire'],
        achievement: '📚 Rat de bibliothèque 📖',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['jeu', 'gaming', 'console', 'pc', 'stream'],
        achievement: '🎮 Gamer 🎮',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['soleil', 'plage', 'vacances', 'été', 'sable'],
        achievement: '🌞 Enfant de l’été 🌴',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['neige', 'hiver', 'froid', 'givre', 'glace'],
        achievement: '❄️ Enfant de l’hiver ⛄',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['musique', 'chanson', 'concert', 'guitare', 'piano'],
        achievement: '🎵 Mélomane 🎶',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['art', 'peinture', 'dessin', 'sculpture', 'création'],
        achievement: '🎨 Artiste 🎭',
        threshold: 0.8,
        requiredCount: 3
    },
    {
        words: ['science', 'espace', 'laboratoire', 'chimie', 'physique'],
        achievement: '🔬 Scientifique 🚀',
        threshold: 0.8,
        requiredCount: 3
    }
    // Add more word sets here as needed
];


// List of titles
const titles = [
    "BarBarista",
    "Barbardeur",
    "Barbarracuda",
    "Barbarbecue",
    "Barbartiste",
    "Barbarpapa",
    "just a girl",
    "créature du bosquet",
    "créature de l'obscurité derrière la station service",
    "gobelin de marchés",
    "coureuse de remparts",
    "petit loukoum",
    "falafel d'amour",
    "héroïne du royaume de OOO",
    "kirby cosplayer",
    "ANOMALY",
    "twitchbot",
    "Énigme des Étoiles",
    "Alchimiste de mayonnaise",
    "streamereuse sur soubresaut",
    "ultimate babe",
    "divinité de la flemme",
    "étoile filante",
    "chateau ambulant",
    "mouette",
    "magma tiède",
    "aspirateur à pikmin",
    "pikachu surpris",
    "oo ii cat",
    "base virale mise à jour",
    "millefeuille",
    "gay icon",
    "gothic queen",
    "queen of the night",
    "queen of the day",
    "Cottagecore lesbian"
];

const items = [
    "Épée", "Bouclier", "Amulette", "Anneau", "Casque", "Armure", "Bottes", "Gants", "Cape", "Bâton", 
    "fourchette", "cuillère à miel", "ciseaux à raisins", "pelle à tarte", "brosse à dents", "tire-bouchon", 
    "couteau à beurre", "cuillère à café", "fourchette à soupe", "marteau", "clé à molette", "tournevis", 
    "pince", "serpe", "hache", "lance", "arc", "flèche", "bouclier rond", "bouclier carré", "bouclier triangulaire"
];

const natures = [
    "d'obsidienne", "de honte", "de feu", "de glace", "de vent", "de terre", "d'éclair", "d'ombre", "de lumière", "d'eau", "de JOIE",
    "d'espoir", "de slime", "de poussière", "de sable", "de pierre", "de mousse", "de fumée", "de miel", "de caramel", "de chocolat", "de papier",
    "vorpale", "psychique", "de résonnance", "magnétique", "d'éther", "du néant", "de chaos", "de rêve", "de cauchemar", "de pixel", "de glitch", 
    "de code", "quantique", "temporel", "dimensionnel"
];

// Function to check achievements
function checkAchievements(user, message, userActivityData, client, channel) {
    // Ensure userActivityData is defined and has the necessary properties
    if (!userActivityData || !userActivityData.messages) {
        return;
    }

    // Example achievement check: First message achievement
    if (userActivityData.messages.length === 1) {
        if (!userActivityData.achievements.includes('First Message')) {
            userActivityData.achievements.push('First Message');
            client.say(channel, `${user} a gagné le badge "First Message" !`);
        }
    }

    // Example achievement check: Polite achievement
    checkPoliteAchievement(user, message, userActivityData, client, channel);

    // Check for word set achievements
    checkWordSetAchievements(user, message, userActivityData, client, channel);

    // Check for "oiseau de nuit" achievement
    checkNightOwlAchievement(user, userActivityData, client, channel);

    // Add more achievement checks here
}

function checkPoliteAchievement(user, message, userActivityData, client, channel) {
    const politeWords = ["bonjour", "bonsoir", "salut", "hello", "coucou"];
    politeWords.forEach(word => {
        const similarity = stringSimilarity.compareTwoStrings(message.toLowerCase(), word);
        if (similarity > 0.8 && !userActivityData.achievements.includes('Polite')) {
            userActivityData.achievements.push('Polite');
            client.say(channel, `${user} a gagné le badge "Polite" !`);
        }
    });
}

function checkWordSetAchievements(user, message, userActivityData, client, channel) {
    wordSets.forEach(set => {
        set.words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i'); // Case-insensitive word boundary match
            if (regex.test(message)) {
                if (!userActivityData.wordUsage[set.achievement]) {
                    userActivityData.wordUsage[set.achievement] = 0;
                }
                userActivityData.wordUsage[set.achievement]++;
                if (userActivityData.wordUsage[set.achievement] >= set.requiredCount && !userActivityData.achievements.includes(set.achievement)) {
                    userActivityData.achievements.push(set.achievement);
                    client.say(channel, `${user} a gagné le badge "${set.achievement}" !`);
                }
            }
        });
    });
}

function checkNightOwlAchievement(user, userActivityData, client, channel) {
    const currentHour = new Date().getHours();
    if (currentHour >= 23 && !userActivityData.achievements.includes('oiseau de nuit')) {
        userActivityData.achievements.push('oiseau de nuit');
        client.say(channel, `${user} a gagné le badge "oiseau de nuit" !`);
    }
}

module.exports = {
    wordSets,
    checkAchievements,
    titles, // Export titles
    items, // Export items
    natures // Export natures
};