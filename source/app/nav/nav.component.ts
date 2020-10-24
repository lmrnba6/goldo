import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';
import {TranslateService} from '@ngx-translate/core';
import './nav.component.scss';
import {User} from "../model/user";


@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {
    @Output() public menu: EventEmitter<boolean> = new EventEmitter<boolean>();
    lang = 'fr';
    languageText = "Fr";
    center: string;
    pathForward: Array<string> = [];
    date = new Date().toLocaleDateString("en-US");
    user: User;
    messages: number = 0;
    connected = true;
    isTeacher = false;
    isClient = false;
    isParent = false;
    isUser = false;
    isAdmin = false;
    isCloud = false;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 0;
    public inboxImage = `${this.getPath()}dist/assets/images/inboxImage.png`;
    public userImage = `${this.getPath()}dist/assets/images/userImage.png`;
    public powerImage = `${this.getPath()}dist/assets/images/powerImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public cloudImage = `${this.getPath()}dist/assets/images/cloudImage.png`;
    public cloudSync = `${this.getPath()}dist/assets/images/cloudSync.gif`;

    constructor(private authService: AuthenticationService,
                private router: Router,
                private translate: TranslateService,
    ) {
        this.lang = this.translate.currentLang;
        this.languageText = this.lang === 'fr' ? 'عربي' : 'Français';
        this.user = authService.getCurrentUser();
        this.isUser = this.user.role === 'user';
        this.isAdmin = this.user.role === 'admin';
    }

    ngOnInit() {
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

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    inbox() {
        this.router.navigate(['/messages/inbox/inbox']);
    }

    goHome() {
        this.router.navigate(['/']);
    }

    goBack() {
        let url = '';
        const paths = window.location.pathname.split('/');
        let forward = paths.pop();
        forward = typeof (Number(forward)) === 'number' ? paths.pop() : forward;
        forward && this.pathForward.push(forward);
        paths.reverse();
        while (paths.pop() !== 'index.html') {
        }
        paths.forEach(path => url = path + '/' + url);
        this.router.navigate([url]);
    }


    /**
     * hideOrShowMenu
     */
    public toggleMenu(): void {
        this.menu.emit();
    }

    languageChange() {
        this.lang = this.lang === 'ar' ? 'fr' : 'ar';
        this.languageText = this.lang === 'fr' ? 'عربي' : 'Français';
        this.translate.use(this.lang);
    }

}
