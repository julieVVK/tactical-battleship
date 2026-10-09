CREATE DATABASE battleship;

CREATE TABLE Users (
	User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Hashed_Password VARCHAR(255),
    Email VARCHAR(100),
    Country VARCHAR(50),
    Profile_Picture MEDIUMBLOB,
    Account_Type ENUM("registered", "guest", "bot") NOT NULL,
    Created_At DATETIME NOT NULL
);

CREATE TABLE Lobbies (
	Lobby_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	Created_By INT NOT NULL,
    Join_Token VARCHAR(100) UNIQUE NOT NULL,
    Status ENUM("waiting", "playing", "finished") NOT NULL,
    Created_At DATETIME NOT NULL,
    
    CONSTRAINT fk_Lobby_Creator
		FOREIGN KEY (Created_By)
        REFERENCES Users(User_ID)
        ON DELETE CASCADE
);

CREATE TABLE Lobby_Players (
	Lobby_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Joined_At DATETIME NOT NULL,
    Ready BOOLEAN NOT NULL,
    
    CONSTRAINT pk_Lobby_Player
		PRIMARY KEY (Lobby_ID, User_ID),
    
    CONSTRAINT fk_Lobby
		FOREIGN KEY (Lobby_ID)
		REFERENCES Lobbies(Lobby_ID),

	CONSTRAINT fk_User
		FOREIGN KEY (User_ID)
		REFERENCES Users(User_ID)
        ON DELETE CASCADE
);

CREATE TABLE Games (
    Game_ID INT PRIMARY KEY AUTO_INCREMENT,
    Start_At DATETIME NOT NULL,
    Finish_Date DATETIME NULL,
    Status VARCHAR(20) NOT NULL,
    Winner_ID INT NULL,
    Current_Turn_ID INT NULL,
    Lobby_ID INT,

    CONSTRAINT fk_Winner
        FOREIGN KEY (Winner_ID)
        REFERENCES Users(User_ID),

    CONSTRAINT fk_Current_Turn
        FOREIGN KEY (Current_Turn_ID)
        REFERENCES Users(User_ID),
        
	CONSTRAINT fk_Lobby_Game
		FOREIGN KEY (Lobby_ID)
		REFERENCES Lobbies(Lobby_ID)
);

CREATE TABLE Game_Players (
    Game_ID INT NOT NULL,
    Player_ID INT NOT NULL,
    Player_Number INT NOT NULL, -- player number one or player number two
    Ready BOOLEAN NOT NULL,

    PRIMARY KEY (Game_ID, Player_ID), -- one player cannot be in one game twice

    CONSTRAINT fk_Game_Player_Game
        FOREIGN KEY (Game_ID)
        REFERENCES Games(Game_ID),

    CONSTRAINT fk_Game_Player_User
        FOREIGN KEY (Player_ID)
        REFERENCES Users(User_ID),
        
	CONSTRAINT uq_Player_Number
		UNIQUE (Game_ID, Player_Number)
);

CREATE TABLE App_Settings (
	User_ID INT PRIMARY KEY,
	Sound_Effects_Enabled BOOLEAN NOT NULL,
    Music_Enabled BOOLEAN NOT NULL,
    Language VARCHAR(30) NOT NULL,
    
    CONSTRAINT fk_User_Settings
		FOREIGN KEY (User_ID)
		REFERENCES Users(User_ID)
        ON DELETE CASCADE
);

CREATE TABLE Ships (
	Ship_ID INT AUTO_INCREMENT PRIMARY KEY,
    Game_ID INT NOT NULL,
    Player_ID INT NOT NULL,
    Type VARCHAR(30) NOT NULL,
    Size INT NOT NULL,
    Initial_X_Position INT NOT NULL,
    Initial_Y_Position VARCHAR(10) NOT NULL,
    Initial_Orientation ENUM("horizontal", "vertical") NOT NULL,
    Current_X_Position INT NOT NULL,
    Current_Y_Position VARCHAR(10) NOT NULL,
    Current_Orientation ENUM("horizontal", "vertical") NOT NULL,
    
    CONSTRAINT fk_Player_Ship
        FOREIGN KEY (Game_ID, Player_ID)
        REFERENCES Game_Players(Game_ID, Player_ID)
);

