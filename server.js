const express = require('express'),
    app = express(),
    session = require('express-session');
const path = require('path');

app.set('view engine', 'ejs');

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
    handler.read(req.session.username)
        .then((entries) => {
            if (entries.length === 1) {
                console.log(entries[0]);
                const subjects = JSON.parse(require('fs').readFileSync(path.join(__dirname + entries[0].subjects)));
                res.render(path.join('pages', 'form', 'index'), { value: entries[0], subjects: subjects.subjects });
            } else {
                res.sendStatus(501);
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/', auth, (req, res) => {

    const payload = JSON.parse(req.body);
    handler.updateStudent(req.session.username, payload)
        .then((value) => {
            if (value) {
                console.log('Your data has been saved successfully');
                res.send(true);
            }
        })
        .catch((err) => {
            console.error(err);
        });
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
    handler.readAll()
        .then((entries) => {
            console.log('---x---x---\n');
            console.log(entries);
            console.log('\n---x---x---');
            let students = [],
                admins = [];
            for (let i = 0; i < entries.length; i++) {
                if (entries[i].type === 'student') {
                    students.push(entries[i]);
                } else if (entries[i].type === 'admin') {
                    admins.push(entries[i]);
                }
            }

            res.render(path.join('pages', 'panel', 'index'), { students, admins });
        })
        .catch((err) => { console.error(err); })
});

app.listen(3000, () => {
    const ip = require('ip');
    console.log(`Server running on port- http://${ip.address()}:3000`);
})

// handler.read('john').then((value) => { console.log(value) }).catch((err) => { console.error(err) });