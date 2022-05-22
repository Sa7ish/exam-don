const express = require('express'),
    app = express(),
    session = require('express-session');
const path = require('path');

app.use(session({ secret: 'jkdsfjksdf', resave: true, saveUninitialized: false, cookie: { maxAge: 1000 * 60 * 60 * 6 } }));
app.use(express.text());

const handler = require('./modules/dbhandler');
handler.setDB('./database/stud.db');

//Authentication Middleware
function auth(req, res, next) {
    if (req.session) {
        // console.log('saved data already: ', req.session.username);
        handler.validate(req.session.username, req.session.password)
            .then((value) => {
                if (value === 'student') {
                    console.log('Session checked');
                    next();
                } else if (value === 'admin') {
                    console.log('Found Admin');
                    res.redirect('/panel');
                }
            })
            .catch((err) => {
                res.redirect('/login');
            });
    } else {
        res.redirect('/login');
    }
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'form', 'index.html'));
});

app.get('/login', (req, res, next) => {
    if (req.session) {
        handler.validate(req.session.username, req.session.password)
            .then((value) => {
                if (value === 'student') {
                    res.redirect('/');
                    return;
                }
            })
            .catch((err) => {
                console.log('received from dbhandler: ', err);
                next();
            });
    } else {
        next();
    }
}, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'login', 'index.html'));
});
app.post('/login', (req, res) => {
    const payload = JSON.parse(req.body);
    console.log('user sent: ', payload);
    handler.validate(payload.user, payload.pass)
        .then((value) => {
            if (value !== null) {
                req.session.username = payload.user;
                req.session.password = payload.pass;
                res.send('true');
            } else {
                res.send('false');
            }
        })
        .catch((err) => {
            res.send('false');
        });
});

app.get('/logout', (req, res) => {

    console.log('Session logged out');
    req.session.destroy();
    res.redirect('/login');
});

function panelAuth(req, res, next) {
    if (req.session) {
        console.log('Panel Auth: verifying admin');
        handler.validate(req.session.username, req.session.password)
            .then((value) => {
                if (value === 'admin') {
                    next();
                } else {
                    req.session.destroy();
                    res.redirect('/login');
                }
            })
            .catch((err) => {
                req.session.destroy();
                res.redirect('/login');
            });
    } else {
        res.redirect('/login');
    }
}

app.get('/panel', panelAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'panel', 'index.html'));
});

app.listen(3000, () => {
    const ip = require('ip');
    console.log(`Server running on port- http://${ip.address()}:3000`);
})

// handler.read('john').then((value) => { console.log(value) }).catch((err) => { console.error(err) });