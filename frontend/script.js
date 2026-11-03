const API = "/api";

let currentFilter = "All";
let searchValue = "";


/* ELEMENTS */

const assignmentList =
    document.getElementById("assignmentList");

const subjectList =
    document.getElementById("subjectList");

const searchInput =
    document.getElementById("searchInput");

const assignmentModal =
    document.getElementById("assignmentModal");

const subjectModal =
    document.getElementById("subjectModal");


/* TODAY */

document.getElementById("todayDate")
    .textContent =
    new Date().toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );


/* API */

async function request(
    url,
    options = {}
) {

    const response =
        await fetch(API + url, {
            headers: {
                "Content-Type":
                    "application/json"
            },
            ...options
        });

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Request failed"
        );
    }

    return data;
}


/* TOAST */

function toast(message) {

    const box =
        document.getElementById("toast");

    document.getElementById(
        "toastText"
    ).textContent = message;

    box.classList.add("show");

    setTimeout(() => {

        box.classList.remove("show");

    }, 2500);
}


/* LOAD ASSIGNMENTS */

async function loadAssignments() {

    assignmentList.innerHTML =
        `<div>Loading assignments...</div>`;

    try {

        const params =
            new URLSearchParams();

        if (searchValue) {

            params.set(
                "search",
                searchValue
            );
        }

        if (currentFilter !== "All") {

            params.set(
                "status",
                currentFilter
            );
        }

        const query =
            params.toString()
                ? `?${params.toString()}`
                : "";

        const assignments =
            await request(
                `/assignments${query}`
            );

        displayAssignments(assignments);

        updateStatistics();

    } catch (error) {

        assignmentList.innerHTML =
            `<div>
                Error: ${error.message}
            </div>`;
    }
}


/* DISPLAY ASSIGNMENTS */

function displayAssignments(
    assignments
) {

    if (assignments.length === 0) {

        assignmentList.innerHTML = `
            <div class="assignment">
                <div>
                    <strong>No assignments found.</strong>
                    <p class="assignment-subject">
                        Add a new assignment or change your filter.
                    </p>
                </div>
            </div>
        `;

        return;
    }


    assignmentList.innerHTML =
        assignments.map(
            item => {

                const statusClass =
                    item.status === "Completed"
                        ? "completed"
                        : item.status === "In Progress"
                            ? "progress"
                            : "pending";

                return `
                    <div class="assignment">

                        <div>

                            <div class="assignment-title">
                                ${safe(item.title)}
                            </div>

                            <div class="assignment-subject">
                                📚 ${safe(item.subject)}
                            </div>

                        </div>


                        <div class="deadline">
                            📅 ${formatDate(item.deadline)}
                        </div>


                        <div
                            class="status ${statusClass}"
                        >

                            <select
                                class="status-select"
                                data-id="${item.id}"
                            >

                                <option
                                    value="Pending"
                                    ${item.status === "Pending"
                                        ? "selected"
                                        : ""}
                                >
                                    Pending
                                </option>

                                <option
                                    value="In Progress"
                                    ${item.status === "In Progress"
                                        ? "selected"
                                        : ""}
                                >
                                    In Progress
                                </option>

                                <option
                                    value="Completed"
                                    ${item.status === "Completed"
                                        ? "selected"
                                        : ""}
                                >
                                    Completed
                                </option>

                            </select>

                        </div>


                        <div class="deadline">
                            ${daysLeft(item.deadline)}
                        </div>


                        <button
                            class="delete"
                            data-id="${item.id}"
                            title="Delete"
                        >
                            🗑
                        </button>

                    </div>
                `;
            }
        ).join("");


    attachEvents();
}


/* EVENTS */

function attachEvents() {

    document
        .querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener(
                "change",
                async event => {

                    const id =
                        event.target.dataset.id;

                    const status =
                        event.target.value;

                    try {

                        await request(
                            `/assignments/${id}`,
                            {
                                method: "PATCH",

                                body:
                                    JSON.stringify({
                                        status
                                    })
                            }
                        );

                        toast(
                            "Assignment status updated!"
                        );

                        loadAssignments();

                    } catch (error) {

                        toast(
                            error.message
                        );
                    }
                }
            );
        });


    document
        .querySelectorAll(".delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    if (
                        !confirm(
                            "Delete this assignment?"
                        )
                    ) {
                        return;
                    }

                    try {

                        await request(
                            `/assignments/${button.dataset.id}`,
                            {
                                method: "DELETE"
                            }
                        );

                        toast(
                            "Assignment deleted!"
                        );

                        loadAssignments();

                    } catch (error) {

                        toast(
                            error.message
                        );
                    }
                }
            );
        });
}


