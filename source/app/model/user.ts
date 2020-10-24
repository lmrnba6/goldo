import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Useres in user table.
 *
 * @export
 * @class User
 */
export class User {
    public id = -1;
    public name = '';
    public username = '';
    public password = '';
    public role = '';

    public static getCount(filter: string): Promise<User[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "user" u WHERE u.name ILIKE '%${filter}%' OR 
                                        u.username ILIKE '%${filter}%' OR u.role ILIKE '%${filter}%'`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<User> {
        const sql = `SELECT * FROM "user" u  WHERE u.id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toUser(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static verify(username: string, password: string): Promise<User> {
        const sql = `SELECT * FROM "user" u WHERE u.username = '${username}' AND u.password = '${password}'`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toUser(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getByUserName(userName: string): Promise<User> {
        const sql = `SELECT * FROM "user" u WHERE u.username = '${userName}'`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toUser(row);
                } else {
                    throw new Error('Expected to find 1 User. Found 0.');
                }
            });
    }

    public static getAll(): Promise<User[]> {
        const sql = `SELECT * FROM "user" ORDER BY name`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    users.push(this.toUser(row));
                }
                return users;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<User[]> {
        const sql = `SELECT * FROM "user" u WHERE u.name ILIKE '%${filter}%' OR 
                            u.username ILIKE '%${filter}%' OR
                            u.role ILIKE '%${filter}%' 
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: User[] = [];
                for (const row of rows) {
                    users.push(this.toUser(row));
                }
                return users;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "user" (name, username, password, role) 
            VALUES('${this.name ? this.name.replace(/\'/g, "''") : ''}', 
            '${this.username ? this.username.replace(/\'/g, "''") : ''}',
             '${this.password ? this.password.replace(/\'/g, "''") : ''}', 
             '${this.role}') RETURNING *`;

        return TheDb.insert(sql)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "user"
               SET name = '${this.name ? this.name.replace(/\'/g, "''") : ''}',
                username = '${this.username ? this.username.replace(/\'/g, "''") : ''}',
                 password = '${this.password ? this.password.replace(/\'/g, "''") : ''}', 
                 role = '${this.role}'
             WHERE id = ${this.id} RETURNING *`;

        return TheDb.update(sql)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }

    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "user" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be deleted. Was ${result.changes}`);
                }
            });
    }
    
    private static toUser = (o: any): User => {
        const user: User = new User();
        for(let k in o) user[k]=o[k];
        return user;
    }

}
