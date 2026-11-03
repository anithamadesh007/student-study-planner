const fs = require("fs");
const path = require("path");

const filePath =
    path.join(
        __dirname,
        "output.txt"
    );

const content =
    "Node.js File System";


fs.writeFile(
    filePath,
    content,
    "utf8",
    error => {

        if (error) {

            console.log(
                "Error:",
                error.message
            );

            return;
        }


        console.log(
            "File created successfully!"
        );

        console.log(
            "Written content:",
            content
        );
    }
);