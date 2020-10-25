import {Component, OnInit} from '@angular/core';
import './layout.component.scss';
import {AuthenticationService} from "../_services/authentication.service";
import {FloatingActionButton} from "ng2-floating-action-menu";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {Client} from "../model/client";
import {MessagesService} from "../_services/messages.service";

declare var $: any;

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {

    public options: any;
    public isSideNavOpened: boolean = true;
    public user: any;
    public iconsShown: boolean = true;
    public clientImage = `${this.getPath()}dist/assets/images/clientImage.png`;
    public supplierImage = `${this.getPath()}dist/assets/images/supplierImage.png`;
    public productImage = `${this.getPath()}dist/assets/images/productImage.png`;
    public employeeImage = `${this.getPath()}dist/assets/images/employeeImage.png`;
    public resultImage = `${this.getPath()}dist/assets/images/resultImage.png`;
    public transactionOutImage = `${this.getPath()}dist/assets/images/transactionOutImage.png`;
    public transactionInImage = `${this.getPath()}dist/assets/images/transactionInImage.png`;
    public errorImage = `${this.getPath()}dist/assets/images/errorImage.png`;
    public settingsImage = `${this.getPath()}dist/assets/images/settingsImage.png`;
    public calculatorImage = `${this.getPath()}dist/assets/images/calculatorImage.png`;
    public registerImage = `${this.getPath()}dist/assets/images/registerImage.png`;


    public buttons: Array<FloatingActionButton> = [];

    constructor(private auth: AuthenticationService,
                private router: Router,
                private translate: TranslateService,
                private messagesService: MessagesService,
    ) {
        let pressed = false;
        let chars: any = [];
        const This: any = this;
        $(window).keypress(function (e: any) {
            if (e.which >= 48 && e.which <= 57) {
                chars.push(String.fromCharCode(e.which));
            }
            if (pressed == false) {
                setTimeout(function () {
                    if (chars.length === 10) {
                        const barcode = chars.join("");
                        console.log("Barcode Scanned: " + barcode);
                        This.goToClient(barcode);
                        // assign value to some input (or do whatever you want)
                        $("#barcode").val(barcode);
                    }
                    chars = [];
                    pressed = false;
                }, 500);
            }
            pressed = true;
        });
        $("#barcode").keypress(function (e: any) {
            if (e.which === 13) {
                console.log("Prevent form submit.");
                e.preventDefault();
            }
        });
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    goToClient(code: any) {
        Client.get(Number(code)).then(i => {
            this.router.navigate(['client-management/' + i.id]);
        }).catch(
            () => this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error')
        );
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    ngOnInit(): void {
        if (this.auth.getCurrentUser().role === 'user') {
            // this.notifyVisitorCount();
        }
        this.user = this.auth.getCurrentUser();
        this.options = {
            fixed: false,
            top: 0,
            bottom: 0,
        };
        const _this = this;
        this.buttons = [
            {
                iconClass: 'glyphicon glyphicon-user',
                label: this.translate.instant('client.title'),
                onClick: function () {
                    _this.router.navigate(['client/form']);
                }
            },
            {
                iconClass: 'glyphicon glyphicon-pencil',
                label: this.translate.instant('transaction.title'),
                onClick: function () {
                    _this.router.navigate(['transaction/form']);
                }
            },
            {
                iconClass: 'glyphicon glyphicon-usd',
                label: this.translate.instant('payment.title'),
                onClick: function () {
                    _this.router.navigate(['payment/form']);
                }
            },
        ];
    }

    /**
     * toggleMenu
     */
    public toggleMenu(): void {
        this.isSideNavOpened = !this.isSideNavOpened;
    }

}
