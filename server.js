'use strict';
const fs = require('fs');
const path = require("path");
const electron = require("electron");
const moment = require("moment");

const pg = require("pg");

const tables = ['user', 'product', 'buy', 'buyProduct', 'client', 'transaction', 'transactionProduct', 'comment',
    'employee', 'payment', 'register', 'supplier'];
const tablesToPost = ['user', 'supplier', 'product', 'client', 'buy', 'transaction'];

const client = new pg.Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'goldo',
    password: 'admin',
    port: 5432
});

client.connect();

"use strict";
let express = require('express');
let cors = require('cors')
let bodyParser = require('body-parser');
let app = express();
app.use(cors());
app.use(bodyParser.json({type: 'application/json'}));

app.post('/login', function (req, res, next) {
    executeAll(`SELECT * FROM "user" u WHERE u.username = '${req.body.username}' AND u.password = '${req.body.password}'`, res, next);
});

app.get('/users', function (req, res, next) {
    executeAll(`SELECT *, count(*) OVER() AS count FROM "user" u WHERE u.name ILIKE '%${req.query.filter || ''}%'
                            ORDER BY ${'u.' + (req.query.sort || 'name')} ${req.query.order || 'DESC'} 
                            LIMIT ${req.query.pageSize * (req.query.pageIndex + 1)} OFFSET ${req.query.pageSize * req.query.pageIndex}`, res, next);
});

app.get('/users', function (req, res, next) {
    executeAll(`SELECT * FROM "user"`, res, next);
});

app.get('/user', function (req, res, next) {
    executeAll(`SELECT * FROM "user where id = " ${req.query.id}`, res, next);
});

app.post('/user', function (req, res, next) {
    executeAll(`INSERT INTO "user" (name, username, password, role) 
            VALUES('${req.body.name ? req.body.name.replace(/\'/g, "''") : ''}', 
            '${req.body.username ? req.body.username.replace(/\'/g, "''") : ''}',
             '${req.body.password ? req.body.password.replace(/\'/g, "''") : ''}', 
             '${req.body.role}') RETURNING *`, res, next);
});

app.delete('/user', function (req, res, next) {
    executeAll(`DELETE FROM "user" WHERE id = ${req.query.id}`, res, next);
});

app.put('/user', function (req, res, next) {
    executeAll(`UPDATE "user"
               SET name = '${req.body.name ? req.body.name.replace(/\'/g, "''") : ''}',
                username = '${req.body.username ? req.body.username.replace(/\'/g, "''") : ''}',
                 password = '${req.body.password ? req.body.password.replace(/\'/g, "''") : ''}', 
                 role = '${req.body.role}'
             WHERE id = ${req.body.id} RETURNING *`, res, next);
});

app.post('/postAllData', function (req, res, next) {
    const promises = [];
    const dataToPost = req.body;
    console.log('Executing PostAllDAta');
    console.log(dataToPost);
    tablesToPost.forEach((t) => {
        const table = dataToPost[t];
        if (table) {
            console.log('Executing Table ' + t);
            table.forEach(m => {
                if (t === 'transaction') {
                    promises.push(client.query(`DELETE FROM "transactionProduct" WHERE transaction = ${m.id}`));
                    dataToPost['transactionProduct'].forEach(t => {
                        if (m.id === t.transaction) {
                            promises.push(client.query(getScripts(t).transactionProduct.insert));
                        }
                    });
                }
                if (t === 'buy') {
                    promises.push(client.query(`DELETE FROM "buyProduct" WHERE buy = ${m.id}`));
                    dataToPost['buyProduct'].forEach(t => {
                        if (m.id === t.buy) {
                            promises.push(client.query(getScripts(t).buyProduct.insert));
                        }
                    });

                }
                console.log(`SELECT id FROM "${t}" WHERE id = ${m.id}`);
                client.query(`SELECT id FROM "${t}" WHERE id = ${m.id}`).then(val => {
                    console.log(val)
                    if (val && val.rows && val.rows.length) {
                        console.log('IF UPDATE ' + getScripts(m)[t].insert)
                        promises.push(client.query(getScripts(m)[t].update));
                    } else {
                        console.log('IF INSERT ' + getScripts(m)[t].insert)
                        promises.push(client.query(getScripts(m)[t].insert));
                    }
                });
            });
        }
    });
    console.log(promises);
    Promise.all(promises).then(() => {
            console.log('PostAllData Done!');
            res.send({});
        }
    ).catch(
        (err) => {
            next(err);
            console.log('PostAllData ERROR!');
            writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> POST_ALL_DATA + GET_ALL_DATA Received --> ' + err)
        }
    );
});

