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

function readAll() {
    return new Promise((resolve, reject) => {
        db.all(`select * from stud`, (err, entries) => {
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

function updateStudent(username, value) {

    return new Promise((resolve, reject) => {

        db.all(`select * from stud where username="${username}"`, (err, entries) => {
            if (err) {
                reject(err);
            } else {
                // console.log('returned entries: ', entries.length);
                if (entries.length === 0) {
                    reject(false);
                } else {

                    db.run(`update stud set top="${value.top}", sem="${value.sem}", branch="${value.branch}", nocollg="${value.nocollg}", fname="${value.fname}", gname="${value.gname}", mname="${value.mname}", address="${value.address}", mail="${value.mail}", cno="${value.cno}", dob="${value.dob}", gender="${value.gender}", category="${value.category}", religion="${value.religion}", diffabl="${value.diffabl}", nation="${value.nation}" where username="${username}"`, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                }
            }
        });
    });

}

function remove(prn) {

}

module.exports = { test, create, read, readAll, updateStudent, remove, setDB, validate };