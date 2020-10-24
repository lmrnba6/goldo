import {Settings} from './settings';

export interface IDbResult {
    changes: number;
    lastID: number;
}

/**
 * TheDb is a Promise-ified wrapper around bare sqlite3 API.
 *
 * @export
 * @class TheDb
 */
export class TheDb {

    public static selectOne(sql: string): Promise<{}> {
        return Settings.queryServerOne(sql);
    }

    public static selectAll(sql: string): Promise<Array<{}>> {
        return Settings.queryServerAll(sql);
    }

    public static insert(sql: string): Promise<IDbResult> {
        return Settings.queryServerChange(sql);
    }

    public static update(sql: string): Promise<IDbResult> {
        return Settings.queryServerChange(sql);
    }

    public static delete(sql: string): Promise<IDbResult> {
        return Settings.queryServerChange(sql);
    }

    public static query(sql: string): Promise<void> {
        return Settings.queryServerAll(sql);
    }

}
