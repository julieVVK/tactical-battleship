// File was created by xhaziyh00

// Edited by Vladyslav Doroshenko
//     - Added foreign languages support
//       Changed lines: 23-25, 29-33

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
    {id: 'mine', nameKey: 'gadget.mine', descKey: 'gadget.mineDescription', name: 'mine', icon: '💣', desc: 'damages opponent when got hit'},
    {id: 'relocate', nameKey: 'gadget.relocate', descKey: 'gadget.relocateDescription', name: 'relocate', icon: '⚓', desc: 'relocates ship to another position'},
    {id: 'radar', nameKey: 'gadget.radar', descKey: 'gadget.radarDescription', name: 'radar (3x3)', icon: '📡', desc: 'scans square 3x3'},
];

export const TURN_MESSAGES = {
    my_turn: 'turn.my_turn',
    opponent_turn: 'turn.opponent_turn',
    waiting: 'turn.waiting',
    won: 'turn.won',
    lost: 'turn.lost',
};

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];