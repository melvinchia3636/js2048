/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import './style.scss';
import { v4 } from 'uuid';

const COLOR_PALETTE: string[] = [
  'rgb(204, 192, 179)',
  'rgb(238, 228, 218)',
  'rgb(237, 224, 200)',
  'rgb(242, 177, 121)',
  'rgb(245, 149, 99)',
  'rgb(246, 124, 95)',
  'rgb(246, 94, 59)',
  'rgb(237, 207, 114)',
  'rgb(237, 204, 97)',
  'rgb(237, 200, 80)',
  'rgb(237, 197, 63)',
  'rgb(237, 194, 46)',
];

const app = document.querySelector<HTMLDivElement>('#app')!;

interface Tile {
  id: string,
  value: number;
  position: {
    x: number,
    y: number,
  };
  isMerged: boolean;
  isNew: boolean;
  toBeRemoved: boolean;
  mergeCells: string[];
}

let board: Tile[] = Array(11).fill(0).map((_, i) => ({
  id: v4(),
  value: 2 ** (i + 1),
  position: {
    x: i % 4,
    y: Math.floor(i / 4),
  },
  isMerged: false,
  isNew: false,
  toBeRemoved: false,
  mergeCells: ([] as string[]),
}));

app.innerHTML = `
  <div class="w-[29rem] h-[29rem] flex items-center justify-center bg-[#bbada0] rounded-lg">
    <div id="board" class="w-[28rem] h-[28rem] relative grid grid-cols-4 overflow-hidden items-center justify-center">
      ${Array(16).fill(0).map(() => '<div class="w-24 h-24 rounded-md m-2 bg-[#cdc1b4] border-yellow-400"></div>').join('')}
    </div>
  </div>
`;

const boardElement = document.getElementById('board')!;

function sortBoard(): Tile[] {
  board.sort((a, b) => {
    if (a.position.y === b.position.y) {
      return b.position.x - a.position.x;
    }
    return b.position.y - a.position.y;
  });

  return board;
}

function compress(): void {
  sortBoard();

  for (const tile of board) {
    if (tile.position.y !== 3) {
      let i = 3;
      let found = false;
      while (i >= tile.position.y - 1) {
        if (board.findIndex((t) => t.position.x === tile.position.x
          && t.position.y === i
          && !t.toBeRemoved) === -1) {
          found = true;
          break;
        }
        i--;
      }
      if (found && i > tile.position.y) {
        document.getElementById(tile.id)?.classList.remove(`tile-pos-${tile.position.x}-${tile.position.y}`);
        document.getElementById(tile.id)?.classList.add(`tile-pos-${tile.position.x}-${i}`);
        tile.position.y = i;

        for (const t of tile.mergeCells) {
          const tl = document.getElementById(t);
          tl?.classList.remove(`tile-pos-${tile.position.x}-${tile.position.y}`);
          tl?.classList.add(`tile-pos-${tile.position.x}-${i}`);
        }
      }
    }
  }
}

function merge(): void {
  sortBoard().forEach((e) => {
    e.isMerged = false;
  });
  for (const tile of board) {
    if (tile.position.y > 0 && !tile.isMerged) {
      const targetIndex = board.findIndex((t) => t.position.x === tile.position.x
        && t.position.y === tile.position.y - 1
        && t.value === tile.value);
      if (targetIndex !== -1) {
        const target = board[targetIndex];
        if (target.isMerged) {
          continue;
        }
        const targetDiv = document.getElementById(target.id);
        targetDiv?.classList.remove(`tile-pos-${target.position.x}-${target.position.y}`);
        targetDiv?.classList.add(`tile-pos-${target.position.x}-${target.position.y + 1}`);
        target.position.y++;
        tile.isMerged = true;
        target.isMerged = true;

        const newTile = {
          id: v4(),
          value: tile.value * 2,
          position: {
            x: target.position.x,
            y: target.position.y,
          },
          isMerged: true,
          isNew: true,
          toBeRemoved: false,
          mergeCells: [
            tile.id,
            target.id,
          ],
        };

        board.push(newTile);

        const newTileElement = document.createElement('div');
        newTileElement.id = newTile.id;
        newTileElement.classList.add('tile', 'new-tile', `tile-pos-${newTile.position.x}-${newTile.position.y}`);
        newTileElement.innerHTML = `<div class="inner-tile" style="
          background-color: ${COLOR_PALETTE[Math.log2(newTile.value)]};
          color: ${newTile.value <= 4 ? '#000' : '#fff'}
        ">${newTile.value}</div>`;
        boardElement?.appendChild(newTileElement);
      }
    }
  }

  const toBeRemoved = board.filter((t) => !t.isNew
    && board.filter((tile) => tile.isNew
      && tile.position.x === t.position.x
      && tile.position.y === t.position.y).length);
  for (const tile of toBeRemoved) {
    tile.toBeRemoved = true;
  }
}

function generateNewTile(): void {
  const emptyTiles = Array(16).fill(0).map((_, i) => ({
    x: Math.floor(i / 4),
    y: i % 4,
  })).filter(({ x, y }) => board.findIndex((t) => t.position.x === x
    && t.position.y === y
    && !t.toBeRemoved) === -1);

  if (emptyTiles.length) {
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const randomTile = emptyTiles[randomIndex];
    const newTile = {
      id: v4(),
      value: [2, 2, 4, 8][Math.floor(randomTile.y / 2)],
      position: {
        x: randomTile.x,
        y: randomTile.y,
      },
      isMerged: false,
      isNew: true,
      toBeRemoved: false,
      mergeCells: [],
    };

    board.push(newTile);

    const newTileElement = document.createElement('div');
    newTileElement.id = newTile.id;
    newTileElement.classList.add('tile', 'new-tile', 'generated-tile', `tile-pos-${newTile.position.x}-${newTile.position.y}`);
    newTileElement.innerHTML = `<div class="inner-tile" style="
      background-color: ${COLOR_PALETTE[Math.log2(newTile.value)]};
      color: ${newTile.value <= 4 ? '#000' : '#fff'}
    ">${newTile.value}</div>`;
    boardElement?.appendChild(newTileElement);
  }
}

for (const tile of board) {
  const div = document.createElement('div');
  div.id = tile.id;
  div.classList.add('tile', `tile-pos-${tile.position.x}-${tile.position.y}`);
  div.innerHTML = `<div class="inner-tile" style="
    background-color: ${COLOR_PALETTE[Math.log2(tile.value)]};
    color: ${tile.value <= 4 ? '#000' : '#fff'}
  ">${tile.value}</div>`;
  boardElement?.appendChild(div);
}

const moveDown = () => {
  board.filter((e) => e.isNew).forEach((e) => {
    document.getElementById(e.id)?.classList.remove('new-tile');
    e.isNew = false;
    e.mergeCells = [];
  });
  board.filter((e) => e.toBeRemoved).forEach((e) => {
    const tile = document.getElementById(e.id);
    tile?.remove();
  });
  board = board.filter((e) => !e.toBeRemoved);

  const lastBoard = JSON.parse(JSON.stringify([...board].sort((a, b) => {
    if (a.position.y === b.position.y) {
      return b.position.x - a.position.x;
    }
    return a.position.y - b.position.y;
  }))).map((e: any) => [e.id, e.position]);

  compress();
  merge();
  compress();

  board = board.sort((a, b) => {
    if (a.position.y === b.position.y) {
      return b.position.x - a.position.x;
    }
    return a.position.y - b.position.y;
  });

  if (JSON.stringify(board.map((e) => [e.id, e.position])) !== JSON.stringify(lastBoard)) {
    generateNewTile();
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    moveDown();
  }
});
