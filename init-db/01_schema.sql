create table Users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(60),
    password VARCHAR(255)
);

create table AppTeams (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(80),
    user_id INTEGER,
    CONSTRAINT fk_users
                      FOREIGN KEY (user_id)
                      REFERENCES Users(id)

);

create table Projects (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(80),
    user_id INTEGER,
    CONSTRAINT fk_users
                      FOREIGN KEY (user_id)
                      REFERENCES Users(id)

);

create table Applications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50),
    description VARCHAR(600),
    project_id INTEGER,
    appteam_id INTEGER,
    CONSTRAINT fk_projects
                          FOREIGN KEY (project_id)
                          REFERENCES Projects(id),
    CONSTRAINT fk_appTeam
                          FOREIGN KEY (appteam_id)
                          REFERENCES AppTeams(id)
);

create table AppTeams_Users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER,
    appteam_id INTEGER,
    CONSTRAINT fk_users
                            FOREIGN KEY (user_id)
                            REFERENCES Users(id),
    CONSTRAINT fk_appTeam
                            FOREIGN KEY (appteam_id)
                            REFERENCES AppTeams(id)
);