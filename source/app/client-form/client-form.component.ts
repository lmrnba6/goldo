import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {Client} from "../model/client";
import './client-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationService} from "../_services/authentication.service";
import * as JsBarcode from "jsbarcode";
import {User} from "../model/user";
import {OpenDialogOptions, remote} from "electron";
import {Settings} from "../model/settings";
const WebCamera = require("webcamjs");
import * as fs from "fs";
import * as path from "path";
@Component({
    selector: 'app-client-form',
    templateUrl: './client-form.component.html',
})
export class ClientFormComponent implements OnInit, OnChanges, OnDestroy {

    @Input() public client: Client;
    @Output() public next: EventEmitter<any> = new EventEmitter()
    public block: boolean;
    public isOnEdit: boolean;
    public clientForm: FormGroup;
    public name: FormControl;
    public phone: FormControl;
    public phone2: FormControl;
    public address: FormControl;
    public isAdmin: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;
    public dist: string;
    public saveCamera: boolean;
    public users: Array<User> = [];
    public user: User;
    public noImage;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService,
                private authService: AuthenticationService) {
    }

    public ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.isAdmin = this.user.role === 'admin';
        this.initForm();
        this.getParams();
        this.noImage = `${this.getPath()}dist/assets/images/noImage.png`;
        //this.readFile(__dirname + '/assets/images/profile.png')
    }

    public ngOnChanges() {
        this.initForm();
        this.getParams();
    }

    public ngOnDestroy() {
        WebCamera.reset();
        this.saveCamera = false;
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    /**
     * getParams
     */
    public getParams(): void {
        if (this.client) {
            this.getData(this.client.id);
            this.isOnEdit = true;
        } else {
            this.isOnEdit = false;
            this.client = new Client();
            this.client.blocked = false;
        }
    }

    /**
     * get data
     *
     * @param  {string} name client name
     * @returns void
     */
    public getData(id: number): void {
        Client
            .get(id)
            .then((val: Client) => {
                this.client = val;
                //this.photo = 'data:image/png;base64,' + this.client.photo;
                this.photo = this.client.photo;
                JsBarcode("#barcode", this.client.id.toString().padStart(10, '0'));
            });
    }

    phoneParse() {
        this.client.phone = this.client.phone.toString().slice(0, 9)
        this.client.phone2 = this.client.phone2.toString().slice(0, 9)
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.address = new FormControl(null);
        this.phone = new FormControl(null);
        this.phone2 = new FormControl(null);

        this.clientForm = this.fb.group({
            name: this.name,
            address: this.address,
            phone: this.phone,
            phone2: this.phone2,
        });
    }

    /**
     * onSave
     */
    public onSave(): void {
        this.onSaveOrUpdate();
    }

    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        let clientPromise: Promise<any>;
        if (this.isOnEdit) {
            clientPromise = this.client.update();
        } else {
            clientPromise = this.client.insert();
        }
        this.block = true;
    clientPromise.then(
        () => {
            this.block = false;
            this.goBack();
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
        },
        () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });

    }

    handleName(name: string) {
        if(!this.isOnEdit){
            Client.nameExist(name).catch(() => {
                this.client.name = '';
                this.messagesService.notifyMessage(this.translate.instant('messages.name_exist'), '', 'error');
            });
        }
    }

    goBack() {
        this.router.navigate(['client']);
    }

    openFile() {
        const options: OpenDialogOptions = {};
        const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);
        files && this.readFile(files[0]);
    }

    private readFile(file: string) {
        const This = this;
        fs.readFile(file, function (err, data) {
            if (err) {
                return console.error(err);
            }

            /**
             * this is the old way to save photo on db
             */
            //This.intern.photo = data.toString('base64');
            //This.getPhoto(data);

            /**
             * this the new way to save photo on disk
             */
            const name = new Date().getTime().toString() + '.png';
            fs.writeFile(path.join(Settings.imgFolder, name), data, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
                This.client.photo = path.join(Settings.imgFolder, name);
                This.photo = This.client.photo;
                (document.getElementById('clientName') as HTMLElement).focus();
            });
        });
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
