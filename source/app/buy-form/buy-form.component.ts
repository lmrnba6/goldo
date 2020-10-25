import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Buy} from "../model/buy";
import './buy-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Supplier} from "../model/supplier";
import {Product} from "../model/product";
import {AuthenticationService} from "../_services/authentication.service";
import {BuyProduct} from "../model/buyProduct";
import {DialogsService} from "../_services/dialogs.service";

@Component({
    selector: 'app-buy-form',
    templateUrl: './buy-form.component.html',
})
export class BuyFormComponent implements OnInit {

    public buy: Buy = new Buy();
    public block: boolean;
    public isOnEdit: boolean;
    public buyForm: FormGroup;
    public date: FormControl;
    public amountIn: FormControl;
    public amountOut: FormControl;
    public goldIn: FormControl;
    public goldOut: FormControl;
    public amountDue: FormControl;
    public comment: FormControl;
    public supplier: FormControl;
    public products: Array<Product> = [];
    public productsSelected: Array<Product> = [];
    public productSelected: Product = new Product();
    public limitGold: number;
    public supplierSelected: Supplier | any;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public suppliersFiltered: Array<Supplier> = [];
    public supplierManagement: boolean;
    public isAdmin: boolean;
    public amountDueCalculated = 0;
    public goldDueCalculated = 0;
    public amountImage = `${this.getPath()}dist/assets/images/amountImage.png`;
    public goldImage = `${this.getPath()}dist/assets/images/goldImage.png`;
    public noImage = `${this.getPath()}dist/assets/images/noImage.png`;
    public calculatorImage = `${this.getPath()}dist/assets/images/calculatorImage.png`;
    public chargeImage = `${this.getPath()}dist/assets/images/chargeImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public supplierImage = `${this.getPath()}dist/assets/images/supplierImage.png`;
    public transactionInImage = `${this.getPath()}dist/assets/images/transactionInImage.png`;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private auth: AuthenticationService,
                private dialogsService: DialogsService
    ) {
    }

    public ngOnInit(): void {
        this.isAdmin = this.auth.getCurrentUser().role === 'admin';
        this.getParams();
        this.getProducts();
    }

    public toAbs(amount) {
        return Math.abs(amount);
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

    public displayFnSupplier(supplier: Supplier) {
        return supplier ? supplier.name : '';
    }

    public copySuccess() {
        if(this.buy.amountDue > 0){
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
        }
    }

    public supplierOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Supplier.getAllPaged(0, 20, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.suppliersFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
            this.buyForm.controls['supplier'].setErrors({required: true})
        }
    }

    onProductChange(p: Product){
        this.productSelected = p;
        this.productSelected.quantity = null;
    }

    public supplierOnSelect(supplier: Supplier): void {
        this.supplierSelected = supplier;
    }

    public calculateAmountTotal() {
        const amount = this.productsSelected.reduce((a,b) => Number(a) + Number(b.price * b.quantity), 0);;
       this.buy.amountDue = amount;
       this.amountDueCalculated = amount;
       this.handleAmount();
    }

    public calculateGoldTotal() {
        const gold = this.productsSelected.reduce((a,b) => Number(a) + Number(b.quantity), 0);;
        this.goldDueCalculated = gold;
        this.buy.goldIn = gold;
        this.handleGold();
    }

    public addProduct() {
        if(this.productSelected && this.productSelected.quantity > 0 && this.productSelected.id > 0 ) {
            const p: Product = JSON.parse(JSON.stringify(this.productSelected));
            this.productsSelected = [...this.productsSelected, p];
            this.productSelected = new Product();
            this.calculateAmountTotal();
            this.calculateGoldTotal();
        }
    }

    public deleteProduct(i: Product) {
        const index = this.productsSelected.indexOf(i);
        if (index >= 0) {
            this.productsSelected.splice(index, 1);
        }
        this.calculateAmountTotal();
        this.calculateGoldTotal();
    }


    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.getBuyProducts(res.id)
                this.isOnEdit = true;
            } else if(res.supplier) {
                this.getSupplier(res.supplier);
                this.supplierManagement = true;
                if(res.buy){
                    this.isOnEdit = true;
                    this.getData(res.buy);
                    this.getBuyProducts(res.buy)
                }else {
                    this.buy = new Buy();
                    this.buy.date = new Date();
                }
            } else {
                this.isOnEdit = false;
                this.buy = new Buy();
                this.buy.date = new Date();
            }
            this.initForm();
        });
    }

    getSupplier(id: number) {
        Supplier.get(id).then(supplier => {
            this.supplierSelected = supplier;
            this.buyForm.controls['supplier'].disable();
        })
    }


    /**
     * get data
     *
     * @param  {string} name buy name
     * @returns void
     */
    public getData(id: number): void {
        this.block = true;
        Buy
            .get(id)
            .then((val: Buy) => {
                this.buy = val;
                Supplier.get(this.buy.supplier as number).then(supplier => {
                    this.block = false;
                    this.supplierSelected = supplier;
                    this.getProducts();
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false;
                });
                this.buy.date = new Date(Number(this.buy.date));
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    getBuyProducts(id) {
        this.block = true;
        Product.getAllByBuy(id).then(s => {
            this.productsSelected = s;
            this.calculateGoldTotal();
            this.calculateAmountTotal();
            this.block = false;
        }, () => {
            this.buy.date = new Date(this.buy.date);
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    getProducts() {
        this.block = true;
        Product.getAll().then(s => {
            this.products = s;
            this.block = false;
        }, () => {
            this.buy.date = new Date(this.buy.date);
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    handleAmount() {
        this.buy.totalAmount = Number((this.buy.amountDue || 0)) - Number((this.buy.amountOut || 0)) + Number((this.buy.amountIn || 0));
    }

    handleGold() {
       this.buy.totalGold = Number((this.goldDueCalculated || 0)) - Number((this.buy.goldOut || 0));
    }


    public initForm(): void {
        // this.amountIn = new FormControl(null, [Validators.required]);
        this.amountOut = new FormControl(null, [Validators.required]);
        // this.amountDue = new FormControl(null, [Validators.required]);
        // this.goldIn = new FormControl(null, [Validators.required]);
        this.goldOut = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.supplier = new FormControl(null, [Validators.required]);

        this.buyForm = this.fb.group({
            // amountIn: this.amountIn,
            amountOut: this.amountOut,
            // amountDue: this.amountDue,
            //goldIn: this.goldIn,
            goldOut: this.goldOut,
            date: this.date,
            comment: this.comment,
            supplier: this.supplier,
        });
        if(this.isOnEdit) {
            this.buyForm.controls['supplier'].disable();
        }
    }

    /**
     * onSave
     */
    public async onSave(): Promise<void> {
        await this.onSaveOrUpdate();
    }

    /**
     * onSave
     */
    public async onSaveOrUpdate(): Promise<void> {
        this.buy.date = (this.buy.date as Date).getTime();
        this.buy.supplier = this.supplierSelected.id;
        this.buy.responsible = this.auth.getCurrentUser().id;
        this.buy.goldIn = this.goldDueCalculated;
        this.buy.amountIn = this.buy.amountOut || 0;
        this.buy.amountDue = this.buy.amountDue || 0;
        let supplierPromise: Promise<any>;
        if (this.isOnEdit) {
            supplierPromise = this.buy.update();
        } else {
            supplierPromise = this.buy.insert();
        }
        this.block = true;
        supplierPromise.then(
            () => {
                this.updateBuyProducts();
                if(this.buy.amountIn > 0 && !this.isOnEdit){
                    this.handleRegister();
                }
                this.goBack();
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.buy.date = new Date(this.buy.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    handleRegister() {
        this.dialogsService
            .confirm('register.title', 'messages.add_to_register_message', true, 'usd')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['register/form/type/-' + '/' + this.buy.amountIn])
                }
            });
    }

    updateBuyProducts() {
        const list: Array<Promise<any>> = [];
        list.push(BuyProduct.deleteByBuy(this.buy.id))
        this.productsSelected.forEach(p => {
            const t = new BuyProduct();
            t.product = p.id;
            t.buy = this.buy.id;
            t.quantity = p.quantity;
            list.push(t.insert())
        });
        this.block = true;
        Promise.all(list).then(() => {
            this.block = false;
        }, () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        })

    }

    goBack() {
        this.router.navigate(this.supplierManagement ? ['supplier-management/'+ this.supplierSelected.id + '/' + 0] : ['/buy']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
