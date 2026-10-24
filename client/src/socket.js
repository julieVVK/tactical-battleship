import {io} from 'socket.io-client';

// Адрес и порт бэкенда, который поднял Влад
const socket = io('http://localhost:3000');

export default socket;