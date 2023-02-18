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

// Подумать над очисткой сообщений
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
                // Добавить дату регистрации
                db.run(`INSERT INTO Users (userid, first_name, last_name, username, date_registration) VALUES ("${chatId}", "${msg.chat.first_name}", "${msg.chat.last_name}", "${msg.chat.username}", "${getToday()}");`, async (err, row) => {
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
bot.on('message', async function (msg) {
    try {
        if (msg.text != "/start") {
            const chatId = msg.chat.id
            bot.sendMessage(chatId, `Я не понимаю что вы пишите, чтобы вызвать меню нажмите /start`);
        }
    } catch (error) {
        console.log(error)
    }
});
bot.on('callback_query', async (query) => {
    try {
        const data = query.data;
        const msg = query.message;

        let arraySeasons = await getSeasons();
        let arrayTypes = await getProductTypes();

        let sended = false;
        for (let i = 0; i < arraySeasons.length; i++) {
            for (let j = 0; j < arrayTypes.length; j++) {
                switch (data) {
                    case arrayTypes[j][0].callback_data:
                        // const option = [
                        //     {
                        //         type: 'photo',
                        //         media: 'https://cdn.searchenginejournal.com/wp-content/uploads/2022/06/image-search-1600-x-840-px-62c6dc4ff1eee-sej.png',
                        //         caption: 'Image One'
                        //     },
                        //     {
                        //         type: 'photo',
                        //         media: 'https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg',
                        //         caption: 'Image Two'
                        //     },
                        //     {
                        //         type: 'photo',
                        //         media: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8&w=1000&q=80',
                        //         caption: 'Image Three'
                        //     },
                        //     {
                        //         type: 'text',
                        //         text: 'This is text message',
                        //         reply_markup: {
                        //             inline_keyboard: [
                        //                 // ...await getProducts(arraySeasons[i][0].callback_data, data),
                        //                 [{ text: '❌ Назад', callback_data: 'Catalog' }],
                        //             ]
                        //         }
                        //     }
                        // ]
                        // bot.sendMediaGroup(msg.chat.id, option);
                        bot.editMessageText("[Вот вам шапочка!](https://raw.githubusercontent.com/eugenepokalyuk/profile/main/images/logo__orange.png?token=GHSAT0AAAAAAB436I4NWUYYBSEXZCX6WECUY7RDTVQ)\nЦвет синий\nЦена 5 млн рублей", {
                            chat_id: msg.chat.id,
                            message_id: msg.message_id,
                            parse_mode: "markdown",
                            reply_markup: {
                                inline_keyboard: [
                                    ...await getProducts(arraySeasons[i][0].callback_data, data),
                                    [{ text: '❌ Назад', callback_data: 'Catalog' }],
                                ]
                            }
                        });
                        sended = true;
                        break;
                    case arraySeasons[i][0].callback_data:
                        bot.editMessageText(`📒 Каталог => ${data}`, {
                            chat_id: msg.chat.id,
                            message_id: msg.message_id,
                            reply_markup: {
                                inline_keyboard: [
                                    ...await getTypes(data),
                                    [{ text: '❌ Назад', callback_data: 'Catalog' }],
                                ]
                            }
                        });
                        sended = true;
                        break;

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
                        sended = true;
                        break;
                    case "Shipping":
                        bot.editMessageText('🚗 Доставка', {
                            chat_id: msg.chat.id,
                            message_id: msg.message_id,
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "Box Berry", callback_data: "Shipping_tool(Box Berry)" }],
                                    [{ text: "СДЭК", callback_data: "Shipping_tool(СДЭК)" }],
                                    [{ text: "Почта РФ", callback_data: "Shipping_tool(Почта РФ)" }],
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

                    case "Shipping_tool(Почта РФ)":
                        bot.editMessageText('🚗 Доставка Почта РФ\nтам окно для заполнения – город, индекс, адрес, фио телефон, далее уже исходя из веса и города стоимость отправления.', {
                            chat_id: msg.chat.id,
                            message_id: msg.message_id,
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '❌ Назад', callback_data: 'Shipping' }],
                                ]
                            }
                        });
                        break;
                    case "Shipping_tool(СДЭК)":
                        bot.editMessageText('🚗 Доставка СДЭК\nвыбрать вид доставки: склад-склад, склад-дверь.\nЕсли склад-склад, то адрес ближайшего склада где будет удобно забрать послыку. Данные – фио, телефон.\nЕсли склад-дверь то адрес домашний, фио и телефон.', {
                            chat_id: msg.chat.id,
                            message_id: msg.message_id,
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '❌ Назад', callback_data: 'Shipping' }],
                                ]
                            }
                        });
                        break;
                    case "Shipping_tool(Box Berry)":
                        bot.editMessageText('🚗 Доставка Box Berry\nфио, телефон, адрес ближайшего пункта выдачи заказов.', {
                            chat_id: msg.chat.id,
                            message_id: msg.message_id,
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '❌ Назад', callback_data: 'Shipping' }],
                                ]
                            }
                        });
                        break;

                    case "My orders":
                        bot.editMessageText('🛒 Ваша корзина пуста', {
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
                    default:
                        break;
                }
                if (sended)
                    break;
            }
            if (sended)
                break;
        }
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
        return array;
    } catch (error) {
        console.error(error.message)
    }
}
async function getProductTypes() {
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
        console.error(error.message)
    }
}
async function getTypes(data) {
    try {
        if (data != undefined) {
            //#region [Get season ID]
            let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
            let season_id = new Promise(async (resolve, rejects) => {
                db.each(`SELECT season_id as id FROM Season WHERE season_name="${data}"`, async (err, row) => {
                    if (err) {
                        console.error(err)
                    }
                    resolve(await row["id"])
                })
            })
            db.close((err) => { if (err) { console.error(err) } })

            let sid = await season_id;
            //#endregion
            //#region [Get count types]
            db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
            let count_types = new Promise(async (resolve, rejects) => {
                db.each(`SELECT COUNT(season_id) as id FROM Catalog WHERE season_id="${sid}"`, async (err, row) => {
                    if (err) {
                        console.error(err)
                    }
                    resolve(await row["id"])
                })
            })
            db.close((err) => { if (err) { console.error(err) } })

            let ct = await count_types; // 4
            //#endregion
            //#region [Get id IDs]
            db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
            let temp = new Promise(async (resolve, rejects) => {
                let sql = `SELECT id FROM Catalog WHERE season_id="${sid}"`;
                db.all(sql, async (err, row) => {
                    if (err) {
                        console.error(err)
                    }
                    resolve(await row)
                })
            })
            db.close((err) => { if (err) { console.error(err) } })

            let id_arr = await temp;
            //#endregion
            //#region [Get uniq types]
            db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
            let getUniqTypeIDs = new Promise(async (resolve, rejects) => {
                let sql = `SELECT DISTINCT type_id FROM Catalog WHERE season_id="${sid}"`;
                db.all(sql, async (err, row) => {
                    if (err) {
                        console.error(err)
                    }
                    resolve(await row)
                })
            })
            db.close((err) => { if (err) { console.error(err) } })

            let arrayUniqTypeIDs = await getUniqTypeIDs;
            //#endregion
            //#region [Get product type bnttons]
            let arrayResult = [];
            for (let i = 0; i < arrayUniqTypeIDs.length; i++) {
                const element = arrayUniqTypeIDs[i].type_id;
                let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
                let getProductTypeNames = new Promise(async (resolve, rejects) => {
                    let sql = `SELECT type_name FROM Type WHERE type_id="${element}"`;
                    db.each(sql, async (err, row) => {
                        if (err) {
                            console.error(err)
                        }
                        resolve(await row.type_name)
                    })
                })
                db.close((err) => { if (err) { console.error(err) } })
                arrayResult.push([{ text: `${await getProductTypeNames}`, callback_data: `${await getProductTypeNames}` }])
            }
            return arrayResult;
            //#endregion
        }
    } catch (error) {
        console.error(error)
    }
}
async function getProducts(seasonName, typeName) {
    try {
        if (seasonName != undefined && typeName != undefined) {
            let setSeasonId = await getSeasonId(seasonName); // 0
            let setTypeId = await getTypeId(typeName); // 0

            let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
            let temp = new Promise(async (resolve, rejects) => {
                db.all(`SELECT * FROM Catalog WHERE season_id="${setSeasonId}" AND type_id="${setTypeId}"`, async (err, row) => {
                    if (err) {
                        console.error(err)
                    }
                    resolve(await row)
                })
            })
            db.close((err) => { if (err) { console.error(err) } })

            console.log(await temp);
            if (await temp.length == 0) {
                return [
                    [{ text: `Тут ничего нет`, callback_data: `n\\f` }]
                ]
            } else {
                return [
                    [{ text: `1 товар`, callback_data: `item` }, { text: `2 товар`, callback_data: `item` }],
                    [{ text: `1 товар`, callback_data: `item` }, { text: `2 товар`, callback_data: `item` }, { text: `3 товар`, callback_data: `item` }],
                    [{ text: `1 товар`, callback_data: `item` }, { text: `2 товар`, callback_data: `item` }, { text: `3 товар`, callback_data: `item` }, { text: `4 товар`, callback_data: `item` }],
                    [{ text: `XS`, callback_data: `item` }, { text: `S`, callback_data: `item` }, { text: `M`, callback_data: `item` }, { text: `L`, callback_data: `item` }, { text: `XL`, callback_data: `item` }],
                ]
            }
        }
    } catch (error) {
        console.error(error)
    }
}

async function getSeasonId(data) {
    try {
        let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
        let season_id = new Promise(async (resolve, rejects) => {
            db.each(`SELECT season_id as id FROM Season WHERE season_name="${data}"`, async (err, row) => {
                if (err) {
                    console.error(err)
                }
                resolve(await row["id"])
            })
        })
        db.close((err) => { if (err) { console.error(err) } })

        return await season_id;
    } catch (error) {
        console.error(error)
    }
}
async function getTypeId(data) {
    try {
        let db = new sqlite3.Database('./data.db', (err) => { if (err) { console.error(err) } });
        let season_id = new Promise(async (resolve, rejects) => {
            db.each(`SELECT type_id as id FROM Type WHERE type_name="${data}"`, async (err, row) => {
                if (err) {
                    console.error(err)
                }
                resolve(await row["id"])
            })
        })
        db.close((err) => { if (err) { console.error(err) } })

        return await season_id;
    } catch (error) {
        console.error(error)
    }
}

function getToday() {
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const formattedToday = dd + '/' + mm + '/' + yyyy;

        return formattedToday;
    } catch (error) {
        console.error(error)
    }
}