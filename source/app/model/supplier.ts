import { TheDb } from './thedb';

/**
 * class for selecting, inserting, updating and deleting Suppliers in supplier table.
 *
 * @export
 * @class Supplier
 */
export class Supplier{
    public id = -1;
    public name = '';
    public phone = '';
    public phone2 = '';
    public address = '';
    public photo: string = '';
    public blocked: boolean;
    public deleted: boolean;

    public static getCount(filter: string): Promise<Supplier[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "supplier" WHERE (name ILIKE '%${filter}%' OR 
                                        phone ILIKE '%${filter}%') AND deleted = false`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Supplier> {
        const sql = `SELECT * FROM "supplier" WHERE id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toSupplier(row);
                } else {
                    throw new Error('Expected to find 1 Supplier. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Supplier[]> {
        const sql = `SELECT * FROM "supplier" WHERE deleted = false`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const suppliers: Supplier[] = [];
                for (const row of rows) {
                    suppliers.push(this.toSupplier(row));
                }
                return suppliers;
            });
    }

    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Supplier[]> {
        const sql = `select i.*
                            from supplier as i 
                            WHERE (i.name ILIKE '%${filter}%' OR 
                            i.phone ILIKE '%${filter}%') AND i.deleted = false
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const suppliers: Supplier[] = [];
                for (const row of rows) {
                    suppliers.push(this.toSupplier(row));
                }
                return suppliers;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "supplier" (name, address, phone, phone2, "blocked", photo)
            VALUES('${this.name ? this.name.replace(/\'/g, "''") : ''}',
            '${this.address ? this.address.replace(/\'/g, "''"):''}', '${this.phone}', 
            '${this.phone2}', ${this.blocked}, '${this.photo}') RETURNING *`;

        return TheDb.insert(sql)
            .then((result: any) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Supplier to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.id;
                }
            });
    }


    public update(): Promise<void> {
        const sql = `
            UPDATE "supplier"
               SET name = '${this.name ? this.name.replace(/\'/g, "''"): ''}', 
               address = '${this.address ? this.address.replace(/\'/g, "''"): ''}', phone = '${this.phone}', 
                phone2 = '${this.phone2}', "blocked" = ${this.blocked}, 
                photo = '${this.photo}'  
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
        const sql = `SELECT * FROM "supplier" WHERE name ilike '${name}'`;

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
            DELETE FROM "supplier" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Supplier to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static safeDelete(id: number): Promise<void> {
        const sql = `UPDATE "supplier" SET deleted = true WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Client to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toSupplier = (o: any): Supplier => {
        const supplier: Supplier = new Supplier();
        for(let k in o) supplier[k]=o[k];
        return supplier;
    }
}
