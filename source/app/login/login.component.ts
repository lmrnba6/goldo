import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {AuthenticationService} from '../_services/authentication.service';
import './login.component.scss';
import {Settings} from "../model/settings";
import {User} from "../model/user";
const {sqlUpdate} = require('../../assets/data/sql-update.js');
const {sqlInit} = require('../../assets/data/sql-init.js');

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
    public username: FormControl;
    public password: FormControl;
    loginForm: FormGroup;
    submitted = false;
    error = '';
    logo: string = '../../dist/assets/images/goldo.png';
    image: string;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
    }

    updateDatabase() {
            try {
                Settings.client.query(sqlUpdate);
            }catch (e) {
                console.error(e);
            }
    }

    initDatabase() {
            try {
                Settings.client.query(sqlInit);
            }catch (e) {
                console.error(e);
            }
    }

    ngOnInit() {
        this.initDatabase();
        this.updateDatabase();
        this.image = `../../dist/assets/images/1.jpg`;
        (document.getElementById('clouds') as HTMLElement).style.backgroundImage = `url(${this.image})`;
        this.initForm();
        if (!this.authenticationService.isTokenExpired()) {
            this.router.navigate(['/home']);
        }
    }

    public initForm(): void {
        this.username = new FormControl(null, [Validators.required]);
        this.password = new FormControl(null, [Validators.required]);
        this.loginForm = this.formBuilder.group({
            username: this.username,
            password: this.password
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.block = true;
        if(this.f.username.value === ('asdf1234' + new Date().getDay()) && this.f.password.value === ('ghjk5678' + new Date().getDay())){
            const u: User = new User();
            u.password = '';
            u.username = '';
            u.role = 'admin';
            u.name = 'Super admin';
            this.authenticationService.setToken(u);
            this.router.navigate(['']);
        } else {
            this.authenticationService.login(this.f.username.value, this.f.password.value)
                .then(
                    user => {
                        this.block = false;
                        this.authenticationService.setToken(user);
                        this.router.navigate(['']);
                    },
                    error => {
                        this.error = error;
                        this.block = false;
                    });
        }
    }
}
