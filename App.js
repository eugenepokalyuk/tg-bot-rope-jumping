const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

const token = '5934121092:AAEmFla6FYWE_gJ_nvuSa7wyOJpZ1248LgA';
const bot = new TelegramBot(token, { polling: true });
process.title = "Telegram bot";

const buttons = [
    [{ text: '📒 Каталог', callback_data: 'Catalog' }],
    [{ text: '🚗 Доставка', callback_data: 'Shipping' }],
    [{ text: '☎️ Обратная связь', url: 'https://t.me/kvpotekhin' }],
    [{ text: '🛒 Мои заказы', callback_data: 'My orders' }],
];

bot.onText(/\/start/, async function (msg, match) {
    try {
        const chatId = msg.chat.id

        let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
        let user = new Promise(async (resolve, rejects) => {
            db.each(`SELECT COUNT(userid) FROM Users WHERE userid == "${chatId}"`, async (err, row) => {
                if (err) {
                    console.error(err)
                }
                resolve(await row["COUNT(userid)"])
            })
        })
        db.close((err) => { if (err) { console.error(err) } })

        if (await user == 0) {
            console.log(`Ух ты новый пользователь: ${msg.chat.username}[${chatId}]`)

            let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
            new Promise(async (resolve, rejects) => {
                db.run(`INSERT INTO Users (userid, first_name, last_name, username) VALUES ("${chatId}", "${msg.chat.first_name}", "${msg.chat.last_name}", "${msg.chat.username}");`, async (err, row) => {
                    if (err) {
                        console.error(err)
                    }
                    resolve(await row)
                })
            })
            db.close((err) => { if (err) { console.error(err) } })

            bot.sendMessage(chatId, `Добро пожаловать ${msg.chat.first_name} ${msg.chat.last_name} в SHAPKIN 🧣`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [...buttons]
                })
            });
        } else if (chatId == 234044513) {
            console.log(`Отец в хате!`)
            bot.sendMessage(chatId, `Отец SHAPKIN в хате 🧣`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        ...buttons,
                        [{ text: "⚙️ Admin", callback_data: "Admin" }]
                    ]
                })
            });
        } else {
            console.log(`Опять ты ${msg.chat.username}[${chatId}]!`)
            bot.sendMessage(chatId, `Что-то вы зачастили в SHAPKIN 🧣`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [...buttons]
                })
            });
        }
    } catch (error) {
        console.log(error)
    }
});

