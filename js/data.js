// Données initiales des jeux souls-like populaires
const defaultGames = {
    'not-played': [
        {
            id: 1,
            title: 'Elden Ring',
            subtitle: 'Shadow of the Erdtree',
            image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1726158298',
            launchUrl: 'steam://run/1245620'
        },
        {
            id: 2,
            title: 'Sekiro',
            subtitle: 'Shadows Die Twice',
            image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg?t=1678296348',
            launchUrl: 'steam://run/814380'
        }
    ],
    'currently-playing': [
        {
            id: 3,
            title: 'Dark Souls III',
            subtitle: 'The Fire Fades Edition',
            image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg?t=1671485009',
            launchUrl: 'steam://run/374320'
        }
    ],
    'finished': [
        {
            id: 4,
            title: 'Bloodborne',
            subtitle: 'Game of the Year Edition',
            image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1073600/header.jpg?t=1635513138',
            launchUrl: 'https://store.playstation.com/concept/228631'
        }
    ],
    'next-to-play': [
        {
            id: 5,
            title: 'Hollow Knight',
            subtitle: 'Voidheart Edition',
            image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg?t=1695270428',
            launchUrl: 'steam://run/367520'
        }
    ]
};

// Base de données d'images pour les jeux populaires
const gameImages = {
    // Souls-like populaires
    'dark souls': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/211420/header.jpg?t=1561449221',
    'dark souls ii': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/236430/header.jpg?t=1661953173',
    'dark souls iii': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg?t=1671485009',
    'dark souls 2': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/236430/header.jpg?t=1661953173',
    'dark souls 3': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg?t=1671485009',
    'elden ring': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1726158298',
    'sekiro': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg?t=1678296348',
    'sekiro shadows die twice': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg?t=1678296348',
    'bloodborne': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1073600/header.jpg?t=1635513138',
    'hollow knight': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg?t=1695270428',
    'nioh': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/485510/header.jpg?t=1706205085',
    'nioh 2': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1325200/header.jpg?t=1679332447',
    'code vein': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/678960/header.jpg?t=1700127522',
    'remnant from the ashes': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/617290/header.jpg?t=1691518031',
    'remnant 2': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1282100/header.jpg?t=1711036006',
    'salt and sanctuary': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/283640/header.jpg?t=1601474199',
    'blasphemous': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/774361/header.jpg?t=1692886764',
    'lords of the fallen': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/265300/header.jpg?t=1698164568',
    'lies of p': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1627720/header.jpg?t=1693391979',
    'the surge': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/378540/header.jpg?t=1658245043',
    'the surge 2': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/644830/header.jpg?t=1658245092',
    'ashen': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/649950/header.jpg?t=1673468092',
    'mortal shell': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1110910/header.jpg?t=1666777692',
    'wo long fallen dynasty': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1448440/header.jpg?t=1695118436',
    'stellar blade': 'https://image.api.playstation.com/vulcan/ap/rnd/202312/0117/36ad2b8ee0b91d4db6d5c5b0fd3dd938e9b3d37db8c60a74.png',
    'demon souls': 'https://image.api.playstation.com/vulcan/ap/rnd/202008/1020/PRfYtTZQsuj3ALrBXGL8MjAH.png',
    'lords of the fallen 2023': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1501750/header.jpg?t=1705593456'
};