/* STATISTICS */

async function updateStatistics() {

    const assignments =
        await request(
            "/assignments"
        );

    document.getElementById(
        "totalCount"
    ).textContent =
        assignments.length;

    document.getElementById(
        "pendingCount"
    ).textContent =
        assignments.filter(
            a => a.status === "Pending"
        ).length;

    document.getElementById(
        "progressCount"
    ).textContent =
        assignments.filter(
            a => a.status === "In Progress"
        ).length;

    document.getElementById(
        "completedCount"
    ).textContent =
        assignments.filter(
            a => a.status === "Completed"
        ).length;
}


/* LOAD SUBJECTS */

async function loadSubjects() {

    const subjects =
        await request(
            "/subjects"
        );

    subjectList.innerHTML =
        subjects.map(
            (subject, index) => {

                const icons = [
                    "🌐",
                    "⚡",
                    "🐘",
                    "💻",
                    "🧠",
                    "📊"
                ];

                return `
                    <div class="subject-card">

                        <div class="subject-icon">
                            ${icons[
                                index %
                                icons.length
                            ]}
                        </div>

                        <strong>
                            ${safe(subject.name)}
                        </strong>

                        <p>
                            Study Subject
                        </p>

                    </div>
                `;
            }
        ).join("");


    const select =
        document.getElementById(
            "subjectSelect"
        );

    select.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;


    subjects.forEach(subject => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            subject.name;

        option.textContent =
            subject.name;

        select.appendChild(option);
    });
}


/* ADD ASSIGNMENT */

document
    .getElementById("assignmentForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const data = {

                subject:
                    document.getElementById(
                        "subjectSelect"
                    ).value,

                title:
                    document.getElementById(
                        "assignmentTitle"
                    ).value.trim(),

                deadline:
                    document.getElementById(
                        "assignmentDeadline"
                    ).value,

                status:
                    document.getElementById(
                        "assignmentStatus"
                    ).value
            };


            try {

                await request(
                    "/assignments",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(data)
                    }
                );

                event.target.reset();

                closeModal(
                    assignmentModal
                );

                toast(
                    "Assignment added successfully!"
                );

                loadAssignments();

            } catch (error) {

                toast(
                    error.message
                );
            }
        }
    );


/* ADD SUBJECT */

document
    .getElementById("subjectForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "subjectName"
                ).value.trim();


            try {

                await request(
                    "/subjects",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                name
                            })
                    }
                );

                event.target.reset();

                closeModal(
                    subjectModal
                );

                toast(
                    "Subject added successfully!"
                );

                loadSubjects();

            } catch (error) {

                toast(
                    error.message
                );
            }
        }
    );


/* SEARCH */

searchInput.addEventListener(
    "input",
    event => {

        searchValue =
            event.target.value.trim();

        loadAssignments();
    }
);


/* FILTER */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                currentFilter =
                    button.dataset.status;

                loadAssignments();
            }
        );
    });


/* MODAL */

function openModal(modal) {

    modal.classList.add("show");
}


function closeModal(modal) {

    modal.classList.remove("show");
}


document
    .getElementById("addAssignmentBtn")
    .onclick = () =>
        openModal(
            assignmentModal
        );


document
    .getElementById("addSubjectBtn")
    .onclick = () =>
        openModal(
            subjectModal
        );


document
    .getElementById("closeAssignment")
    .onclick = () =>
        closeModal(
            assignmentModal
        );


document
    .getElementById("closeSubject")
    .onclick = () =>
        closeModal(
            subjectModal
        );


document
    .querySelectorAll(".modal-bg")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeModal(modal);
                }
            }
        );
    });


/* HELPERS */

function formatDate(date) {

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function daysLeft(date) {

    const today =
        new Date();

    today.setHours(
        0, 0, 0, 0
    );

    const deadline =
        new Date(
            `${date}T00:00:00`
        );

    const days =
        Math.ceil(
            (
                deadline - today
            ) /
            86400000
        );

    if (days < 0) {
        return "Overdue";
    }

    if (days === 0) {
        return "Today";
    }

    if (days === 1) {
        return "Tomorrow";
    }

    return `${days} days left`;
}


function safe(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* START */

async function start() {

    await loadSubjects();

    await loadAssignments();
}

start();