CREATE TABLE Ship_Cells (
	Ship_Cell_ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    Ship_ID INT NOT NULL,
    Initial_X INT NOT NULL,
    Initial_Y VARCHAR(10) NOT NULL,
    Current_X INT NOT NULL,
    Current_Y VARCHAR(10) NOT NULL,
    Hit BOOLEAN NOT NULL,
    
    CONSTRAINT fk_Ship
		FOREIGN KEY (Ship_ID)
		REFERENCES Ships(Ship_ID),
    
    CONSTRAINT uq_Ship_Cell
		UNIQUE (Ship_ID, Initial_X, Initial_Y) -- one ship cannot have one initial cell twice
);

CREATE TABLE Moves (
	Move_ID int AUTO_INCREMENT PRIMARY KEY,
    Game_ID INT NOT NULL,
    Player_ID INT NOT NULL,
    Move_Type ENUM("shot", "ability") NOT NULL,
    Made_At datetime NOT NULL,
    
    CONSTRAINT fk_Player_Move
        FOREIGN KEY (Game_ID, Player_ID)
        REFERENCES Game_Players(Game_ID, Player_ID)
);

CREATE TABLE Shots (
	Move_ID INT PRIMARY KEY,
    X_Axis INT NOT NULL,
    Y_Axis VARCHAR(10) NOT NULL,
    Result ENUM("hit", "miss") NOT NULL,
    
    CONSTRAINT fk_Move
		FOREIGN KEY (Move_ID)
        REFERENCES Moves(Move_ID)
);

CREATE TABLE Abilities (
	Ability_ID int AUTO_INCREMENT PRIMARY KEY,
    Ability_Name varchar(30) NOT NULL,
    Description VARCHAR(100) NOT NULL,
    Max_Uses INT NOT NULL
);

CREATE TABLE Ability_Uses (
	Move_ID INT PRIMARY KEY,
    Ability_ID INT NOT NULL,
    Target_X INT,
    Target_Y VARCHAR(10),
    Ship_ID INT,
    
    CONSTRAINT fk_Ability_Move
		FOREIGN KEY (Move_ID)
		REFERENCES Moves(Move_ID),
        
	CONSTRAINT fk_Ability
		FOREIGN KEY (Ability_ID)
		REFERENCES Abilities(Ability_ID)
);

CREATE TABLE Game_Player_Abilities (
	Ability_ID INT NOT NULL,
	Game_ID INT NOT NULL,
    Player_ID INT NOT NULL,
    
    CONSTRAINT pk_Ability_Game_Player
		PRIMARY KEY (Game_ID, Player_ID, Ability_ID),
    
    CONSTRAINT fk_Ability_Player
        FOREIGN KEY (Game_ID, Player_ID)
        REFERENCES Game_Players(Game_ID, Player_ID),
        
	CONSTRAINT fk_Player_Ability
		FOREIGN KEY (Ability_ID)
		REFERENCES Abilities(Ability_ID)
);

CREATE TABLE Mine (
	Mine_ID INT PRIMARY KEY AUTO_INCREMENT,
    Game_ID INT NOT NULL,
    Player_ID INT NOT NULL,
    Ability_Use INT NOT NULL,
    X_Position INT NOT NULL,
    Y_Position VARCHAR(10) NOT NULL,
    Mine_Status ENUM("active", "triggered") NOT NULL,
    Placed_At DATETIME NOT NULL,
    Triggered_At DATETIME NULL,
    
    CONSTRAINT fk_Mine_Player
        FOREIGN KEY (Game_ID, Player_ID)
        REFERENCES Game_Players(Game_ID, Player_ID),
        
	CONSTRAINT fk_Ability_Use -- mine setting as a turn
		FOREIGN KEY (Ability_Use)
        REFERENCES Ability_Uses(Move_ID)
);

								-- USER ACTIONS --

-- user registration
INSERT INTO Users
    (Username, Hashed_Password, Email, Country, Account_Type, Created_At)
VALUES
    (?, ?, ?, ?, 'registered', NOW());

-- default settings
INSERT INTO App_Settings
    (User_ID, Sound_Effects_Enabled, Music_Enabled, Language)
VALUES
    (?, TRUE, TRUE, 'English');
                                    
-- 	fetch user
SELECT *
FROM Users
WHERE User_ID = ?;

-- signing in
SELECT User_ID, Username, Hashed_Password, Account_Type
FROM Users
WHERE Email = ?;

