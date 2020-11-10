import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Product} from "../model/product";
import './product-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {OpenDialogOptions, remote} from "electron";
import * as fs from "fs";
import * as path from "path";
import {Settings} from "../model/settings";

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {

    public product: Product;
    public block: boolean;
    public isOnEdit: boolean;
    public productForm: FormGroup;
    public name: FormControl;
    public description: FormControl;
    public price: FormControl;
    // public category: FormControl;
    public quantity: FormControl;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    types = ['ring','chain']
    photo: string = '';
    noImage: string;


    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
        this.noImage = `${this.getPath()}dist/assets/images/noImage.png`;
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.product = new Product();
            }
        });
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
     * get data
     *
     * @param  {string} name product name
     * @returns void
     */
    public getData(id: number): void {
        Product
            .get(id)
            .then((val: Product) => {
                this.product = val;
                this.photo = this.product.photo;
                this.productForm.controls['price'].disable();
            });
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        // this.category = new FormControl(null, [Validators.required]);
        this.price = new FormControl(null, [Validators.required]);
        this.description = new FormControl(null);
        this.quantity = new FormControl(0, []);

        this.productForm = this.fb.group({
            name: this.name,
            // category: this.category,
            price: this.price,
            description: this.description,
            quantity: this.quantity,
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
        let productPromise: Promise<any>;
        if (this.isOnEdit) {
            productPromise = this.product.update();
        } else {
            productPromise = this.product.insert();
        }
        this.block = true;
        productPromise.then(
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

    goBack() {
        this.router.navigate(['product']);
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
                This.product.photo = path.join(Settings.imgFolder, name);
                This.photo = This.product.photo;
                (document.getElementById('productName') as HTMLElement).focus();
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
