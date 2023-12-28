const EventCreate = {
    name: "Contract signing",
    description: "Important meeting to have a contract with Vinamilk Corp",
    dateTime: new Date(),
    users: [
        {
            user: "6513ea6db2f06af8724be2d9",
            mandatory: true,
        },
        {
            user: "651b919498bf3396039b12fc",
            mandatory: false,
        },
        {
            user: "651fbdbb4f20aa3dade4c43a",

            mandatory: false,
        },
    ],
    room: "E7.3",
};

const EventSameTime = {
    name: "Contract signing",
    description: "Important meeting to have a contract with Vinamilk Corp",
    dateTime: new Date("2023-12-15T17:00:00.000+00:00"),
    users: [
        {
            user: "651fbdbb4f20aa3dade4c43a",
            mandatory: true,
        },
        {
            user: "651b919498bf3396039b12fc",
            mandatory: false,
        },
    ],
    room: "E7.3",
};

const EventSameRoom = {
    name: "Contract signing",
    description: "Important meeting to have a contract with Vinamilk Corp",
    dateTime: new Date("2023-12-15T17:00:00.000+00:00"),
    users: [
        {
            user: "651fbdbb4f20aa3dade4c43a",
            mandatory: false,
        },
        {
            user: "651b919498bf3396039b12fc",
            mandatory: false,
        },
    ],
    room: "A33",
};

export { EventCreate, EventSameTime, EventSameRoom };
