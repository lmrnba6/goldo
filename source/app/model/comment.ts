import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Comments in comment table.
 *
 * @export
 * @class Comment
 */
export class Comment {
    public id = -1;
    public comment = '';
    public date: Date| number;
    public client = null;
    public supplier = null;
    public employee = null;



    public static getCount(filter: string): Promise<Comment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "comment" WHERE comment ILIKE '%${filter}%'`)
            .then((count: any) => count);
    }

    public static getClientCount(filter: string, client: number): Promise<Comment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "comment" WHERE   
                            comment ILIKE '%${filter}%' AND client = ${client}`)
            .then((count: any) => count);
    }

    public static getSupplierCount(filter: string, supplier: number): Promise<Comment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "comment" WHERE   
                            comment ILIKE '%${filter}%' AND supplier = ${supplier}`)
            .then((count: any) => count);
    }

    public static getEmployeeCount(filter: string, employee: number): Promise<Comment[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "comment" WHERE   
                            comment ILIKE '%${filter}%' AND employee = ${employee}`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Comment> {
        const sql = `SELECT * FROM "comment" WHERE id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toComment(row);
                } else {
                    throw new Error('Expected to find 1 Comment. Found 0.');
                }
            });
    }


    public static getAll(): Promise<Comment[]> {
        const sql = `SELECT * FROM "comment"`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    users.push(this.toComment(row));
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Comment[]> {
        const sql = `SELECT c.* FROM "comment" c
                            WHERE c.comment ILIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    users.push(this.toComment(row));
                }
                return users;
            });
    }

    public static getAllClientPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, client: number): Promise<Comment[]> {
        const sql = `SELECT c.* FROM "comment" c
                            WHERE c.comment ILIKE '%${filter}%' AND
                            c.client = ${client}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    users.push(this.toComment(row));
                }
                return users;
            });
    }

    public static getAllSupplierPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, supplier: number): Promise<Comment[]> {
        const sql = `SELECT c.* FROM "comment" c
                            WHERE c.comment ILIKE '%${filter}%' AND
                            c.supplier = ${supplier}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    users.push(this.toComment(row));
                }
                return users;
            });
    }

    public static getAllEmployeePaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, employee: number): Promise<Comment[]> {
        const sql = `SELECT c.* FROM "comment" c
                            WHERE c.comment ILIKE '%${filter}%' AND
                            c.employee = ${employee}
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Comment[] = [];
                for (const row of rows) {
                    users.push(this.toComment(row));
                }
                return users;
            });
    }


    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "comment" (comment, date, client, supplier, employee)
            VALUES('${this.comment ? this.comment.replace(/\'/g, "''") : ''}', 
            '${this.date}', ${this.client}, ${this.supplier}, ${this.employee}) RETURNING *`;

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
            UPDATE "comment" SET
               comment = '${this.comment ? this.comment.replace(/\'/g, "''") : ''}'   
             WHERE id = ${this.id} RETURNING *`;

        return TheDb.update(sql)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Product to be updated. Was ${result.changes}`);
                }
                else {
                    this.id = result.id;
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "comment" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Comment to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toComment = (o: any): Comment => {
        const comment: Comment = new Comment();
        for(let k in o) comment[k]=o[k];
        return comment;
    }

}
