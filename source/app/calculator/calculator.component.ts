import {Component, OnInit} from '@angular/core';
import './calculator.component.scss';
import {Product} from "../model/product";
import {Transaction} from "../model/transaction";
import {MessagesService} from "../_services/messages.service";
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html'
})
export class CalculatorComponent implements OnInit {

  public block: boolean;
  public products: Array<Product> = [];
  public productsSelected: Array<Product> = [];
  public productSelected: Product = new Product();
  public productsFiltered: Array<Product> = [];
  public transaction: Transaction;
  public noImage = `${this.getPath()}dist/assets/images/noImage.png`;
  public calculatorImage = `${this.getPath()}dist/assets/images/calculatorImage.png`;
  public copyImage = `${this.getPath()}dist/assets/images/copyImage.png`;
  public isAdmin: boolean;
  public color: string = 'warn';
  public mode: string = 'indeterminate';
  public value: number = 100;

  constructor(public messagesService: MessagesService,
              private translate: TranslateService,
              private auth: AuthenticationService
  ) { }

  public ngOnInit(): void {
    this.isAdmin = this.auth.getCurrentUser().role === 'admin';
    this.transaction = new Transaction();
    this.transaction.date = new Date();
    this.block = true;
    Product.getAll().then(s => {
      this.products = s;
      this.productsFiltered = this.products.filter(s => !this.productsSelected.find(x =>x.id === s.id));
      this.block = false;
    }, () => {
      this.transaction.date = new Date(this.transaction.date);
      this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
      this.block = false;
    });
  }

  public copySuccess() {
    if(this.transaction.amountDue > 0){
      this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
    }
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

  onProductChange(p: Product){
    this.productSelected = p;
    let l = this.transaction.goldOut -
        this.productsSelected.reduce((a,b) => a + b.quantity, 0);
    l = l < 0 ? 0 : l
    this.productSelected.quantity = l;
  }


  public calculateAmountTotal() {
    this.transaction.amountDue = this.productsSelected.reduce((a,b) => Number(a) + Number(b.price * b.quantity), 0);
  }
  public calculateGoldTotal() {
    this.transaction.totalGold = this.productsSelected.reduce((a,b) => Number(a) + Number(b.quantity), 0);
  }

  public addProduct() {
    if(this.productSelected && this.productSelected.quantity > 0 && this.productSelected.id > 0 ) {
      const p: Product = JSON.parse(JSON.stringify(this.productSelected));
      this.productsSelected = [...this.productsSelected, p];
      this.productsFiltered = this.products.filter(s => !this.productsSelected.find(x =>x.id === s.id));
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
    this.productsFiltered = this.products.filter(s => !this.productsSelected.find(x =>x.id === s.id));
    this.calculateAmountTotal();
    this.calculateGoldTotal();
  }

}