// Base de données complète multi-genres
const gamesDatabase = [
    // === SOULS-LIKE ===
    { id: 1, name: 'Dark Souls', year: 2011, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/211420/header.jpg', rating: 4.3, developer: 'FromSoftware', genre: 'Souls-like' },
    { id: 2, name: 'Dark Souls II', year: 2014, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/236430/header.jpg', rating: 4.1, developer: 'FromSoftware', genre: 'Souls-like' },
    { id: 3, name: 'Dark Souls III', year: 2016, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg', rating: 4.5, developer: 'FromSoftware', genre: 'Souls-like' },
    { id: 4, name: 'Elden Ring', year: 2022, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg', rating: 4.8, developer: 'FromSoftware', genre: 'Souls-like' },
    { id: 5, name: 'Sekiro: Shadows Die Twice', year: 2019, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg', rating: 4.6, developer: 'FromSoftware', genre: 'Souls-like' },
    { id: 6, name: 'Bloodborne', year: 2015, platforms: ['PlayStation'], image: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0114/ERNmOFfJz5xboZ5ySrcPe0UK.png', rating: 4.7, developer: 'FromSoftware', genre: 'Souls-like' },
    { id: 7, name: 'Hollow Knight', year: 2017, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg', rating: 4.6, developer: 'Team Cherry', genre: 'Souls-like' },
    { id: 8, name: 'Lies of P', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1627720/header.jpg', rating: 4.4, developer: 'Neowiz', genre: 'Souls-like' },
    { id: 9, name: 'Blasphemous 2', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2114740/header.jpg', rating: 4.3, developer: 'The Game Kitchen', genre: 'Metroidvania' },
    { id: 10, name: 'Salt and Sanctuary', year: 2016, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/283640/header.jpg', rating: 4.2, developer: 'Ska Studios', genre: 'Souls-like' },
    { id: 11, name: 'Nioh 2', year: 2020, platforms: ['PC', 'PlayStation'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1325200/header.jpg', rating: 4.3, developer: 'Team Ninja', genre: 'Souls-like' },

    // === ACTION/ADVENTURE ===
    { id: 50, name: 'The Witcher 3: Wild Hunt', year: 2015, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg', rating: 4.9, developer: 'CD Projekt RED', genre: 'RPG' },
    { id: 51, name: 'God of War', year: 2018, platforms: ['PC', 'PlayStation'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg', rating: 4.8, developer: 'Santa Monica Studio', genre: 'Action' },
    { id: 52, name: 'Red Dead Redemption 2', year: 2018, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg', rating: 4.7, developer: 'Rockstar Games', genre: 'Open World' },
    { id: 53, name: 'Cyberpunk 2077', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg', rating: 4.2, developer: 'CD Projekt RED', genre: 'RPG' },
    { id: 54, name: 'Assassin\'s Creed Valhalla', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2208920/header.jpg', rating: 4.1, developer: 'Ubisoft', genre: 'Action' },

    // === SHOOTERS (FPS/TPS) ===
    { id: 100, name: 'Call of Duty: Modern Warfare II', year: 2022, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1938090/header.jpg', rating: 4.0, developer: 'Infinity Ward', genre: 'FPS' },
    { id: 101, name: 'Valorant', year: 2020, platforms: ['PC'], image: 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5a8f0f45adb59f20/62dcc4e6a76d80761b50c64c/valorant_game_art_wallpaper_1920x1080.jpg', rating: 4.3, developer: 'Riot Games', genre: 'FPS' },
    { id: 102, name: 'Overwatch 2', year: 2022, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt3b0ea8eea8a2bd4a/634eb5a8d81ff31b79dff6b4/ow2_boxart.jpg', rating: 3.8, developer: 'Blizzard', genre: 'FPS' },
    { id: 103, name: 'Counter-Strike 2', year: 2023, platforms: ['PC'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg', rating: 4.4, developer: 'Valve', genre: 'FPS' },
    { id: 104, name: 'Apex Legends', year: 2019, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg', rating: 4.2, developer: 'Respawn', genre: 'Battle Royale' },

    // === INDIE GEMS ===
    { id: 150, name: 'Hades', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg', rating: 4.8, developer: 'Supergiant Games', genre: 'Roguelike' },
    { id: 151, name: 'Celeste', year: 2018, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg', rating: 4.7, developer: 'Maddy Makes Games', genre: 'Platformer' },
    { id: 152, name: 'Dead Cells', year: 2018, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/588650/header.jpg', rating: 4.5, developer: 'Motion Twin', genre: 'Roguelike' },
    { id: 153, name: 'Stardew Valley', year: 2016, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg', rating: 4.6, developer: 'ConcernedApe', genre: 'Simulation' },
    { id: 154, name: 'Among Us', year: 2018, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg', rating: 4.0, developer: 'InnerSloth', genre: 'Party' },
    { id: 155, name: 'Subnautica', year: 2018, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg', rating: 4.7, developer: 'Unknown Worlds', genre: 'Survival' },
    { id: 156, name: 'The Forest', year: 2018, platforms: ['PC', 'PlayStation'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg', rating: 4.4, developer: 'Endnight Games', genre: 'Survival' },
    { id: 157, name: 'Ori and the Will of the Wisps', year: 2020, platforms: ['PC', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1057090/header.jpg', rating: 4.6, developer: 'Moon Studios', genre: 'Metroidvania' },
    { id: 158, name: 'Pizza Tower', year: 2023, platforms: ['PC', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1748720/header.jpg', rating: 4.5, developer: 'Tour De Pizza', genre: 'Platformer' },
    { id: 159, name: 'A Hat in Time', year: 2017, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/253230/header.jpg', rating: 4.4, developer: 'Gears for Breakfast', genre: 'Platformer' },

    // === HORROR ===
    { id: 200, name: 'Resident Evil 4', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg', rating: 4.7, developer: 'Capcom', genre: 'Horror' },
    { id: 201, name: 'Dead Space', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1693980/header.jpg', rating: 4.5, developer: 'Motive Studio', genre: 'Horror' },
    { id: 202, name: 'Phasmophobia', year: 2020, platforms: ['PC'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg', rating: 4.3, developer: 'Kinetic Games', genre: 'Horror' },

    // === STRATEGY ===
    { id: 250, name: 'Civilization VI', year: 2016, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg', rating: 4.3, developer: '2K Games', genre: 'Strategy' },
    { id: 251, name: 'Total War: Warhammer III', year: 2022, platforms: ['PC'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1142710/header.jpg', rating: 4.1, developer: 'Creative Assembly', genre: 'Strategy' },
    { id: 252, name: 'Age of Empires IV', year: 2021, platforms: ['PC', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1466860/header.jpg', rating: 4.2, developer: 'Relic Entertainment', genre: 'Strategy' },

    // === RACING ===
    { id: 300, name: 'Forza Horizon 5', year: 2021, platforms: ['PC', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg', rating: 4.6, developer: 'Playground Games', genre: 'Racing' },
    { id: 301, name: 'Gran Turismo 7', year: 2022, platforms: ['PlayStation'], image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2618/9V1P3wVoLLnC6E4gsKBhNRq3.png', rating: 4.3, developer: 'Polyphony Digital', genre: 'Racing' },

    // === NINTENDO EXCLUSIVES ===
    { id: 350, name: 'The Legend of Zelda: Breath of the Wild', year: 2017, platforms: ['Nintendo Switch'], image: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000025/7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a5cfd91697f58', rating: 4.9, developer: 'Nintendo', genre: 'Adventure' },
    { id: 351, name: 'Super Mario Odyssey', year: 2017, platforms: ['Nintendo Switch'], image: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000000588/c7e6703b8d56a82b75ae02c00b31f9e2bd2f02c1b7b7e2ffdd3c8d4a3b6e2b3a', rating: 4.7, developer: 'Nintendo', genre: 'Platformer' },

    // === MMORPG ===
    { id: 400, name: 'Final Fantasy XIV', year: 2010, platforms: ['PC', 'PlayStation'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/39210/header.jpg', rating: 4.5, developer: 'Square Enix', genre: 'MMORPG' },
    { id: 401, name: 'World of Warcraft', year: 2004, platforms: ['PC'], image: 'https://images.blz-contentstack.com/v3/assets/blt3452e3b114fab0cd/bltc58633063ef4e0b9/633dd4e69b1e9c6932e87e34/wow_keyart_4k.jpg', rating: 4.2, developer: 'Blizzard', genre: 'MMORPG' },
    { id: 402, name: 'Guild Wars 2', year: 2012, platforms: ['PC'], image: 'https://d3b4yo2b5lbfy.cloudfront.net/wp-content/uploads/2012/08/gw2logo.jpg', rating: 4.1, developer: 'ArenaNet', genre: 'MMORPG' },
    { id: 403, name: 'Lost Ark', year: 2022, platforms: ['PC'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1599340/header.jpg', rating: 3.9, developer: 'Smilegate', genre: 'MMORPG' },

    // === SPORTS ===
    { id: 450, name: 'FIFA 24', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2195250/header.jpg', rating: 3.8, developer: 'EA Sports', genre: 'Sports' },
    { id: 451, name: 'NBA 2K24', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2338770/header.jpg', rating: 3.7, developer: '2K Sports', genre: 'Sports' },
    { id: 452, name: 'Tony Hawk\'s Pro Skater 1 + 2', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2395210/header.jpg', rating: 4.4, developer: 'Vicarious Visions', genre: 'Sports' },

    // === FIGHTING GAMES ===
    { id: 500, name: 'Street Fighter 6', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1364780/header.jpg', rating: 4.5, developer: 'Capcom', genre: 'Fighting' },
    { id: 501, name: 'Tekken 8', year: 2024, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1778820/header.jpg', rating: 4.3, developer: 'Bandai Namco', genre: 'Fighting' },
    { id: 502, name: 'Mortal Kombat 1', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1971870/header.jpg', rating: 4.1, developer: 'NetherRealm Studios', genre: 'Fighting' },

    // === PUZZLE/CASUAL ===
    { id: 550, name: 'Portal 2', year: 2011, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/620/header.jpg', rating: 4.9, developer: 'Valve', genre: 'Puzzle' },
    { id: 551, name: 'Tetris Effect', year: 2018, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1003590/header.jpg', rating: 4.6, developer: 'Monstars Inc.', genre: 'Puzzle' },
    { id: 552, name: 'Fall Guys', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1097150/header.jpg', rating: 3.9, developer: 'Mediatonic', genre: 'Party' },

    // === CLASSIC REMASTERS ===
    { id: 600, name: 'Grand Theft Auto: San Andreas', year: 2004, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/12120/header.jpg', rating: 4.5, developer: 'Rockstar', genre: 'Open World' },
    { id: 601, name: 'Half-Life 2', year: 2004, platforms: ['PC'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/220/header.jpg', rating: 4.8, developer: 'Valve', genre: 'FPS' },
    { id: 602, name: 'Mass Effect Legendary Edition', year: 2021, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1328670/header.jpg', rating: 4.7, developer: 'BioWare', genre: 'RPG' },
    { id: 603, name: 'Diablo II: Resurrected', year: 2021, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1666780/header.jpg', rating: 4.2, developer: 'Blizzard', genre: 'ARPG' },

    // === SIMULATION ===
    { id: 650, name: 'Microsoft Flight Simulator', year: 2020, platforms: ['PC', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg', rating: 4.4, developer: 'Asobo Studio', genre: 'Simulation' },
    { id: 651, name: 'Cities: Skylines', year: 2015, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/255710/header.jpg', rating: 4.3, developer: 'Colossal Order', genre: 'Simulation' },
    { id: 652, name: 'The Sims 4', year: 2014, platforms: ['PC', 'PlayStation', 'Xbox'], image: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg', rating: 3.8, developer: 'Maxis', genre: 'Simulation' },

    // === MOBILE HITS (PC VERSIONS) ===
    { id: 700, name: 'Genshin Impact', year: 2020, platforms: ['PC', 'PlayStation'], image: 'https://webstatic.hoyoverse.com/upload/contentweb/2022/08/23/c5b4c1acfabf2ad21a65c9aab95f8ed5_8747659732828725020.png', rating: 4.0, developer: 'miHoYo', genre: 'Gacha RPG' },
    { id: 701, name: 'Honkai: Star Rail', year: 2023, platforms: ['PC'], image: 'https://webstatic.hoyoverse.com/upload/event/2023/02/27/ba6a4d6f4be3dd7a8da6b0a5e5bcced7_5180047802960825020.png', rating: 4.1, developer: 'miHoYo', genre: 'Turn-based RPG' }
];

// Mapping des plateformes
const platformMappings = {
    'Steam': { name: 'Steam', icon: '🟦', launchPrefix: 'steam://run/', searchUrl: 'https://store.steampowered.com/search/?term=' },
    'Epic Games': { name: 'Epic Games', icon: '⚫', launchPrefix: 'com.epicgames.launcher://apps/', searchUrl: 'https://store.epicgames.com/en-US/browse?q=' },
    'GOG': { name: 'GOG', icon: '🟣', launchPrefix: 'goggalaxy://openGameView/', searchUrl: 'https://www.gog.com/games?search=' },
    'Battle.net': { name: 'Battle.net', icon: '🔵', launchPrefix: 'battlenet://', searchUrl: 'https://us.shop.battle.net/en-us/product/' },
    'Ubisoft Connect': { name: 'Ubisoft', icon: '🔶', launchPrefix: 'uplay://launch/', searchUrl: 'https://store.ubisoft.com/us/search/?q=' },
    'Origin/EA': { name: 'EA App', icon: '🟠', launchPrefix: 'origin://launchgame/', searchUrl: 'https://www.ea.com/games/library/pc-download/' },
    'PC Standalone': { name: 'Executable', icon: '💻', launchPrefix: '', searchUrl: '' }
};