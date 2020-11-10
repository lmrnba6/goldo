import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Employees in employee table.
 *
 * @export
 * @class Employee
 */
export class Employee{
    public id = -1;
    public name = '';
    public phone = '';
    public phone2 = '';
    public address = '';
    public photo: string = '';
    public blocked: boolean;
    public sold = 0
    public deleted: boolean;

    public static getCount(filter: string): Promise<Employee[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "employee" WHERE (name ILIKE '%${filter}%' OR 
                                        phone ILIKE '%${filter}%') AND deleted = false`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Employee> {
        const sql = `SELECT * FROM "employee" WHERE id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toEmployee(row);
                } else {
                    throw new Error('Expected to find 1 Employee. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Employee[]> {
        const sql = `SELECT * FROM "employee" WHERE deleted = false`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const employees: Employee[] = [];
                for (const row of rows) {
                    employees.push(this.toEmployee(row));
                }
                return employees;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Employee[]> {
        const sql = `select i.*
                            from employee as i 
                            WHERE (i.name ILIKE '%${filter}%' OR 
                            i.phone ILIKE '%${filter}%') AND i.deleted = false
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const employees: Employee[] = [];
                for (const row of rows) {
                    employees.push(this.toEmployee(row));
                }
                return employees;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "employee" (name, address, phone, phone2, "blocked", photo, sold)
            VALUES('${this.name ? this.name.replace(/\'/g, "''") : ''}',
           
            '${this.address ? this.address.replace(/\'/g, "''"):''}', '${this.phone}', 
            '${this.phone2}', ${this.blocked}, '${this.photo}', ${this.sold}) RETURNING *`;

        return TheDb.insert(sql)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Employee to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }


    public update(): Promise<void> {
        const sql = `
            UPDATE "employee"
               SET name = '${this.name ? this.name.replace(/\'/g, "''"): ''}', 
               address = '${this.address ? this.address.replace(/\'/g, "''"): ''}', phone = '${this.phone}', 
                phone2 = '${this.phone2}', "blocked" = ${this.blocked}, 
                photo = '${this.photo}',  
                sold = ${this.sold}
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

    public static nameExist(name: string) {
        const sql = `SELECT * FROM "employee" WHERE name ilike '${name}'`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    throw new Error('duplicated name');
                } else {
                    return null;
                }
            });
    }
    public static delete(id: number): Promise<void> {
        const sql = `
            DELETE FROM "employee" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Employee to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static safeDelete(id: number): Promise<void> {
        const sql = `UPDATE "employee" SET deleted = true WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Client to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toEmployee = (o: any): Employee => {
        const employee: Employee = new Employee();
        for(let k in o) employee[k]=o[k];
        return employee;
    }
}
