import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './client-management.component.scss';
import {Client} from "../model/client";

@Component({
    selector: 'app-client-management',
    templateUrl: './client-management.component.html',
})
export class ClientManagementComponent implements OnInit {

    public client: Client;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isClient: boolean;
    public transactionImage = `${this.getPath()}dist/assets/images/transactionImage.png`;
    public chargeImage = `${this.getPath()}dist/assets/images/chargeImage.png`;
    public infoImage = `${this.getPath()}dist/assets/images/infoImage.png`;
    public commentImage = `${this.getPath()}dist/assets/images/commentImage.png`;
    public examImage = `${this.getPath()}dist/assets/images/examImage.png`;
    public weekdayImage = `${this.getPath()}dist/assets/images/weekdayImage.png`;
    public attendanceImage = `${this.getPath()}dist/assets/images/attendanceImage.png`;
    public paymentImage = `${this.getPath()}dist/assets/images/paymentImage.png`;
    public carImage = `${this.getPath()}dist/assets/images/carImage.png`;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    getPath(){
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
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else if (res.client) {
                this.getData(res.client);
                this.isOnEdit = true;
                this.isClient = true;
            } else {
                this.isOnEdit = false;
                this.client = new Client();
            }
            if(res.tab) {
                this.tabSelected = res.tab
            }
        });
    }

    public onTabChange(): void {
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
            });
    }

    goBack() {
        this.router.navigate(['client']);
    }

}
