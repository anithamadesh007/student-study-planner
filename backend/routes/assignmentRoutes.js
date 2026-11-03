const fs = require("fs");
const path = require("path");

const databasePath =
    path.join(
        __dirname,
        "../../database/assignments.json"
    );


function readDatabase() {

    if (
        !fs.existsSync(
            databasePath
        )
    ) {

        return {
            subjects: [],
            assignments: []
        };
    }


    return JSON.parse(
        fs.readFileSync(
            databasePath,
            "utf8"
        )
    );
}


function saveDatabase(data) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(
            data,
            null,
            2
        )
    );
}


function send(
    res,
    status,
    data
) {

    res.writeHead(
        status,
        {
            "Content-Type":
                "application/json",

            "Access-Control-Allow-Origin":
                "*"
        }
    );

    res.end(
        JSON.stringify(data)
    );
}


function getBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            req.on(
                "data",
                chunk => {
                    body +=
                        chunk.toString();
                }
            );


            req.on(
                "end",
                () => {

                    try {

                        resolve(
                            body
                                ? JSON.parse(
                                    body
                                )
                                : {}
                        );

                    } catch (error) {

                        reject(error);
                    }
                }
            );


            req.on(
                "error",
                reject
            );
        }
    );
}


async function routes(
    req,
    res,
    url
) {

    const db =
        readDatabase();


    /* GET ASSIGNMENTS */

    if (
        req.method === "GET" &&
        url.pathname ===
            "/api/assignments"
    ) {

        let assignments =
            db.assignments;


        const search =
            (
                url.searchParams
                    .get("search") ||
                ""
            ).toLowerCase();


        const status =
            url.searchParams
                .get("status") ||
            "All";


        if (search) {

            assignments =
                assignments.filter(
                    item =>

                        item.title
                            .toLowerCase()
                            .includes(search)

                        ||

                        item.subject
                            .toLowerCase()
                            .includes(search)
                );
        }


        if (
            status !== "All"
        ) {

            assignments =
                assignments.filter(
                    item =>
                        item.status ===
                        status
                );
        }


        assignments.sort(
            (a, b) =>
                new Date(a.deadline) -
                new Date(b.deadline)
        );


        send(
            res,
            200,
            assignments
        );

        return true;
    }


    /* GET SUBJECTS */

    if (
        req.method === "GET" &&
        url.pathname ===
            "/api/subjects"
    ) {

        send(
            res,
            200,
            db.subjects
        );

        return true;
    }


    /* ADD SUBJECT */

    if (
        req.method === "POST" &&
        url.pathname ===
            "/api/subjects"
    ) {

        const body =
            await getBody(req);


        const name =
            String(
                body.name || ""
            ).trim();


        if (!name) {

            send(
                res,
                400,
                {
                    message:
                        "Subject name is required."
                }
            );

            return true;
        }


        const exists =
            db.subjects.some(
                subject =>
                    subject.name
                        .toLowerCase() ===
                    name.toLowerCase()
            );


        if (exists) {

            send(
                res,
                409,
                {
                    message:
                        "Subject already exists."
                }
            );

            return true;
        }


        const subject = {

            id: Date.now(),

            name
        };


        db.subjects.push(
            subject
        );


        saveDatabase(db);


        send(
            res,
            201,
            {
                message:
                    "Subject added.",

                subject
            }
        );

        return true;
    }


    /* ADD ASSIGNMENT */

    if (
        req.method === "POST" &&
        url.pathname ===
            "/api/assignments"
    ) {

        const body =
            await getBody(req);


        const subject =
            String(
                body.subject || ""
            ).trim();


        const title =
            String(
                body.title || ""
            ).trim();


        const deadline =
            String(
                body.deadline || ""
            ).trim();


        const status =
            body.status ||
            "Pending";


        if (
            !subject ||
            !title ||
            !deadline
        ) {

            send(
                res,
                400,
                {
                    message:
                        "All fields are required."
                }
            );

            return true;
        }


        const assignment = {

            id: Date.now(),

            subject,

            title,

            deadline,

            status
        };


        db.assignments.push(
            assignment
        );


        saveDatabase(db);


        send(
            res,
            201,
            {
                message:
                    "Assignment added.",

                assignment
            }
        );

        return true;
    }


    /* UPDATE */

    const match =
        url.pathname.match(
            /^\/api\/assignments\/(\d+)$/
        );


    if (
        req.method === "PATCH" &&
        match
    ) {

        const id =
            Number(
                match[1]
            );


        const body =
            await getBody(req);


        const assignment =
            db.assignments.find(
                item =>
                    item.id === id
            );


        if (!assignment) {

            send(
                res,
                404,
                {
                    message:
                        "Assignment not found."
                }
            );

            return true;
        }


        if (body.status) {

            assignment.status =
                body.status;
        }


        if (body.title) {

            assignment.title =
                body.title;
        }


        if (body.deadline) {

            assignment.deadline =
                body.deadline;
        }


        if (body.subject) {

            assignment.subject =
                body.subject;
        }


        saveDatabase(db);


        send(
            res,
            200,
            {
                message:
                    "Assignment updated.",

                assignment
            }
        );

        return true;
    }


    /* DELETE */

    if (
        req.method === "DELETE" &&
        match
    ) {

        const id =
            Number(
                match[1]
            );


        const index =
            db.assignments.findIndex(
                item =>
                    item.id === id
            );


        if (index === -1) {

            send(
                res,
                404,
                {
                    message:
                        "Assignment not found."
                }
            );

            return true;
        }


        db.assignments.splice(
            index,
            1
        );


        saveDatabase(db);


        send(
            res,
            200,
            {
                message:
                    "Assignment deleted."
            }
        );

        return true;
    }


    return false;
}


module.exports =
    routes;