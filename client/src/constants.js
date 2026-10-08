export const BOARD_SIZE = 10;

export const SHIPS_CONFIG = [
    {id: 'battleship-4', name: 'battleship', size: 4},
    {id: 'cruiser-3-1', name: 'cruiser', size: 3},
    {id: 'cruiser-3-2', name: 'cruiser', size: 3},
    {id: 'destroyer-2-1', name: 'destroyer', size: 2},
    {id: 'destroyer-2-2', name: 'destroyer', size: 2},
    {id: 'destroyer-2-3', name: 'destroyer', size: 2},
    {id: 'boat-1-1', name: 'boat', size: 1},
    {id: 'boat-1-2', name: 'boat', size: 1},
    {id: 'boat-1-3', name: 'boat', size: 1},
    {id: 'boat-1-4', name: 'boat', size: 1},
];

export const GADGETS = [
    {id: 'radar', name: 'radar (3x3)', icon: '', desc: 'scans square 3x3'},
    {id: 'mine', name: 'mine', icon: '', desc: 'damages opponent when got hit'},
    {id: 'relocate', name: 'relocate', icon: '', desc: 'relocates ship to another position'},
];

export const TURN_MESSAGES = {
    my_turn: 'Your turn · Choose a square on the opponent\'s board',
    opponent_turn: 'Enemy\'s turn · Please wait for the opponent to make a move',
    waiting: 'Waiting for opponent · Share the game link with a friend',
    won: 'Victory · All enemy ships have been sunk',
    lost: 'Defeat · Your fleet has been destroyed',
};

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];