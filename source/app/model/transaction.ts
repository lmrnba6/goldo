import { TheDb } from './thedb';
import {Client} from "./client";
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting transactions in transaction table.
 *
 * @export
 * @class Transaction
 */
export class Transaction {
    public id = -1;
    public amountIn: number;
    public goldIn: number;
    public amountOut: number;
    public goldOut: number;
    public amountDue: number;
    public totalAmount: number = 0;
    public totalGold: number = 0;
    public date: Date| number;
    public comment = '';
    public type = '';
    public client: number | Client;
    public responsible: number | User;


    public static getCount(filter: string): Promise<Transaction[]> {
        const sql = 
            `SELECT count(*) as count FROM "transaction" AS p 
                            INNER JOIN "client" AS i ON p.client = i.id 
                            INNER JOIN "user" AS u ON p.responsible = u.id
                            WHERE  i.name ILIKE '%${filter}%' `;
        return TheDb.selectAll(sql)
            .then((count: any) => count);
    }

    public static getCountByClient(client: number): Promise<Transaction[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "transaction" AS p 
                                    INNER JOIN "client" AS i ON p.client = i.id 
                                    INNER JOIN "user" AS u ON p.responsible = u.id
                            WHERE i.id = ${client}`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Transaction> {
        const sql = `SELECT t.*, u,username, u.name
         FROM "transaction" AS t 
         INNER JOIN "user" AS u ON t.responsible = u.id
         WHERE t.id = ${id}`;
        
        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return (this.toTransaction(row));
                } else {
                    throw new Error('Expected to find 1 Transaction. Found 0.');
                }
            });
    }
    
    public static getAll(): Promise<Transaction[]> {
        const sql = `SELECT * FROM "transaction" ORDER BY date DESC`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const transactions: Transaction[] = [];
                for (const row of rows) {
                    transactions.push(this.toTransaction(row));
                }
                return transactions;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Transaction[]> {
        const sql = 
            `SELECT t.*, c.name as client, u.username, u.name as responsible
                            FROM "transaction" AS t
                            INNER JOIN "client" AS c ON t.client = c.id
                            INNER JOIN "user" AS u ON t.responsible = u.id
                            WHERE  
                            c.name ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const transactions: Transaction[] = [];
                for (const row of rows) {
                    transactions.push(this.toTransaction(row));
                }
                return transactions;
            });
    }

    public static getAllPagedByClient(pageIndex: number, pageSize: number, sort: string, order: string, client: number): Promise<Transaction[]> {
        const sql = `SELECT t.*, u.username, u.name as responsible
                            FROM "transaction" AS t 
                            INNER JOIN "client" AS c ON t.client = c.id
                            INNER JOIN "user" AS u ON t.responsible = u.id
                            WHERE c.id = ${client}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        
        return TheDb.selectAll(sql)
            .then((rows) => {
                const transactions: Transaction[] = [];
                for (const row of rows) {
                    transactions.push(this.toTransaction(row));
                }
                return transactions;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "transaction" ("amountIn", "amountOut", "goldIn", "goldOut", "amountDue", "totalAmount", "totalGold", date, comment,type, client, responsible)
            VALUES(${this.amountIn},${this.amountOut},${this.goldIn}, ${this.goldOut},${this.amountDue},
            ${this.totalAmount},${this.totalGold}, '${this.date}','${this.type}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}',
            ${this.client}, ${this.responsible}) RETURNING *`;

        return TheDb.insert(sql)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Product to be updated. Was ${result.changes}`);
                }
                else {
                    this.id = result.id;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "transaction"
               SET "amountIn" = ${this.amountIn}, "amountOut" = ${this.amountOut},"goldIn" = ${this.goldIn},
               "goldOut" = ${this.goldOut},"amountDue" = ${this.amountDue},"totalAmount" = ${this.totalAmount},
               "totalGold" = ${this.totalGold}, date = '${this.date}', type='${this.type}',
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'
               , client = ${this.client}, responsible = ${this.responsible}
             WHERE id = ${this.id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transaction to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "transaction" WHERE id = ${id}`;
        
        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Transaction to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toTransaction = (o: any): Transaction => {
        const transaction: Transaction = new Transaction();
        for(let k in o) transaction[k]=o[k];
        return transaction;
    }

}