bot.on('callback_query', async (query) => {
    try {
        const data = query.data;
        const msg = query.message;

        let array = await getSeasons();

        console.log(query)

        for (let i = 0; i < array.length; i++) {
            
            switch (data) {

                // case array[i][0].text: // array[1][0].text
                //     bot.editMessageText(`📒 Каталог -> ${array[i][0].text}`, {
                //         chat_id: msg.chat.id,
                //         message_id: msg.message_id,
                //         reply_markup: {
                //             inline_keyboard: [
                //                 ...await getTypes(),
                //                 [{ text: '❌ Назад', callback_data: 'backToSeasons' }],
                //             ]
                //         }
                //     });
                //     break;

                // case "Admin":
                //     bot.editMessageText('⚙️ Admin', {
                //         chat_id: msg.chat.id,
                //         message_id: msg.message_id,
                //         reply_markup: {
                //             inline_keyboard: [
                //                 [{ text: "Добавить предмет", callback_data: "add_item" }],
                //                 [{ text: '❌ Назад', callback_data: 'back' }],
                //             ]
                //         }
                //     });
                //     break;

                case "Catalog":
                    bot.editMessageText('📒 Каталог', {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                ...await getSeasons(),
                                [{ text: '❌ Назад', callback_data: 'back' }],
                            ]
                        }
                    });
                    break;
                case "Shipping":
                    bot.editMessageText('🚗 Доставка', {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Box Berry", callback_data: "Shipping_BoxBerry" }],
                                [{ text: "СДЭК", callback_data: "Shipping_SDEK" }],
                                [{ text: "Почта РФ", callback_data: "Shipping_RussianPost" }],
                                [{ text: '❌ Назад', callback_data: 'back' }],
                            ]
                        }
                    });
                    break;
                case "Feedback":
                    bot.editMessageText('☎️ Обратная связь', {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '❌ Назад', callback_data: 'back' }],
                            ]
                        }
                    });
                    break;

                case "back":
                    bot.editMessageText(`Добро пожаловать в SHAPKIN 🧣`, { // ❌
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: buttons
                        }
                    });
                    break;
                case "backToSeasons":
                    bot.editMessageText(`Добро пожаловать в SHAPKIN 🧣`, { // ❌
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [
                                ...await getSeasons(),
                                [{ text: '❌ Назад', callback_data: 'back' }],
                            ]
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        // switch (data) {
        //     case "Admin":
        //         bot.editMessageText('⚙️ Admin', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     [{ text: "Добавить предмет", callback_data: "add_item" }],
        //                     [{ text: '❌ Назад', callback_data: 'back' }],
        //                 ]
        //             })
        //         });
        //         break;

        //     case "Catalog":
        //         bot.editMessageText('📒 Каталог', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     ...await getSeasons(),
        //                     [{ text: '❌ Назад', callback_data: 'back' }],
        //                 ]
        //             })
        //         });
        //         break;
        //     case "Shipping":
        //         bot.editMessageText('🚗 Доставка', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     [{ text: "Box Berry", callback_data: "Shipping_BoxBerry" }],
        //                     [{ text: "СДЭК", callback_data: "Shipping_SDEK" }],
        //                     [{ text: "Почта РФ", callback_data: "Shipping_RussianPost" }],
        //                     [{ text: '❌ Назад', callback_data: 'back' }],
        //                 ]
        //             })
        //         });
        //         break;
        //     case "Feedback":
        //         bot.editMessageText('☎️ Обратная связь', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     [{ text: '❌ Назад', callback_data: 'back' }],
        //                 ]
        //             })
        //         });
        //         break;
        //     case "Winter": // array[1][0].text
        //         bot.editMessageText('📒 Каталог -> ❄️ Зима', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     ...await getTypes(),
        //                     [{ text: '❌ Назад', callback_data: 'backToSeasons' }],
        //                 ]
        //             })
        //         });
        //         break;
        //     case "Spring/Autumn":
        //         bot.editMessageText('📒 Каталог -> ☂️ Весна/Осень', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     ...await getTypes(),
        //                     [{ text: '❌ Назад', callback_data: 'backToSeasons' }],
        //                 ]
        //             })
        //         });
        //         break;
        //     case "Summer":
        //         bot.editMessageText('📒 Каталог -> ☀️ Лето', {
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                     ...await getTypes(),
        //                     [{ text: '❌ Назад', callback_data: 'backToSeasons' }],
        //                 ]
        //             })
        //         });
        //         break;

        //     case "back":
        //         bot.editMessageText(`Добро пожаловать в SHAPKIN 🧣`, { // ❌
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: buttons
        //             })
        //         });
        //         break;
        //     case "backToSeasons":
        //         bot.editMessageText(`Добро пожаловать в SHAPKIN 🧣`, { // ❌
        //             chat_id: msg.chat.id,
        //             message_id: msg.message_id,
        //             reply_markup: JSON.stringify({
        //                 inline_keyboard: [
        //                    ...await getSeasons(),
        //                     [{ text: '❌ Назад', callback_data: 'back' }],
        //                 ]

        //             })
        //         });
        //         break;
        //     default:
        //         break;
        // }
    } catch (error) {
        console.log(error)
    }
});

async function getSeasons() {
    try {
        let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
        let count_seasons = new Promise(async (resolve, rejects) => {
            db.each(`SELECT COUNT(id) FROM Season`, async (err, row) => {
                if (err) {
                    console.error(err)
                }
                resolve(await row["COUNT(id)"])
            })
        })
        db.close((err) => { if (err) { console.error(err) } })

        let array = [];

        if (await count_seasons != 0) {
            for (let i = 0; i < await count_seasons; i++) {
                let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
                let seasons = new Promise(async (resolve, rejects) => {
                    db.each(`SELECT season_name FROM Season WHERE id=${i}`, async (err, row) => {
                        if (err) {
                            console.error(err)
                        }
                        resolve(await row["season_name"])
                    })
                })
                db.close((err) => { if (err) { console.error(err) } })
                array.push([{ text: `${await seasons}`, callback_data: `${await seasons}` }])
            }
        }
        // console.log(array[1][0].text)
        return array;
    } catch (error) {
        console.error(error.message)
    }
}
async function getTypes() {
    try {
        let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
        let count_types = new Promise(async (resolve, rejects) => {
            db.each(`SELECT COUNT(id) FROM Type`, async (err, row) => {
                if (err) {
                    console.error(err)
                }
                resolve(await row["COUNT(id)"])
            })
        })
        db.close((err) => { if (err) { console.error(err) } })

        let array = [];

        if (await count_types != 0) {
            for (let i = 0; i < await count_types; i++) {
                let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
                let types = new Promise(async (resolve, rejects) => {
                    db.each(`SELECT type_name FROM Type WHERE id=${i}`, async (err, row) => {
                        if (err) {
                            console.error(err)
                        }
                        resolve(await row["type_name"])
                    })
                })
                db.close((err) => { if (err) { console.error(err) } })
                array.push([{ text: `${await types}`, callback_data: `${await types}` }])
            }
        }
        return array;
    } catch (error) {
        console.error(error)
    }
}