-- update profile
UPDATE Users
SET Username = ?,
    Email = ?,
    Country = ?,
    Profile_Picture = ?
WHERE User_ID = ?;

-- password change
UPDATE Users
SET Hashed_Password = ?
WHERE User_ID = ?;

-- delete account
DELETE FROM Users
WHERE User_ID = ?;

										-- APP SETTINGS --

-- fetch settings
SELECT Sound_Effects_Enabled,
       Music_Enabled,
       Language
FROM App_Settings
WHERE User_ID = ?;

-- change settings
UPDATE App_Settings
SET Sound_Effects_Enabled = ?,
    Music_Enabled = ?,
    Language = ?
WHERE User_ID = ?;

											-- LOBBIES --

-- create a lobby
INSERT INTO Lobbies
    (Created_By, Join_Token, Status, Created_At)
VALUES
    (?, ?, 'waiting', NOW());
    
-- find lobby with a URL
SELECT Lobby_ID, Created_By, Status
FROM Lobbies
WHERE Join_Token = ?;

-- select a player in a lobby
SELECT u.User_ID,
       u.Username,
       lp.Ready
FROM Lobby_Players lp
JOIN Users u ON u.User_ID = lp.User_ID
WHERE lp.Lobby_ID = ?;

-- add player to a lobby
INSERT INTO Lobby_Players
    (Lobby_ID, User_ID, Joined_At, Ready)
VALUES
    (?, ?, NOW(), FALSE);
    
-- set ready
UPDATE Lobby_Players
SET Ready = TRUE
WHERE Lobby_ID = ?
  AND User_ID = ?;
  
-- leave lobby 
DELETE FROM Lobby_Players
WHERE Lobby_ID = ?
  AND User_ID = ?;
  
										-- GAMES --

-- create a game
INSERT INTO Games
    (Lobby_ID, Start_At, Status, Winner_ID, Current_Turn_ID)
VALUES
    (?, NOW(), 'playing', NULL, ?);

-- fetch a game
SELECT *
FROM Games
WHERE Game_ID = ?;

-- who is playing
SELECT u.User_ID,
       u.Username,
       gp.Player_Number,
       gp.Ready
FROM Game_Players gp
JOIN Users u ON u.User_ID = gp.Player_ID
WHERE gp.Game_ID = ?;

-- change player turn
UPDATE Games
SET Current_Turn_ID = ?
WHERE Game_ID = ?;

-- end game
UPDATE Games
SET Status = 'finished',
    Finish_Date = NOW(),
    Winner_ID = ?,
    Current_Turn_ID = NULL
WHERE Game_ID = ?;

-- check if a lobby is full
SELECT COUNT(*) AS Player_Count
FROM Lobby_Players
WHERE Lobby_ID = ?;

-- update lobby status
UPDATE Lobbies
SET Status = 'playing'
WHERE Lobby_ID = ?;

UPDATE Lobbies
SET Status = 'finished'
WHERE Lobby_ID = ?;

										-- GAME PLAYERS --

-- add player to a game
INSERT INTO Game_Players
    (Game_ID, Player_ID, Player_Number, Ready)
VALUES
    (?, ?, ?, FALSE);
    
-- set ready
UPDATE Game_Players
SET Ready = TRUE
WHERE Game_ID = ?
  AND Player_ID = ?;
  
											-- SHIPS --

-- save ship position at the start of a game
INSERT INTO Ships
    (Game_ID, Player_ID, Type, Size,
     Initial_X_Position, Initial_Y_Position, Initial_Orientation,
     Current_X_Position, Current_Y_Position, Current_Orientation)
VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    
-- fetch new ships
SELECT *
FROM Ships
WHERE Game_ID = ?
  AND Player_ID = ?;
  
-- fetch opponent's ships
SELECT *
FROM Ships
WHERE Game_ID = ?
  AND Player_ID = ?;
  
-- move ships
UPDATE Ships
SET Current_X_Position = ?,
    Current_Y_Position = ?,
    Current_Orientation = ?
WHERE Ship_ID = ?
  AND Game_ID = ?
  AND Player_ID = ?;
  
-- fetch ship cells
SELECT *
FROM Ship_Cells
WHERE Ship_ID = ?;

-- update ship cells
UPDATE Ship_Cells
SET Hit = TRUE
WHERE Ship_Cell_ID = ?;
  