app.get('/getAllData', function (req, res, next) {
    console.log('Executing GetAllData');
    Promise.all([
        client.query('SELECT * FROM "user"'),
        client.query('SELECT * FROM "product"'),
        client.query('SELECT * FROM "buy"  order by date desc'),
        client.query('SELECT * FROM "buyProduct"'),
        client.query('SELECT * FROM "client"'),
        client.query('SELECT * FROM "transaction" order by date desc'),
        client.query('SELECT * FROM "transactionProduct"'),
        client.query('SELECT * FROM "comment" order by date desc'),
        client.query('SELECT * FROM "employee"'),
        client.query('SELECT * FROM "payment" order by date desc'),
        client.query('SELECT * FROM "register" order by date desc'),
        client.query('SELECT * FROM "supplier"'),
    ]).then(result => {
            console.log('GetAllData Done!');
            const data = result.reduce((a, b, i) => {
                return {...a, ...{[tables[i]]: b.rows}}
            }, {});
            res.send(data)
        }
    ).catch(
        (err) => {
            next(err);
            console.log('Error GetAllData');
            console.log(err);
            writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> GET_ALL_DATA Received --> ' + err)
        }
    );
});


app.listen(3000);

function getScripts(m) {
    return {
        product: {
            insert: `
            INSERT INTO "product" (name, description,category, price, quantity, photo)
            VALUES('${m.name}', '${m.description ? m.description.replace(/\'/g, "''") : ''}',
            '${m.category ? m.category.replace(/\'/g, "''") : ''}', 
            ${m.price}, ${m.quantity}, '${m.photo}') RETURNING *`,
            update: `UPDATE "product"
               SET name = '${m.name}', description = '${m.description ? m.description.replace(/\'/g, "''") : ''}', 
               category = '${m.category ? m.category.replace(/\'/g, "''") : ''}', 
               price = ${m.price}, quantity = ${m.quantity}, photo = '${m.photo}' WHERE id = ${m.id} RETURNING *`
        },
        client: {
            insert: `INSERT INTO "client" (name, address, phone, phone2, "blocked", photo)
            VALUES('${m.name ? m.name.replace(/\'/g, "''") : ''}',
            '${m.address ? m.address.replace(/\'/g, "''") : ''}', '${m.phone}', 
            '${m.phone2}', ${m.blocked}, '${m.photo}') RETURNING *`,
            update: `UPDATE "client"
               SET name = '${m.name ? m.name.replace(/\'/g, "''") : ''}', 
               address = '${m.address ? m.address.replace(/\'/g, "''") : ''}', phone = '${m.phone}', 
                phone2 = '${m.phone2}', "blocked" = ${m.blocked}, 
                photo = '${m.photo}'  
             WHERE id = ${m.id} RETURNING *`
        },
        supplier: {
            insert: `INSERT INTO "supplier" (name, address, phone, phone2, "blocked", photo)
            VALUES('${m.name ? m.name.replace(/\'/g, "''") : ''}',
            '${m.address ? m.address.replace(/\'/g, "''") : ''}', '${m.phone}', 
            '${m.phone2}', ${m.blocked}, '${m.photo}') RETURNING *`,
            update: `UPDATE "supplier"
               SET name = '${m.name ? m.name.replace(/\'/g, "''") : ''}', 
               address = '${m.address ? m.address.replace(/\'/g, "''") : ''}', phone = '${m.phone}', 
                phone2 = '${m.phone2}', "blocked" = ${m.blocked}, 
                photo = '${m.photo}'  
             WHERE id = ${m.id} RETURNING *`
        },
        transaction: {
            insert: `INSERT INTO "transaction" ("amountIn", "amountOut", "goldIn", "goldOut", "amountDue", "totalAmount", "totalGold", date, comment,type, client, responsible)
            VALUES(${m.amountIn},${m.amountOut},${m.goldIn}, ${m.goldOut},${m.amountDue},
            ${m.totalAmount},${m.totalGold}, '${m.date}', '${m.comment ? m.comment.replace(/\'/g, "''") : ''}', '${m.type}',
            ${m.client}, ${m.responsible}) RETURNING *`,
            update: `UPDATE "transaction"
               SET "amountIn" = ${m.amountIn}, "amountOut" = ${m.amountOut},"goldIn" = ${m.goldIn},
               "goldOut" = ${m.goldOut},"amountDue" = ${m.amountDue},"totalAmount" = ${m.totalAmount},
               "totalGold" = ${m.totalGold}, date = '${m.date}', type='${m.type}',
               comment = '${m.comment ? m.comment.replace(/\'/g, "''") : ''}'
               , client = ${m.client}, responsible = ${m.responsible}
             WHERE id = ${m.id}`
        },
        buy: {
            insert: `INSERT INTO "buy" ("amountIn", "amountOut", "goldIn", "goldOut", "amountDue", "totalAmount", "totalGold", date, comment,type, supplier, responsible)
            VALUES(${m.amountIn},${m.amountOut},${m.goldIn}, ${m.goldOut},${m.amountDue},
            ${m.totalAmount},${m.totalGold}, '${m.date}', '${m.comment ? m.comment.replace(/\'/g, "''") : ''}', '${m.type}',
            ${m.supplier}, ${m.responsible}) RETURNING *`,
            update: ` UPDATE "buy"
               SET "amountIn" = ${m.amountIn}, "amountOut" = ${m.amountOut},"goldIn" = ${m.goldIn},
               "goldOut" = ${m.goldOut},"amountDue" = ${m.amountDue},"totalAmount" = ${m.totalAmount},
               "totalGold" = ${m.totalGold}, date = '${m.date}', type='${m.type}',
               comment = '${m.comment ? m.comment.replace(/\'/g, "''") : ''}'
               , supplier = ${m.supplier}, responsible = ${m.responsible}
             WHERE id = ${m.id}`
        },
        transactionProduct: {
            insert: `INSERT INTO "transactionProduct" ("product", "transaction", "quantity")
            VALUES(${m.product},${m.transaction},${m.quantity})`,
            update: `UPDATE "transactionProduct"
               SET "product" = ${m.product}, "transaction" = ${m.transaction},"quantity" = ${m.quantity}            
             WHERE id = ${m.id}`
        },
        buyProduct: {
            insert: `INSERT INTO "buyProduct" ("product", "buy", "quantity")
            VALUES(${m.product},${m.buy},${m.quantity})`,
            update: `UPDATE "buyProduct"
               SET "product" = ${m.product}, "buy" = ${m.buy},"quantity" = ${m.quantity}            
             WHERE id = ${m.id}`
        },
        user: {
            insert: `INSERT INTO "user" (name, username, password, role) 
            VALUES('${m.name ? m.name.replace(/\'/g, "''") : ''}', 
            '${m.username ? m.username.replace(/\'/g, "''") : ''}',
             '${m.password ? m.password.replace(/\'/g, "''") : ''}', 
             '${m.role}') RETURNING *`,
            update: `UPDATE "user"
               SET name = '${m.name ? m.name.replace(/\'/g, "''") : ''}',
                username = '${m.username ? m.username.replace(/\'/g, "''") : ''}',
                 password = '${m.password ? m.password.replace(/\'/g, "''") : ''}', 
                 role = '${m.role}'
             WHERE id = ${m.id} RETURNING *`
        }
    }
}

function writeLogsFile(text) {
    const path = path.join(electron.remote.app.getPath('userData'), 'logs.json');
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, text + (text ? '\n' : ''), undefined);
    } else {
        const data = fs.readFileSync(path); //read existing contents into data
        const fd = fs.openSync(path, 'w+');
        const buffer = new Buffer(text + (text ? '\n' : ''));
        fs.writeSync(fd, buffer, 0, buffer.length, 0); //write new data
        fs.writeSync(fd, data, 0, data.length, buffer.length); //append old data
    }
}


function executeOne(sql, res, next) {
    client.query(sql, (err, row) => {
        if (err) {
            next(err);
        } else {
            res.send(row.rows[0]);
        }
    });
}

function executeAll(sql, res, next) {
    client.query(sql, (err, row) => {
        if (err) {
            next(err);
        } else {
            res.send(row.rows);
        }
    });
}



