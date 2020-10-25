import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './employee-management.component.scss';
import {Employee} from "../model/employee";

@Component({
    selector: 'app-employee-management',
    templateUrl: './employee-management.component.html',
})
export class EmployeeManagementComponent implements OnInit {

    public employee: Employee;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isEmployee: boolean;
    public infoImage = `${this.getPath()}dist/assets/images/infoImage.png`;
    public chargeImage = `${this.getPath()}dist/assets/images/chargeImage.png`;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;
    public commentImage = `${this.getPath()}dist/assets/images/commentImage.png`;

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
            } else if (res.employee) {
                this.getData(res.employee);
                this.isOnEdit = true;
                this.isEmployee = true;
            } else {
                this.isOnEdit = false;
                this.employee = new Employee();
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
     * @param  {string} name employee name
     * @returns void
     */
    public getData(id: number): void {
        Employee
            .get(id)
            .then((val: Employee) => {
                this.employee = val;
            });
    }

    goBack() {
        this.router.navigate(['employee']);
    }

}
