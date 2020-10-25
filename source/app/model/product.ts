import {TheDb} from './thedb';

/**
 * class for selecting, inserting, updating and deleting Products in product table.
 *
 * @export
 * @class Product
 */
export class Product {
    public id = -1;
    public name = '';
    public description = '';
    public price;
    public quantity;
    public category = '';
    public photo = ''

    public static getCount(filter: string): Promise<Product[]> {
        return TheDb.selectAll(`SELECT count(*) as count FROM "product" WHERE name ILIKE '%${filter}%'`)
            .then((count: any) => count);
    }

    public static get(id: number): Promise<Product> {
        const sql = `SELECT * FROM "product" WHERE id = ${id}`;

        return TheDb.selectOne(sql)
            .then((row) => {
                if (row) {
                    return this.toProduct(row);
                } else {
                    throw new Error('Expected to find 1 Product. Found 0.');
                }
            });
    }

    public static getAll(): Promise<Product[]> {
        const sql = `SELECT * FROM "product" ORDER BY name`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Product[] = [];
                for (const row of rows) {
                    users.push(this.toProduct(row));
                }
                return users;
            });
    }

    public static getAllByTransaction(id: number): Promise<Product[]> {
        const sql = `SELECT p.id, p.name, t.quantity, p.description, p.price, p.category,p.photo
         FROM "product" AS p
         INNER JOIN "transactionProduct" AS t on t.product = p.id
         WHERE t.transaction = ${id}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Product[] = [];
                for (const row of rows) {
                    users.push(this.toProduct(row));
                }
                return users;
            });
    }

    public static getAllByBuy(id: number): Promise<Product[]> {
        const sql = `SELECT p.id, p.name, t.quantity, p.description, p.price, p.category,p.photo
         FROM "product" AS p
         INNER JOIN "buyProduct" AS t on t.product = p.id
         WHERE t.buy = ${id}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const users: Product[] = [];
                for (const row of rows) {
                    users.push(this.toProduct(row));
                }
                return users;
            });
    }


    public static getAllPaged(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): Promise<Product[]> {
        const sql = `SELECT * FROM "product" WHERE name ILIKE '%${filter}%'
                            ORDER BY ${sort} ${order} LIMIT ${pageSize} OFFSET ${pageIndex}`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const products: Product[] = [];
                for (const row of rows) {
                    products.push(this.toProduct(row));
                }
                return products;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "product" (name, description,category, price, quantity, photo)
            VALUES('${this.name}', '${this.description ? this.description.replace(/\'/g, "''") : ''}',
            '${this.category ? this.category.replace(/\'/g, "''") : ''}', 
            ${this.price}, ${this.quantity}, '${this.photo}') RETURNING *`;

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
            UPDATE "product"
               SET name = '${this.name}', description = '${this.description ? this.description.replace(/\'/g, "''") : ''}', 
               category = '${this.category ? this.category.replace(/\'/g, "''") : ''}', 
               price = ${this.price}, quantity = ${this.quantity}, photo = '${this.photo}' WHERE id = ${this.id} RETURNING *`;

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
            DELETE FROM "product" WHERE id = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Product to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toProduct = (o: any): Product => {
        const product: Product = new Product();
        for(let k in o) product[k]=o[k];
        return product;
    }

}
