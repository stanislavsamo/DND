import Board from './kanban/Board';

/* eslint-disable */
console.log("Here we go...Let's go!");
const board = new Board(document.querySelector(".trello-container"));
board.bindToDOM();