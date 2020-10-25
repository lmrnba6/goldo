import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './supplier-management.component.scss';
import {Supplier} from "../model/supplier";

@Component({
    selector: 'app-supplier-management',
    templateUrl: './supplier-management.component.html',
})
export class SupplierManagementComponent implements OnInit {

    public supplier: Supplier;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isSupplier: boolean;
    public transactionImage = `${this.getPath()}dist/assets/images/transactionImage.png`;
    public infoImage = `${this.getPath()}dist/assets/images/infoImage.png`;
    public commentImage = `${this.getPath()}dist/assets/images/commentImage.png`;
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
            } else if (res.supplier) {
                this.getData(res.supplier);
                this.isOnEdit = true;
                this.isSupplier = true;
            } else {
                this.isOnEdit = false;
                this.supplier = new Supplier();
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
     * @param  {string} name supplier name
     * @returns void
     */
    public getData(id: number): void {
        Supplier
            .get(id)
            .then((val: Supplier) => {
                this.supplier = val;
            });
    }

    goBack() {
        this.router.navigate(['supplier']);
    }

}
