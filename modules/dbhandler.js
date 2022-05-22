const sql = require('sqlite3');
let db;

function test() { return "Wroking"; }

function setDB(value) {
    db = new sql.Database(value);
}


function create(data) {
    return new Promise((resolve, reject) => {
        db.run(`insert into stud(top, sem, branch, nocollg, prn, fname, gname, mname, address, mail, cno, dob, gender, category, religion, diffabl, nation, subjects, photo, username, password, type) values("${data.top}", "${data.sem}", "${data.branch}", "${data.nocollg}", "${data.prn}", "${data.fname}", "${data.gname}", "${data.mname}", "${data.address}", "${data.mail}", "${data.cno}", "${data.dob}", "${data.gender}", "${data.category}", "${data.religion}", "${data.diffabl}", "${data.nation}", "/subject/${data.prn}.json", "/photo/${data.prn}.jpg", "${data.username}", "${data.password}", "${data.type}")`,
            (err) => {
                if (err !== null) { reject(err) } else {
                    resolve('profile saved');
                }
            });
    });

}

function read(username) {
    // select * from stud where username='john' and password='john@123';
    return new Promise((resolve, reject) => {
        db.all(`select * from stud where username="${username}"`, (err, entries) => {
            if (err) {
                reject(err);
            } else {
                resolve(entries);
            }
        });
    });
}

function validate(username, password) {
    // select * from stud where username='john' and password='john@123';
    return new Promise((resolve, reject) => {
        db.all(`select * from stud where username="${username}" and password="${password}"`, (err, entries) => {
            if (err) {
                reject(err);
            } else {
                console.log('returned entries: ', entries.length);
                if (entries.length === 0) {
                    reject(false);
                } else {
                    resolve(entries[0].type);
                }
            }
        });
    });
}

function update(prn, header, value) {

}

function remove(prn) {

}

module.exports = { test, create, read, update, remove, setDB, validate };