-- save ship cells
INSERT INTO Ship_Cells
    (Ship_ID, Initial_X, Initial_Y, Current_X, Current_Y, Hit)
VALUES
    (?, ?, ?, ?, ?, FALSE);
    

  
										-- ABILITIES --

-- fetch all abilities
SELECT *
FROM Abilities;

-- add abilities to a game
INSERT INTO Game_Player_Abilities
    (Ability_ID, Game_ID, Player_ID)
VALUES
    (?, ?, ?);
    
-- create mine
INSERT INTO Mine
    (Game_ID, Player_ID, Ability_Use,
     X_Position, Y_Position, Mine_Status, Placed_At)
VALUES
    (?, ?, ?, ?, ?, 'active', NOW());
    
-- check if a field has a mine in in
SELECT Mine_ID
FROM Mine
WHERE Game_ID = ?
  AND Player_ID = ?
  AND X_Position = ?
  AND Y_Position = ?
  AND Mine_Status = 'active';
  
-- activate mine
UPDATE Mine
SET Mine_Status = 'triggered',
    Triggered_At = NOW()
WHERE Mine_ID = ?;

-- ability statistics
SELECT
    a.Ability_ID,
    a.Ability_Name,
    a.Description,
    a.Max_Uses,
    COUNT(m.Move_ID) AS Used,
    a.Max_Uses - COUNT(m.Move_ID) AS Remaining
FROM Game_Player_Abilities gpa
JOIN Abilities a
    ON a.Ability_ID = gpa.Ability_ID
LEFT JOIN Ability_Uses au
    ON au.Ability_ID = a.Ability_ID
LEFT JOIN Moves m
	ON m.Move_ID = au.Move_ID
   AND m.Game_ID = gpa.Game_ID
   AND m.Player_ID = gpa.Player_ID
WHERE gpa.Game_ID = ?
  AND gpa.Player_ID = ?
GROUP BY
    a.Ability_ID,
    a.Ability_Name,
    a.Description,
    a.Max_Uses;
    
										-- GAME ACTIONS --
 
-- shot    
INSERT INTO Moves
    (Game_ID, Player_ID, Move_Type, Made_At)
VALUES
    (?, ?, 'shot', NOW());
    
INSERT INTO Shots
    (Move_ID, X_Axis, Y_Axis, Result)
VALUES
    (?, ?, ?, ?);
    
-- use a move
INSERT INTO Moves
    (Game_ID, Player_ID, Move_Type, Made_At)
VALUES
    (?, ?, 'ability', NOW());
    
-- use an ability
INSERT INTO Ability_Uses
    (Move_ID, Ability_ID, Target_X, Target_Y, Ship_ID)
VALUES
    (?, ?, ?, ?, ?);

										-- STATISTICS --

-- moves count
SELECT COUNT(*) AS Moves
FROM Moves
WHERE Game_ID = ?
  AND Player_ID = ?;
  
-- victory count
SELECT COUNT(*) AS Wins
FROM Games
WHERE Winner_ID = ?
  AND Status = 'finished';
  
-- defeat count
SELECT COUNT(*) AS Losses
FROM Games
WHERE Status = 'finished'
  AND Winner_ID IS NOT NULL
  AND Winner_ID <> ?
  AND Game_ID IN (
      SELECT Game_ID
      FROM Game_Players
      WHERE Player_ID = ?
  );
  
-- total games played
SELECT COUNT(*) AS Total
FROM Games g
JOIN Game_Players gp
    ON gp.Game_ID = g.Game_ID
WHERE gp.Player_ID = ?
  AND g.Status = 'finished';
  
-- recent matches 
SELECT
    g.Game_ID,
    g.Finish_Date,
    CASE
        WHEN g.Winner_ID = ? THEN 'Victory'
        ELSE 'Defeat'
    END AS Result,
    COUNT(mv.Move_ID) AS Moves
FROM Games g
JOIN Game_Players gp
    ON gp.Game_ID = g.Game_ID
LEFT JOIN Moves mv
    ON mv.Game_ID = g.Game_ID
   AND mv.Player_ID = ?
WHERE gp.Player_ID = ?
  AND g.Status = 'finished'
GROUP BY
    g.Game_ID,
    g.Finish_Date,
    g.Winner_ID
ORDER BY g.Finish_Date DESC
LIMIT 10;

