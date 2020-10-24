import {existsSync, readFileSync, writeFileSync} from 'fs';
import * as path from 'path';


// tslint:disable-next-line:no-implicit-dependencies
import {OpenDialogOptions, remote} from 'electron';
import {Client} from "pg";
import * as fs from "fs";
import moment = require("moment");

/**
 * Class Settings holds information required by the application.
 * Settings uses settings.json to persist relevant information across products.
 *
 * @export
 * @class Settings
 */
export class Settings {
    public static client: Client;
    public static serialNumber: string = '';
    public static db: {
        user: string,
        host: string,
        database: string,
        password: string,
        port: number
    } = {
        user: 'postgres',
        host: '127.0.0.1',
        database: 'postgres',
        password: 'admin',
        port: 5432
    }

    public static imgFolder = '';

    /** Folder where data files are located */
    public static dbFolder: string;
    /** Path to database file used by application*/
    /** Default name of folder containing data files. */
    private static dataSubFolder = 'dist/assets/data';
    /** Location of settings.json file */
    private static settingsPath: string;
    public static logsPath: string;

    /**
     * Settings.initialize must be called a startup of application and determines the locations of database
     *
     * @static
     * @memberof Settings
     */
    public static initialize(): void {
        Settings.getPaths();
        if (!existsSync(Settings.settingsPath)) {
            Settings.write();
        }
        if (!existsSync(Settings.logsPath)) {
            Settings.writeLogsFile();
        }
        Settings.read();
        Settings.verify();
        Settings.client = new Client(Settings.db);
        Settings.client.connect();
    }

    public static queryServerAll(sql: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client: Client = Settings.client;
            client.query(sql, (err, row) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> ' + sql +  ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve(row.rows);
                }
            });
        });
    }

    public static queryServerChange(sql: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client: Client = Settings.client;
            client.query(sql, (err,res: any) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> ' + sql +  ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve({changes: 1, id: res.rows && res.rows[0] ? res.rows[0].id : null});
                }
            });
        });
    }

    public static queryServerOne(sql: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client: Client = Settings.client;
            client.query(sql, (err, row) => {
                if (err) {
                    this.writeLogsFile(moment().format('DD-MM-YYYY-HH:mm:ss') + ': Trying --> ' + sql +  ' Received --> ' + err);
                    reject(err);
                } else {
                    resolve(row.rows[0]);
                }
            });
        });
    }

    public static read(): void {
        const settings = JSON.parse(readFileSync(Settings.settingsPath, {encoding: 'utf8'}));
        Settings.fromJson(settings);
    }

    public static writeLogsFile(text: string = ''): void {
        if(!fs.existsSync(Settings.logsPath)) {
            writeFileSync(Settings.logsPath,text + (text ? '\n' : ''), undefined);
        } else {
            const data = fs.readFileSync(Settings.logsPath); //read existing contents into data
            const fd = fs.openSync(Settings.logsPath, 'w+');
            const buffer = new Buffer(text + (text ? '\n' : ''));

            fs.writeSync(fd, buffer, 0, buffer.length, 0); //write new data
            fs.writeSync(fd, data, 0, data.length, buffer.length); //append old data
        }
    }


    public static write(): void {
        writeFileSync(Settings.settingsPath,
            JSON.stringify({
                db: Settings.db,
                serialNumber: Settings.serialNumber
            }, undefined, 4));
    }

    public static verify() {
        if(Settings.serialNumber !== 'ok') {
            const options: OpenDialogOptions = {};
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);
            if (!files) {
                window.close();
            }
            files && fs.readFile(files[0], function (err, data) {
                if (err) {
                    window.close();
                }
                if (data.toString() === '1861986') {
                    Settings.serialNumber = 'ok'
                    Settings.write();
                    Settings.writeLogsFile();
                } else {
                    window.close();
                }
            });
        } else {
            Settings.read();
        }
    }

    private static getPaths() {
        const appPath = remote.app.getAppPath();
        Settings.settingsPath = path.join(remote.app.getPath('userData'), 'settings.json');
        Settings.logsPath = path.join(remote.app.getPath('userData'), 'logs.json');
        Settings.imgFolder = path.join(remote.app.getPath('userData'), 'img');
        fs.existsSync(Settings.imgFolder) || fs.mkdirSync(Settings.imgFolder);
        const isDevMode = /electron/.test(path.basename(remote.app.getPath('exe'), '.exe'));
        if (isDevMode) {
            Settings.dbFolder = path.join(appPath, Settings.dataSubFolder);
        } else {
            // remote.process.resoursesPath yields undefined
            Settings.dbFolder = path.join(remote.getGlobal('process').resourcesPath, Settings.dataSubFolder);
        }
    }

    private static fromJson(settings: object) {
        Settings.serialNumber = settings['serialNumber'];
        Settings.db = settings['db'];
    }
}
