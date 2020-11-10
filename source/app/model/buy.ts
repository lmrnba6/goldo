import { TheDb } from './thedb';
import {Supplier} from "./supplier";
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting buys in buy table.
 *
 * @export
 * @class Buy
 */
export class Buy {
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
    public supplier: number | Supplier;
    public responsible: number | User;
    public deleted: boolean;


    public static getCount(filter: string): Promise<Buy[]> {
        const sql = 
            `SELECT count(*) as count FROM "buy" AS p 
                            INNER JOIN "supplier" AS i ON p.supplier = i.id 
                            INNER JOIN "user" AS u ON p.responsible = u.id
                            WHERE  i.name ILIKE '%${filter}%' AND p.deleted = false`;
        return TheDb.selectAll(sql)
            .then((count: any) => count);
    }

    public static getCountBySupplier(supplier: number): Promise<Buy[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "buy" AS p 
                                    INNER JOIN "supplier" AS i ON p.supplier = i.id 
                                    INNER JOIN "user" AS u ON p.responsible = u.id
                            WHERE i.id = ${supplier} AND p.deleted = false`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Buy> {
        const sql = `SELECT t.*, u,username, u.name, s.name as supplier_name
         FROM "buy" AS t 
         INNER JOIN "user" AS u ON t.responsible = u.id
         INNER JOIN "supplier" AS s ON t.supplier = s.id
         WHERE t.id = ${id}`;
        
        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return (this.toBuy(row));
                } else {
                    throw new Error('Expected to find 1 Buy. Found 0.');
                }
            });
    }
    
    public static getAll(): Promise<Buy[]> {
        const sql = `SELECT * FROM "buy" WHERE deleted = false ORDER BY date DESC`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const buys: Buy[] = [];
                for (const row of rows) {
                    buys.push(this.toBuy(row));
                }
                return buys;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Buy[]> {
        const sql = 
            `SELECT t.*, c.name as supplier, u.username, u.name as responsible
                            FROM "buy" AS t
                            INNER JOIN "supplier" AS c ON t.supplier = c.id
                            INNER JOIN "user" AS u ON t.responsible = u.id
                            WHERE  
                            c.name ILIKE '%${filter}%' AND t.deleted = false
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const buys: Buy[] = [];
                for (const row of rows) {
                    buys.push(this.toBuy(row));
                }
                return buys;
            });
    }

    public static getAllPagedBySupplier(pageIndex: number, pageSize: number, sort: string, order: string, supplier: number): Promise<Buy[]> {
        const sql = `SELECT t.*, u.username, u.name as responsible
                            FROM "buy" AS t 
                            INNER JOIN "supplier" AS c ON t.supplier = c.id
                            INNER JOIN "user" AS u ON t.responsible = u.id
                            WHERE c.id = ${supplier} AND t.deleted = false
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;
        
        return TheDb.selectAll(sql)
            .then((rows) => {
                const buys: Buy[] = [];
                for (const row of rows) {
                    buys.push(this.toBuy(row));
                }
                return buys;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "buy" ("amountIn", "amountOut", "goldIn", "goldOut", "amountDue", "totalAmount", "totalGold", date, comment,type, supplier, responsible)
            VALUES(${this.amountIn},${this.amountOut},${this.goldIn}, ${this.goldOut},${this.amountDue},
            ${this.totalAmount},${this.totalGold}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''") : ''}','${this.type}',
            ${this.supplier}, ${this.responsible}) RETURNING *`;

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
            UPDATE "buy"
               SET "amountIn" = ${this.amountIn}, "amountOut" = ${this.amountOut},"goldIn" = ${this.goldIn},
               "goldOut" = ${this.goldOut},"amountDue" = ${this.amountDue},"totalAmount" = ${this.totalAmount},
               "totalGold" = ${this.totalGold}, date = '${this.date}', type='${this.type}',
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'
               , supplier = ${this.supplier}, responsible = ${this.responsible}
             WHERE id = ${this.id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Buy to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "buy" WHERE id = ${id}`;
        
        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Buy to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static safeDelete(id: number): Promise<void> {
        const sql = `UPDATE "buy" SET deleted = true  WHERE id = ${id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toBuy = (o: any): Buy => {
        const buy: Buy = new Buy();
        for(let k in o) buy[k]=o[k];
        return buy;
    }

}
