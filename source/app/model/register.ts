import {TheDb} from './thedb';
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting registers in register table.
 *
 * @export
 * @class Register
 */
export class Register {
    public id = -1;
    public amount: number;
    public date: Date| number;
    public comment = '';
    public responsible: number | User;
    public error = 0;
    public deleted: boolean;

    public static getCount(filter: string): Promise<Register[]> {
        const sql =
            `SELECT count(*) as count FROM "register" AS p 
                            WHERE  p.comment ILIKE '%${filter}%' AND p.deleted = false`;
        return TheDb.selectAll(sql)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Register> {
        const sql = `SELECT * FROM "register" WHERE id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toRegister(row);
                } else {
                    throw new Error('Expected to find 1 Register. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Register[]> {
        const sql = `SELECT p.*, u.name as responsible FROM "register" p
                            INNER JOIN "user" AS u ON p.responsible = u.id
                            WHERE p.deleted = false 
                            ORDER BY p.date DESC`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = this.toRegister(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, start: number, end: number): Promise<Register[]> {
        const sql =
            `SELECT p.id, p.amount, p.date, p.comment, u.name as responsible  
                            FROM "register" AS p 
                            INNER JOIN "user" AS u ON p.responsible = u.id 
                            WHERE                            
                            p.comment ILIKE '%${filter}%' AND p.deleted = false
                            and p.date between '${start}' and '${end}'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = this.toRegister(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public static getAllPagedRecipes(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, start: number, end: number): Promise<Register[]> {
        const sql =  `SELECT p.id, p.amount, p.date, p.comment, u.name as responsible 
                            FROM "register" AS p 
                            INNER JOIN "user" AS u ON p.responsible = u.id 
                            WHERE                            
                            p.comment ILIKE '%${filter}%' AND p.deleted = false
                            and p.date between '${start}' and '${end}' and p.amount > 0
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = this.toRegister(row);
                    registers.push(register);
                }
                return registers;
            });
    }

    public static getAllPagedExpenses(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, start: number, end: number): Promise<Register[]> {
        const sql =
            `SELECT p.id, p.amount, p.date, p.comment, u.name as responsible 
                            FROM "register" AS p 
                            INNER JOIN "user" AS u ON p.responsible = u.id 
                            WHERE                            
                            p.comment ILIKE '%${filter}%' AND p.deleted = false
                            and p.date between '${start}' and '${end}'  and p.amount < 0
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const registers: Register[] = [];
                for (const row of rows) {
                    const register = this.toRegister(row);
                    registers.push(register);
                }
                return registers;
            });
    }


    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "register" (amount, date, comment, responsible)
            VALUES(${this.amount}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''")
            : ''}', ${this.responsible})`;

        return TheDb.insert(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Register to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "register"
               SET amount = ${this.amount}, error = ${this.error}, date = '${this.date}', 
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', 
               responsible = ${this.responsible}
             WHERE id = ${this.id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Register to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "register" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Register to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static safeDelete(id: number): Promise<void> {
        const sql = `UPDATE "register" SET deleted = true  WHERE id = ${id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toRegister = (o: any): Register => {
        const register: Register = new Register();
        for(let k in o) register[k]=o[k];
        return register;
    }

}
