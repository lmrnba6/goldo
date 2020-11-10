import {TheDb} from './thedb';
import {Product} from "./product";

/**
 * class for selecting, inserting, updating and deleting buyProducts in buyProduct table.
 *
 * @export
 * @class Buy
 */
export class BuyProduct {
    public id = -1;
    public product: number | Product;
    public buy: number | BuyProduct;
    public quantity: number;
    public deleted: boolean;

    public static getAll(): Promise<BuyProduct[]> {
        const sql = `SELECT * FROM "buyProduct" as bp 
                        INNER JOIN "buy" as b on b.id = bp.buy
                        WHERE b.deleted = false`;

        return TheDb.selectAll(sql)
            .then((rows) => {
                const buyProducts: BuyProduct[] = [];
                for (const row of rows) {
                    buyProducts.push(this.toBuy(row));
                }
                return buyProducts;
            });
    }

    public insert(): Promise<void> {
        const sql = `
            INSERT INTO "buyProduct" ("product", "buy", "quantity")
            VALUES(${this.product},${this.buy},${this.quantity})`;

        return TheDb.insert(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Buy to be inserted. Was ${result.changes}`);
                } else {
                    this.id = result.lastID;
                }
            });
    }

    public update(): Promise<void> {
        const sql = `
            UPDATE "buyProduct"
               SET "product" = ${this.product}, "buy" = ${this.buy},"quantity" = ${this.quantity}            
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
            DELETE FROM "buyProduct" WHERE id = ${id}`;
        
        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Buy to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static deleteByBuy(id: number): Promise<void> {
        const sql = `
            DELETE FROM "buyProduct" WHERE buy = ${id}`;

        return TheDb.delete(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 Buy to be deleted. Was ${result.changes}`);
                }
            });
    }

    public static safeDelete(id: number): Promise<void> {
        const sql = `UPDATE "buyProduct" SET deleted = true  WHERE id = ${id}`;

        return TheDb.update(sql)
            .then((result) => {
                if (result.changes !== 1) {
                    throw new Error(`Expected 1 User to be deleted. Was ${result.changes}`);
                }
            });
    }

    private static toBuy = (o: any): BuyProduct => {
        const buyProduct: BuyProduct = new BuyProduct();
        for(let k in o) buyProduct[k]=o[k];
        return buyProduct;
    }

}
