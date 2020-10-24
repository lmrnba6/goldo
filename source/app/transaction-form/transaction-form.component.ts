import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Transaction} from "../model/transaction";
import './transaction-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Client} from "../model/client";
import {Product} from "../model/product";
import {AuthenticationService} from "../_services/authentication.service";
import {TransactionProduct} from "../model/transactionProduct";
import {DialogsService} from "../_services/dialogs.service";

@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction-form.component.html',
})
export class TransactionFormComponent implements OnInit {

    public transaction: Transaction = new Transaction();
    public block: boolean;
    public isOnEdit: boolean;
    public transactionForm: FormGroup;
    public date: FormControl;
    public amountIn: FormControl;
    public amountOut: FormControl;
    public goldIn: FormControl;
    public goldOut: FormControl;
    public amountDue: FormControl;
    public comment: FormControl;
    public client: FormControl;
    public products: Array<Product> = [];
    public productsSelected: Array<Product> = [];
    public productSelected: Product = new Product();
    public limitGold: number;
    public clientSelected: Client | any;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public clientsFiltered: Array<Client> = [];
    public clientManagement: boolean;
    public isAdmin: boolean;
    public amountDueCalculated = 0;
    public goldDueCalculated = 0;
    public amountImage = `${this.getPath()}dist/assets/images/amountImage.png`;
    public goldImage = `${this.getPath()}dist/assets/images/goldImage.png`;
    public noImage = `${this.getPath()}dist/assets/images/noImage.png`;
    public calculatorImage = `${this.getPath()}dist/assets/images/calculatorImage.png`;
    public chargeImage = `${this.getPath()}dist/assets/images/chargeImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public clientImage = `${this.getPath()}dist/assets/images/clientImage.png`;
    public buyImage = `${this.getPath()}dist/assets/images/buyImage.png`;

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

    public displayFnClient(client: Client) {
        return client ? client.name : '';
    }

    public copySuccess() {
        if(this.transaction.amountDue > 0){
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
        }
    }

    public clientOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Client.getAllPaged(0, 20, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.clientsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
            this.transactionForm.controls['client'].setErrors({required: true})
        }
    }

    onProductChange(p: Product){
        this.productSelected = p;
        this.productSelected.quantity = null;
    }

    public clientOnSelect(client: Client): void {
        this.clientSelected = client;
    }

    public calculateAmountTotal() {
        const amount = this.productsSelected.reduce((a,b) => Number(a) + Number(b.price * b.quantity), 0);;
       this.transaction.amountDue = amount;
       this.amountDueCalculated = amount;
       this.handleAmount();
    }

    public calculateGoldTotal() {
        const gold = this.productsSelected.reduce((a,b) => Number(a) + Number(b.quantity), 0);;
        this.goldDueCalculated = gold;
        this.transaction.goldOut = gold;
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
                this.getTransactionProducts(res.id)
                this.isOnEdit = true;
            } else if(res.client) {
                this.getClient(res.client);
                this.clientManagement = true;
                if(res.transaction){
                    this.isOnEdit = true;
                    this.getData(res.transaction);
                    this.getTransactionProducts(res.transaction)
                }else {
                    this.transaction = new Transaction();
                    this.transaction.date = new Date();
                }
            } else {
                this.isOnEdit = false;
                this.transaction = new Transaction();
                this.transaction.date = new Date();
            }
            this.initForm();
        });
    }

    getClient(id: number) {
        Client.get(id).then(client => {
            this.clientSelected = client;
            this.transactionForm.controls['client'].disable();
        })
    }


    /**
     * get data
     *
     * @param  {string} name transaction name
     * @returns void
     */
    public getData(id: number): void {
        this.block = true;
        Transaction
            .get(id)
            .then((val: Transaction) => {
                this.transaction = val;
                Client.get(this.transaction.client as number).then(client => {
                    this.block = false;
                    this.clientSelected = client;
                    this.getProducts();
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false;
                });
                this.transaction.date = new Date(Number(this.transaction.date));
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    getTransactionProducts(id) {
        this.block = true;
        Product.getAllByTransaction(id).then(s => {
            this.productsSelected = s;
            this.calculateGoldTotal();
            this.calculateAmountTotal();
            this.block = false;
        }, () => {
            this.transaction.date = new Date(this.transaction.date);
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
            this.transaction.date = new Date(this.transaction.date);
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    handleAmount() {
        this.transaction.totalAmount = Number((this.transaction.amountDue || 0)) - Number((this.transaction.amountIn || 0)) + Number((this.transaction.amountOut || 0));
    }

    handleGold() {
       this.transaction.totalGold = Number((this.goldDueCalculated || 0)) - Number((this.transaction.goldIn || 0));
    }


    public initForm(): void {
        this.amountIn = new FormControl(null, [Validators.required]);
        // this.amountOut = new FormControl(null, [Validators.required]);
        // this.amountDue = new FormControl(null, [Validators.required]);
        this.goldIn = new FormControl(null, [Validators.required]);
        // this.goldOut = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.client = new FormControl(null, [Validators.required]);

        this.transactionForm = this.fb.group({
            amountIn: this.amountIn,
            // amountOut: this.amountOut,
            // amountDue: this.amountDue,
            goldIn: this.goldIn,
            // goldOut: this.goldOut,
            date: this.date,
            comment: this.comment,
            client: this.client,
        });
        if(this.isOnEdit) {
            this.transactionForm.controls['client'].disable();
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
        this.transaction.date = (this.transaction.date as Date).getTime();
        this.transaction.client = this.clientSelected.id;
        this.transaction.responsible = this.auth.getCurrentUser().id;
        this.transaction.goldOut = this.goldDueCalculated;
        this.transaction.amountOut = this.transaction.amountOut || 0;
        this.transaction.amountDue = this.transaction.amountDue || 0;
        let clientPromise: Promise<any>;
        if (this.isOnEdit) {
            clientPromise = this.transaction.update();
        } else {
            clientPromise = this.transaction.insert();
        }
        this.block = true;
        clientPromise.then(
            () => {
                this.updateTransactionProducts();
                if(this.transaction.amountIn > 0 && !this.isOnEdit){
                    this.handleRegister();
                }
                this.goBack();
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.transaction.date = new Date(this.transaction.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    handleRegister() {
        this.dialogsService
            .confirm('register.title', 'messages.add_to_register_message', true, 'usd')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['register/form/type/+' + '/' + this.transaction.amountIn])
                }
            });
    }

    updateTransactionProducts() {
        const list: Array<Promise<any>> = [];
        list.push(TransactionProduct.deleteByTransaction(this.transaction.id))
        this.productsSelected.forEach(p => {
            const t = new TransactionProduct();
            t.product = p.id;
            t.transaction = this.transaction.id;
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
        this.router.navigate(this.clientManagement ? ['client-management/'+ this.clientSelected.id + '/' + 0] : ['/transaction']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
