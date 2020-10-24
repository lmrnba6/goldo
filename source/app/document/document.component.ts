import {Component, OnInit} from '@angular/core';
import './document.component.scss';
import {Client} from "../model/client";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {MessagesService} from "../_services/messages.service";
import {Product} from "../model/product";

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html'
})
export class DocumentComponent implements OnInit {

    sessions = [];
    public clientsToPrint: Array<Client> = [];
    public clients: Array<Client> = [];
    public clientsFiltered: Array<Client> = [];
    public clientSelected: Client;
    card: boolean;
    receipt: boolean;
    form: boolean;
    open: string;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public clientImage = `${this.getPath()}dist/assets/images/clientImage.png`;
    public paymentImage = `${this.getPath()}dist/assets/images/paymentImage.png`;

    constructor(private router: Router, private translate: TranslateService, private messagesService: MessagesService) {
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit() {
        this.getSessions();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }

    handleOpen(type: string) {
        this.open = type === this.open ? '' : type;
    }

    remove(i: Client): void {
        const index = this.clientsToPrint.indexOf(i);

        if (index >= 0) {
            this.clientsToPrint.splice(index, 1);
        }
    }


    public displayFn(client: Client) {
        return client ? client.name : this.clientSelected ? this.clientSelected.name : '';
    }

    public clientOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Client.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.clientsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
        //this.clientsFiltered = this.clients.filter(clients => clients.name.toLowerCase().includes(event.toLowerCase()));
    }

    public clientOnSelect(client: Client): void {
        this.clientSelected = client;
        if (this.open === 'card') {
            if(this.clientsToPrint.length < 8){
                this.clientsToPrint.push(client);
                (this.clientSelected as any) = null;
            }
        } else if (this.open === 'receipt') {
            this.router.navigate(['/document/pv/receipt/' + this.clientSelected.id]);
        } else if (this.open === 'form') {
            this.router.navigate(['/document/pv/form/' + this.clientSelected.id]);
        }else if (this.open === 'diploma') {
            this.router.navigate(['/document/pv/diploma/' + this.clientSelected.id]);
        }
    }

    getSessions() {
        Product.getAll().then((sessions: any) => {
            this.sessions = sessions;
        });
    }

}
