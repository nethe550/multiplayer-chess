const toggle = document.getElementById('theme');

class Theme {

    constructor() {

        this.theme = Cookies.get('theme') ? Cookies.get('theme') : 'dark'; // dark by default

        this.init();

    }

    init() {

        toggle.addEventListener('click', this.toggleTheme.bind(this));
        
        if (!Cookies.get('theme')) Cookies.set('theme', 'dark', { secure: true, sameSite: 'strict' });
        else {
            this.setTheme(Cookies.get('theme'));
        }

    }

    toggleTheme() {

        this.theme = this.theme == 'dark' ? 'light' : 'dark';
        console.log(this.theme);

        Cookies.set('theme', this.theme, { secure: true, sameSite: 'strict' });

        console.log(Cookies.get('theme'));


        this.setTheme(this.theme);

    }

    setTheme(theme) {

        const root = document.querySelector(':root');

        // Adjustable variables:
        // --font
        // --text-color
        // --special-text-color
        // --primary-background-color
        // --secondary-background-color
        // --tertiary-background-color
        // --primary-hover-color
        // --secondary-hover-color
        // --border-color
        // --border-radius
        // --theme-toggle-brightness
        // --select-color
        // --select-background-color
        // --open-color
        // --closed-color
        // --black-square-color
        // --white-square-color
        // --highlight-square-color

        switch (theme) {

            case 'dark':
                root.style.setProperty('--text-color', 'rgb(255,255,255)');
                root.style.setProperty('--special-text-color', 'rgb(255,255,255)');
                root.style.setProperty('--primary-background-color', 'rgb(36,41,46)');
                root.style.setProperty('--secondary-background-color', 'rgb(0,102,255)');
                root.style.setProperty('--tertiary-background-color', 'rgb(47,54,61)');
                root.style.setProperty('--primary-hover-color', 'rgb(47,54,61)');
                root.style.setProperty('--secondary-hover-color', 'rgb(15,119,255)');
                root.style.setProperty('--border-color', 'rgb(85,85,85)');
                root.style.setProperty('--border-radius', '6px');
                root.style.setProperty('--theme-toggle-brightness', '85%');
                root.style.setProperty('--open-color', 'rgb(150,255,150)');
                root.style.setProperty('--closed-color', 'rgb(255,150,150)');
                root.style.setProperty('--black-square-color', 'rgb(100,100,100)');
                root.style.setProperty('--white-square-color', 'rgb(125,125,125)');
                root.style.setProperty('--highlight-square-color', 'rgb(150,150,150)');

                document.getElementById('theme').src = './static/img/modes/light.svg';
                break;

            case 'light':
                root.style.setProperty('--text-color', 'rgb(0,0,0)');
                root.style.setProperty('--special-text-color', 'rgb(255,255,255)');
                root.style.setProperty('--primary-background-color', 'rgb(230,232,234)');
                root.style.setProperty('--secondary-background-color', 'rgb(0,102,255)');
                root.style.setProperty('--tertiary-background-color', 'rgb(240,242,244)');
                root.style.setProperty('--primary-hover-color', 'rgb(240,242,244)');
                root.style.setProperty('--secondary-hover-color', 'rgb(15,119,255)');
                root.style.setProperty('--border-color', 'rgb(200,200,200)');
                root.style.setProperty('--border-radius', '6px');
                root.style.setProperty('--theme-toggle-brightness', '15%');
                root.style.setProperty('--open-color', 'rgb(50,150,50)');
                root.style.setProperty('--closed-color', 'rgb(150,50,50)');
                root.style.setProperty('--black-square-color', 'rgb(150,150,150)');
                root.style.setProperty('--white-square-color', 'rgb(175,175,175)');
                root.style.setProperty('--highlight-square-color', 'rgb(255,255,255)');

                document.getElementById('theme').src = './static/img/modes/dark.svg';
                break;

        }

    }

}

window['themeManager'] = new Theme('dark');