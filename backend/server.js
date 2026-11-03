const http = require("http");
const fs = require("fs");
const path = require("path");

const {
    URL
} = require("url");

const assignmentRoutes =
    require("./routes/assignmentRoutes");


const PORT = 3000;

const frontendPath =
    path.join(
        __dirname,
        "../frontend"
    );


const mimeTypes = {

    ".html":
        "text/html",

    ".css":
        "text/css",

    ".js":
        "text/javascript",

    ".png":
        "image/png",

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".svg":
        "image/svg+xml"
};


function serveFile(
    req,
    res,
    pathname
) {

    let filePath =
        pathname === "/"
            ? path.join(
                frontendPath,
                "index.html"
            )
            : path.join(
                frontendPath,
                pathname
            );


    if (
        !filePath.startsWith(
            frontendPath
        )
    ) {

        res.writeHead(403);

        res.end(
            "Forbidden"
        );

        return;
    }


    fs.readFile(
        filePath,
        (error, data) => {

            if (error) {

                res.writeHead(
                    404,
                    {
                        "Content-Type":
                            "text/plain"
                    }
                );

                res.end(
                    "File not found"
                );

                return;
            }


            const extension =
                path.extname(
                    filePath
                );


            res.writeHead(
                200,
                {
                    "Content-Type":
                        mimeTypes[
                            extension
                        ] ||
                        "application/octet-stream"
                }
            );

            res.end(data);
        }
    );
}


const server =
    http.createServer(
        async (req, res) => {

            const url =
                new URL(
                    req.url,
                    `http://${req.headers.host}`
                );


            if (
                req.method ===
                "OPTIONS"
            ) {

                res.writeHead(
                    204,
                    {
                        "Access-Control-Allow-Origin":
                            "*",

                        "Access-Control-Allow-Methods":
                            "GET,POST,PATCH,DELETE,OPTIONS",

                        "Access-Control-Allow-Headers":
                            "Content-Type"
                    }
                );

                res.end();

                return;
            }


            if (
                url.pathname.startsWith(
                    "/api/"
                )
            ) {

                const handled =
                    await assignmentRoutes(
                        req,
                        res,
                        url
                    );


                if (!handled) {

                    res.writeHead(
                        404,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );

                    res.end(
                        JSON.stringify({
                            message:
                                "API route not found"
                        })
                    );
                }

                return;
            }


            serveFile(
                req,
                res,
                url.pathname
            );
        }
    );


server.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            "       STUDYFLOW RUNNING"
        );

        console.log(
            "================================"
        );

        console.log(
            `Open http://localhost:${PORT}`
        );

        console.log("");
    }
);