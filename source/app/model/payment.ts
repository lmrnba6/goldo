import { TheDb } from './thedb';
import {Employee} from "./employee";
import {User} from "./user";

/**
 * class for selecting, inserting, updating and deleting payments in payment table.
 *
 * @export
 * @class Payment
 */
export class Payment {
    public id = -1;
    public amount: number;
    public date: Date| number;
    public comment = '';
    public employee: number | Employee;
    public responsible: number | User;
    public error = 0;

    public static getCount(filter: string): Promise<Payment[]> {
        const sql =
            `SELECT count(*) as count FROM "payment" AS p 
                            INNER JOIN "employee" AS i ON p.employee = i.id 
                            WHERE  i.name ILIKE '%${filter}%' `;
        return TheDb.selectAll(sql)
            .then((count: any) => count);
    }

    public static getCountByEmployee(employee: number): Promise<Payment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "payment" AS p INNER JOIN "employee" AS i ON p.employee = i.id 
                            WHERE i.id = ${employee}`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Payment> {
        const sql = `SELECT * FROM "payment" WHERE id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toPayment(row);
                } else {
                    throw new Error('Expected to find 1 Payment. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Payment[]> {
        const sql = `SELECT p.*, s.name as session_name FROM "payment" p
                            INNER JOIN "employee" AS e ON p.employee = e.id 
                            INNER JOIN "user" AS u ON p.responsible = u.id 
                            ORDER BY p.date DESC`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = this.toPayment(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, employee: number): Promise<Payment[]> {
        const sql =
            `SELECT p.*, u.name as responsible 
                            FROM "payment" AS p 
                            INNER JOIN "employee" AS e ON p.employee = e.id 
                            INNER JOIN "user" AS u ON p.responsible = u.id 
                            WHERE  
                            e.id = ${employee}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const payments: Payment[] = [];
                for (const row of rows) {
                    const payment = this.toPayment(row);
                    payments.push(payment);
                }
                return payments;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "payment" (amount, date, comment, employee, responsible)
            VALUES(${this.amount}, '${this.date}', '${this.comment ? this.comment.replace(/\'/g, "''")
            : ''}', ${this.employee}, ${this.responsible})`;

        return TheDb.insert(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "payment"
               SET amount = ${this.amount}, error = ${this.error}, date = '${this.date}', 
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}', 
               employee = ${this.employee}, responsible = ${this.responsible}
             WHERE id = ${this.id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be updated. Was ${result.changes}`);
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "payment" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Payment to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toPayment = (o: any): Payment => {
        const payment: Payment = new Payment();
        for(let k in o) payment[k]=o[k];
        return payment;
    }

}
