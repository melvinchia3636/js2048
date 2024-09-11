/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

import './style.scss';
import { v4 } from 'uuid';
import anime from 'animejs';
import themes from './themes.json';
import '../lib/swipe-events.min';

type Theme =
  | 'original'
  | 'tailwind dark'
  | 'black & white'
  | 'white & black'
  | 'cyberpunk';

let selectedTheme: Theme =
  (localStorage.getItem('theme') as Theme) ?? 'original';
let bestScore = 0;
let score = 0;
interface Tile {
  id: string;
  value: number;
  position: {
    x: number;
    y: number;
  };
  isMerged: boolean;
  isNew: boolean;
  toBeRemoved: boolean;
  mergeCells: string[];
}

let colorPalette: string[] = themes[selectedTheme].board;

let board: Tile[] = JSON.parse(localStorage.getItem('board') || '[]');

function isLeftRight(direction: 'left' | 'right' | 'up' | 'down'): number {
  return Number(direction === 'left' || direction === 'right');
}

function getYX(direction: 'left' | 'right' | 'up' | 'down'): 'x' | 'y' {
  return ['y', 'x'][isLeftRight(direction)] as 'x' | 'y';
}

function getXY(direction: 'left' | 'right' | 'up' | 'down'): 'x' | 'y' {
  return ['x', 'y'][isLeftRight(direction)] as 'x' | 'y';
}

function isDark(hex: string): boolean {
  const rgb = hex
    .toLowerCase()
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((x) => parseInt(x, 16));
  if (rgb) return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 196;
  return false;
}

function changeTheme(theme: Theme) {
  selectedTheme = theme;
  colorPalette = themes[theme].board;

  localStorage.setItem('theme', theme);

  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.style.backgroundColor = themes[selectedTheme].bg;
  document.body.querySelector('style')!.innerHTML = `
    *, .btn {
      color: ${themes[selectedTheme].fg};
    }
    .btn:hover {
      background-color: ${`${themes[selectedTheme].fg}20`};
    }
    .dropdown-content {
      background-color: ${`${themes[selectedTheme].fg}20`};
    }
  `;

  document.querySelector<HTMLDivElement>(
    '.board-container',
  )!.style.backgroundColor = themes[selectedTheme].color1;
  document
    .querySelectorAll<HTMLDivElement>('.board-grid')
    .forEach((grid: HTMLDivElement) => {
      grid.style.backgroundColor = themes[selectedTheme].color2;
    });

  board.forEach((tile) => {
    document
      .getElementById(tile.id)!
      .querySelector('.inner-tile')!
      .setAttribute(
        'style',
        `
      background-color: ${colorPalette[Math.log2(tile.value) - 1]};
      color: ${
        isDark(colorPalette[Math.log2(tile.value) - 1])
          ? themes[selectedTheme].fg_light
          : themes[selectedTheme].fg_dark
      };
    `,
      );
  });

  document
    .querySelector<HTMLButtonElement>('.selected')!
    .classList.remove('selected');
  document.getElementById(`theme-${theme}`)!.classList.add('selected');

  Array(4)
    .fill(0)
    .forEach((_, i) => {
      document
        .getElementById(`rect-${i + 1}`)!
        .setAttribute('fill', themes[selectedTheme].board[i]);
      document
        .getElementById(`box-text-${i}`)!
        .setAttribute(
          'fill',
          isDark(themes[selectedTheme].board[i])
            ? themes[selectedTheme].fg_light
            : themes[selectedTheme].fg_dark,
        );
    });

  document.getElementById('newgame')!.setAttribute(
    'style',
    `
    background-color: ${themes[selectedTheme].fg};
    color: ${themes[selectedTheme].bg};
  `,
  );
}

function addScore(newScore: number) {
  anime({
    targets: '#score',
    innerHTML: [score, score + newScore],
    round: 1,
    easing: 'easeInOutExpo',
  });
  score += newScore;
  if (score > bestScore) {
    anime({
      targets: '#best-score',
      innerHTML: [bestScore, score],
      round: 1,
      easing: 'easeInOutExpo',
    });
    bestScore = score;
    localStorage.setItem('bestScore', JSON.stringify(bestScore));
  }
  localStorage.setItem('score', JSON.stringify(score));
}

function newGame() {
  anime({
    targets: '#score',
    innerHTML: [score, 0],
    round: 1,
    easing: 'easeInOutExpo',
  });

  score = 0;
  board = [];

  document.querySelectorAll('.tile').forEach((e) => e.remove());

  generateNewTile(2);
  generateNewTile(2);

  localStorage.setItem('score', JSON.stringify(score));
  localStorage.setItem('board', JSON.stringify(board));
}

// @ts-ignore
window.changeTheme = changeTheme;
// @ts-ignore
window.newGame = newGame;

function initBoard() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.style.backgroundColor = themes[selectedTheme].bg;
  const style = document.createElement('style');
  style.innerHTML = `
    *, .btn {
      color: ${themes[selectedTheme].fg};
    }
    .btn:hover {
      background-color: ${`${themes[selectedTheme].fg}20`};
    }
    .dropdown-content {
      background-color: ${`${themes[selectedTheme].fg}20`};
    }
  `;
  document.body.appendChild(style);

  app.innerHTML = `
    <nav class="w-full flex justify-between items-center p-8 z-[9999]">
      <svg class="text-slate-800 dark:text-slate-200 w-36" width="563" viewBox="0 0 563 168" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect y="19" width="68" height="68" rx="9" fill="${
          themes[selectedTheme].board[0]
        }" id="rect-1"/>
        <rect x="80" y="19" width="68" height="68" rx="9" fill="${
          themes[selectedTheme].board[1]
        }" id="rect-2"/>
        <rect y="100" width="68" height="68" rx="9" fill="${
          themes[selectedTheme].board[2]
        }" id="rect-3"/>
        <rect x="80" y="100" width="68" height="68" rx="9" fill="${
          themes[selectedTheme].board[3]
        }" id="rect-4"/>
        <path d="M26.528 65V61.352L34.432 53.16C35.2427 52.3067 35.84 51.5067 36.224 50.76C36.6293 49.992 36.832 49.2347 36.832 48.488C36.832 47.3573 36.5227 46.4827 35.904 45.864C35.2853 45.224 34.4533 44.904 33.408 44.904C32.3413 44.904 31.488 45.2347 30.848 45.896C30.208 46.536 29.888 47.432 29.888 48.584H25.888C25.9093 47.0907 26.2293 45.8107 26.848 44.744C27.488 43.656 28.3627 42.8133 29.472 42.216C30.6027 41.6187 31.936 41.32 33.472 41.32C34.9653 41.32 36.256 41.608 37.344 42.184C38.4533 42.7387 39.3067 43.528 39.904 44.552C40.5227 45.576 40.832 46.8027 40.832 48.232C40.832 49.4693 40.512 50.696 39.872 51.912C39.2533 53.1067 38.2507 54.408 36.864 55.816L31.424 61.384H41.12V65H26.528Z" id="box-text-0" fill="${
          isDark(themes[selectedTheme].board[0])
            ? themes[selectedTheme].fg_light
            : themes[selectedTheme].fg_dark
        }"/>
        <path d="M113.6 65.32C112.085 65.32 110.773 65.032 109.664 64.456C108.555 63.88 107.691 63.0693 107.072 62.024C106.475 60.9787 106.176 59.752 106.176 58.344V48.296C106.176 46.888 106.475 45.6613 107.072 44.616C107.691 43.5707 108.555 42.76 109.664 42.184C110.773 41.608 112.085 41.32 113.6 41.32C115.136 41.32 116.448 41.608 117.536 42.184C118.645 42.76 119.499 43.5707 120.096 44.616C120.715 45.6613 121.024 46.888 121.024 48.296V58.344C121.024 59.752 120.715 60.9787 120.096 62.024C119.499 63.0693 118.645 63.88 117.536 64.456C116.427 65.032 115.115 65.32 113.6 65.32ZM113.6 61.864C114.709 61.864 115.595 61.544 116.256 60.904C116.917 60.264 117.248 59.4107 117.248 58.344V48.296C117.248 47.2293 116.917 46.376 116.256 45.736C115.595 45.096 114.709 44.776 113.6 44.776C112.491 44.776 111.605 45.096 110.944 45.736C110.283 46.376 109.952 47.2293 109.952 48.296V58.344C109.952 59.4107 110.283 60.264 110.944 60.904C111.605 61.544 112.491 61.864 113.6 61.864ZM113.6 55.4C112.981 55.4 112.469 55.1973 112.064 54.792C111.68 54.3867 111.488 53.864 111.488 53.224C111.488 52.584 111.68 52.072 112.064 51.688C112.448 51.304 112.96 51.112 113.6 51.112C114.24 51.112 114.752 51.304 115.136 51.688C115.52 52.072 115.712 52.584 115.712 53.224C115.712 53.864 115.52 54.3867 115.136 54.792C114.752 55.1973 114.24 55.4 113.6 55.4Z" id="box-text-1" fill="${
          isDark(themes[selectedTheme].board[1])
            ? themes[selectedTheme].fg_light
            : themes[selectedTheme].fg_dark
        }"/>
        <path d="M36.224 146V141.36H25.856V135.568L34.528 122.64H38.944L29.696 136.592V137.84H36.224V132.56H40.256V146H36.224Z" id="box-text-2" fill="${
          isDark(themes[selectedTheme].board[2])
            ? themes[selectedTheme].fg_light
            : themes[selectedTheme].fg_dark
        }"/>
        <path d="M113.6 146.32C112.021 146.32 110.645 146.053 109.472 145.52C108.299 144.987 107.381 144.24 106.72 143.28C106.059 142.32 105.728 141.221 105.728 139.984C105.728 138.555 106.187 137.296 107.104 136.208C108.021 135.12 109.237 134.267 110.752 133.648L114.336 132.176C115.125 131.835 115.765 131.355 116.256 130.736C116.768 130.117 117.024 129.435 117.024 128.688C117.024 127.813 116.704 127.099 116.064 126.544C115.445 125.968 114.624 125.68 113.6 125.68C112.576 125.68 111.744 125.968 111.104 126.544C110.464 127.099 110.144 127.813 110.144 128.688C110.144 129.435 110.389 130.117 110.88 130.736C111.392 131.333 112.043 131.803 112.832 132.144L116.384 133.616C118.005 134.299 119.253 135.184 120.128 136.272C121.024 137.36 121.472 138.597 121.472 139.984C121.472 141.264 121.141 142.384 120.48 143.344C119.819 144.283 118.901 145.019 117.728 145.552C116.555 146.064 115.179 146.32 113.6 146.32ZM113.6 142.928C114.752 142.928 115.701 142.619 116.448 142C117.195 141.36 117.568 140.56 117.568 139.6C117.568 138.832 117.291 138.117 116.736 137.456C116.203 136.773 115.52 136.251 114.688 135.888L110.88 134.256C109.408 133.637 108.267 132.837 107.456 131.856C106.645 130.875 106.24 129.744 106.24 128.464C106.24 127.291 106.549 126.245 107.168 125.328C107.787 124.389 108.64 123.653 109.728 123.12C110.837 122.587 112.128 122.32 113.6 122.32C115.072 122.32 116.352 122.587 117.44 123.12C118.549 123.653 119.403 124.389 120 125.328C120.619 126.245 120.928 127.291 120.928 128.464C120.928 129.765 120.523 130.907 119.712 131.888C118.923 132.869 117.792 133.669 116.32 134.288L112.48 135.92C111.648 136.261 110.965 136.773 110.432 137.456C109.899 138.117 109.632 138.821 109.632 139.568C109.632 140.549 110.005 141.36 110.752 142C111.499 142.619 112.448 142.928 113.6 142.928Z" id="box-text-3" fill="${
          isDark(themes[selectedTheme].board[3])
            ? themes[selectedTheme].fg_light
            : themes[selectedTheme].fg_dark
        }"/>
        <path d="M191.663 99V87.942L215.622 63.11C218.079 60.5233 219.89 58.0983 221.054 55.835C222.283 53.507 222.897 51.2113 222.897 48.948C222.897 45.5207 221.959 42.8693 220.084 40.994C218.209 39.054 215.687 38.084 212.518 38.084C209.285 38.084 206.698 39.0863 204.758 41.091C202.818 43.031 201.848 45.747 201.848 49.239H189.723C189.788 44.7123 190.758 40.8323 192.633 37.599C194.573 34.301 197.224 31.7467 200.587 29.936C204.014 28.1253 208.056 27.22 212.712 27.22C217.239 27.22 221.151 28.093 224.449 29.839C227.812 31.5203 230.398 33.913 232.209 37.017C234.084 40.121 235.022 43.8393 235.022 48.172C235.022 51.9227 234.052 55.641 232.112 59.327C230.237 62.9483 227.197 66.893 222.994 71.161L206.504 88.039H235.895V99H191.663ZM271.262 99.97C266.671 99.97 262.694 99.097 259.331 97.351C255.968 95.605 253.349 93.1477 251.474 89.979C249.663 86.8103 248.758 83.092 248.758 78.824V48.366C248.758 44.098 249.663 40.3797 251.474 37.211C253.349 34.0423 255.968 31.585 259.331 29.839C262.694 28.093 266.671 27.22 271.262 27.22C275.918 27.22 279.895 28.093 283.193 29.839C286.556 31.585 289.142 34.0423 290.953 37.211C292.828 40.3797 293.766 44.098 293.766 48.366V78.824C293.766 83.092 292.828 86.8103 290.953 89.979C289.142 93.1477 286.556 95.605 283.193 97.351C279.83 99.097 275.853 99.97 271.262 99.97ZM271.262 89.494C274.625 89.494 277.308 88.524 279.313 86.584C281.318 84.644 282.32 82.0573 282.32 78.824V48.366C282.32 45.1327 281.318 42.546 279.313 40.606C277.308 38.666 274.625 37.696 271.262 37.696C267.899 37.696 265.216 38.666 263.211 40.606C261.206 42.546 260.204 45.1327 260.204 48.366V78.824C260.204 82.0573 261.206 84.644 263.211 86.584C265.216 88.524 267.899 89.494 271.262 89.494ZM271.262 69.9C269.387 69.9 267.835 69.2857 266.606 68.057C265.442 66.8283 264.86 65.244 264.86 63.304C264.86 61.364 265.442 59.812 266.606 58.648C267.77 57.484 269.322 56.902 271.262 56.902C273.202 56.902 274.754 57.484 275.918 58.648C277.082 59.812 277.664 61.364 277.664 63.304C277.664 65.244 277.082 66.8283 275.918 68.057C274.754 69.2857 273.202 69.9 271.262 69.9ZM337.378 99V84.935H305.95V67.378L332.237 28.19H345.623L317.59 70.482V74.265H337.378V58.26H349.6V99H337.378ZM387.586 99.97C382.801 99.97 378.63 99.1617 375.073 97.545C371.517 95.9283 368.736 93.665 366.731 90.755C364.727 87.845 363.724 84.5147 363.724 80.764C363.724 76.4313 365.115 72.616 367.895 69.318C370.676 66.02 374.362 63.4333 378.953 61.558L389.817 57.096C392.21 56.0613 394.15 54.6063 395.637 52.731C397.189 50.8557 397.965 48.7863 397.965 46.523C397.965 43.8717 396.995 41.7053 395.055 40.024C393.18 38.278 390.69 37.405 387.586 37.405C384.482 37.405 381.96 38.278 380.02 40.024C378.08 41.7053 377.11 43.8717 377.11 46.523C377.11 48.7863 377.854 50.8557 379.341 52.731C380.893 54.5417 382.866 55.9643 385.258 56.999L396.025 61.461C400.94 63.5303 404.723 66.214 407.374 69.512C410.09 72.81 411.448 76.5607 411.448 80.764C411.448 84.644 410.446 88.039 408.441 90.949C406.437 93.7943 403.656 96.0253 400.099 97.642C396.543 99.194 392.372 99.97 387.586 99.97ZM387.586 89.688C391.078 89.688 393.956 88.7503 396.219 86.875C398.483 84.935 399.614 82.51 399.614 79.6C399.614 77.272 398.774 75.1057 397.092 73.101C395.476 71.0317 393.406 69.4473 390.884 68.348L379.341 63.401C374.879 61.5257 371.42 59.1007 368.962 56.126C366.505 53.1513 365.276 49.724 365.276 45.844C365.276 42.2873 366.214 39.1187 368.089 36.338C369.965 33.4927 372.551 31.2617 375.849 29.645C379.212 28.0283 383.124 27.22 387.586 27.22C392.048 27.22 395.928 28.0283 399.226 29.645C402.589 31.2617 405.176 33.4927 406.986 36.338C408.862 39.1187 409.799 42.2873 409.799 45.844C409.799 49.7887 408.571 53.2483 406.113 56.223C403.721 59.1977 400.293 61.6227 395.831 63.498L384.191 68.445C381.669 69.4797 379.6 71.0317 377.983 73.101C376.367 75.1057 375.558 77.2397 375.558 79.503C375.558 82.4777 376.69 84.935 378.953 86.875C381.217 88.7503 384.094 89.688 387.586 89.688Z" fill="currentColor"/>
        <path d="M194.954 155V129.086H186.932V124.34H208.268V129.086H200.246V155H194.954ZM213.418 155V124.34H218.668V131.9L218.542 136.31H219.97L218.542 137.528C218.542 135.652 219.088 134.182 220.18 133.118C221.3 132.026 222.826 131.48 224.758 131.48C227.026 131.48 228.832 132.236 230.176 133.748C231.548 135.26 232.234 137.29 232.234 139.838V155H226.984V140.384C226.984 138.984 226.62 137.906 225.892 137.15C225.164 136.394 224.156 136.016 222.868 136.016C221.552 136.016 220.516 136.408 219.76 137.192C219.032 137.976 218.668 139.096 218.668 140.552V155H213.418ZM248.009 155.42C246.049 155.42 244.341 155.042 242.885 154.286C241.429 153.53 240.295 152.48 239.483 151.136C238.699 149.764 238.307 148.168 238.307 146.348V140.552C238.307 138.732 238.699 137.15 239.483 135.806C240.295 134.434 241.429 133.37 242.885 132.614C244.341 131.858 246.049 131.48 248.009 131.48C249.941 131.48 251.621 131.858 253.049 132.614C254.505 133.37 255.625 134.434 256.409 135.806C257.221 137.15 257.627 138.732 257.627 140.552V144.71H243.389V146.348C243.389 147.972 243.781 149.204 244.565 150.044C245.349 150.856 246.511 151.262 248.051 151.262C249.227 151.262 250.179 151.066 250.907 150.674C251.635 150.254 252.097 149.652 252.293 148.868H257.459C257.067 150.856 256.003 152.452 254.267 153.656C252.559 154.832 250.473 155.42 248.009 155.42ZM252.545 141.77V140.51C252.545 138.914 252.167 137.696 251.411 136.856C250.655 135.988 249.521 135.554 248.009 135.554C246.497 135.554 245.349 135.988 244.565 136.856C243.781 137.724 243.389 138.956 243.389 140.552V141.434L252.923 141.35L252.545 141.77ZM300.854 155C298.698 155 296.976 154.384 295.688 153.152C294.428 151.892 293.798 150.198 293.798 148.07V136.646H287.54V131.9H293.798V125.39H299.09V131.9H307.952V136.646H299.09V147.944C299.09 148.616 299.272 149.176 299.636 149.624C300.028 150.044 300.56 150.254 301.232 150.254H307.532V155H300.854ZM314.11 155V150.254H322.006V136.646H314.95V131.9H327.256V150.254H334.354V155H314.11ZM324.274 128.036C323.21 128.036 322.37 127.77 321.754 127.238C321.138 126.678 320.83 125.936 320.83 125.012C320.83 124.088 321.138 123.36 321.754 122.828C322.37 122.268 323.21 121.988 324.274 121.988C325.338 121.988 326.178 122.268 326.794 122.828C327.41 123.36 327.718 124.088 327.718 125.012C327.718 125.936 327.41 126.678 326.794 127.238C326.178 127.77 325.338 128.036 324.274 128.036ZM352.44 155C350.928 155 349.598 154.692 348.45 154.076C347.33 153.46 346.448 152.592 345.804 151.472C345.16 150.324 344.838 149.008 344.838 147.524V129.086H337.236V124.34H350.088V147.398C350.088 148.266 350.326 148.966 350.802 149.498C351.306 150.002 351.978 150.254 352.818 150.254H359.58V155H352.44ZM373.927 155.42C371.967 155.42 370.259 155.042 368.803 154.286C367.347 153.53 366.213 152.48 365.401 151.136C364.617 149.764 364.225 148.168 364.225 146.348V140.552C364.225 138.732 364.617 137.15 365.401 135.806C366.213 134.434 367.347 133.37 368.803 132.614C370.259 131.858 371.967 131.48 373.927 131.48C375.859 131.48 377.539 131.858 378.967 132.614C380.423 133.37 381.543 134.434 382.327 135.806C383.139 137.15 383.545 138.732 383.545 140.552V144.71H369.307V146.348C369.307 147.972 369.699 149.204 370.483 150.044C371.267 150.856 372.429 151.262 373.969 151.262C375.145 151.262 376.097 151.066 376.825 150.674C377.553 150.254 378.015 149.652 378.211 148.868H383.377C382.985 150.856 381.921 152.452 380.185 153.656C378.477 154.832 376.391 155.42 373.927 155.42ZM378.463 141.77V140.51C378.463 138.914 378.085 137.696 377.329 136.856C376.573 135.988 375.439 135.554 373.927 135.554C372.415 135.554 371.267 135.988 370.483 136.856C369.699 137.724 369.307 138.956 369.307 140.552V141.434L378.841 141.35L378.463 141.77ZM414.886 162.56V131.9H420.01V136.058H421.186L419.716 138.746C419.716 136.478 420.318 134.7 421.522 133.412C422.726 132.124 424.336 131.48 426.352 131.48C428.648 131.48 430.482 132.278 431.854 133.874C433.226 135.47 433.912 137.612 433.912 140.3V146.558C433.912 148.35 433.59 149.918 432.946 151.262C432.33 152.578 431.462 153.6 430.342 154.328C429.222 155.056 427.892 155.42 426.352 155.42C424.336 155.42 422.726 154.776 421.522 153.488C420.318 152.172 419.716 150.394 419.716 148.154L421.186 150.842H420.01L420.136 156.092V162.56H414.886ZM424.42 150.884C425.764 150.884 426.8 150.492 427.528 149.708C428.284 148.924 428.662 147.804 428.662 146.348V140.552C428.662 139.096 428.284 137.976 427.528 137.192C426.8 136.408 425.764 136.016 424.42 136.016C423.076 136.016 422.026 136.422 421.27 137.234C420.514 138.046 420.136 139.194 420.136 140.678V146.222C420.136 147.706 420.514 148.854 421.27 149.666C422.026 150.478 423.076 150.884 424.42 150.884ZM449.436 155.42C446.496 155.42 444.186 154.608 442.506 152.984C440.826 151.332 439.986 149.092 439.986 146.264V131.9H445.236V146.222C445.236 147.706 445.6 148.854 446.328 149.666C447.056 150.45 448.092 150.842 449.436 150.842C450.752 150.842 451.774 150.45 452.502 149.666C453.258 148.854 453.636 147.706 453.636 146.222V131.9H458.886V146.264C458.886 149.092 458.032 151.332 456.324 152.984C454.616 154.608 452.32 155.42 449.436 155.42ZM465.296 155V150.254L477.35 136.52H465.674V131.9H483.482V136.646L471.302 150.38H483.944V155H465.296ZM490.479 155V150.254L502.533 136.52H490.857V131.9H508.665V136.646L496.485 150.38H509.127V155H490.479ZM528.725 155C527.213 155 525.883 154.692 524.735 154.076C523.615 153.46 522.733 152.592 522.089 151.472C521.445 150.324 521.123 149.008 521.123 147.524V129.086H513.521V124.34H526.373V147.398C526.373 148.266 526.611 148.966 527.087 149.498C527.591 150.002 528.263 150.254 529.103 150.254H535.865V155H528.725ZM550.212 155.42C548.252 155.42 546.544 155.042 545.088 154.286C543.632 153.53 542.498 152.48 541.686 151.136C540.902 149.764 540.51 148.168 540.51 146.348V140.552C540.51 138.732 540.902 137.15 541.686 135.806C542.498 134.434 543.632 133.37 545.088 132.614C546.544 131.858 548.252 131.48 550.212 131.48C552.144 131.48 553.824 131.858 555.252 132.614C556.708 133.37 557.828 134.434 558.612 135.806C559.424 137.15 559.83 138.732 559.83 140.552V144.71H545.592V146.348C545.592 147.972 545.984 149.204 546.768 150.044C547.552 150.856 548.714 151.262 550.254 151.262C551.43 151.262 552.382 151.066 553.11 150.674C553.838 150.254 554.3 149.652 554.496 148.868H559.662C559.27 150.856 558.206 152.452 556.47 153.656C554.762 154.832 552.676 155.42 550.212 155.42ZM554.748 141.77V140.51C554.748 138.914 554.37 137.696 553.614 136.856C552.858 135.988 551.724 135.554 550.212 135.554C548.7 135.554 547.552 135.988 546.768 136.856C545.984 137.724 545.592 138.956 545.592 140.552V141.434L555.126 141.35L554.748 141.77Z" fill="currentColor"/>
      </svg>
      <div class="flex items-center mt-1">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn capitalize bg-transparent border-none flex items-center gap-2">
            <span class="iconify" data-icon="heroicons-outline:color-swatch" data-width="22"></span>
            <span class="hidden sm:inline">Theme</span>
            <span class="iconify" data-icon="uil:angle-down" data-width="24"></span>
          </label>
          <div tabindex="0" class="dropdown-content translate-x-16 sm:translate-x-0 p-2 shadow rounded-box w-80 sm:w-96 flex flex-col gap-2">
            ${Object.entries(themes)
              .map(
                ([name, theme]) => `
              <button onclick="changeTheme('${name}')" id="theme-${name}" class="rounded-lg !flex flex-row items-center justify-between p-4 ${
                  name === selectedTheme && 'selected'
                }" style="
                background-color: ${theme.bg};
                outline-color: ${`${theme.fg}60`};
              ">
                <p class="capitalize text-sm" style="
                  color: ${theme.fg};
                ">${name}</p>
                <div class="flex items-center gap-1">
                  ${theme.board
                    .map(
                      (e) => `
                    <span class="w-2 h-6 rounded-full" style="
                      background-color: ${e};
                    "></span>
                  `,
                    )
                    .join('')}
                </div>
              </button>
            `,
              )
              .join('')}
          </div>
        </div>
        <a href="https://github.com/melvinchia3636/js2048" target="_blank" class="btn capitalize bg-transparent border-none">
          <span class="iconify" data-icon="uil:github" data-width="24"></span>
        </a>
      </div>
    </nav>
    <div class="flex flex-col flex-1 w-full items-center justify-center">
    <div class="flex items-center justify-between mb-4 w-[21rem] flex-col sm:flex-row sm:w-[29rem] gap-4">
      <div class="flex items-center gap-12 w-full sm:w-auto">
        <div class="flex flex-col gap-1">
          <span class="text-xs">Score</span>
          <span id="score" class="text-2xl">${score}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs">Best</span>
          <span id="best-score" class="text-2xl">${bestScore}</span>
        </div>
      </div>
      <button id="newgame" onclick="newGame()" class="btn px-8 capitalize w-full sm:w-auto" style="
        background-color: ${themes[selectedTheme].fg};
        color: ${themes[selectedTheme].bg};
      ">new game</button>
    </div>
    <div class="board-container w-[21rem] sm:w-[29rem] h-[21rem] sm:h-[29rem] flex items-center justify-center rounded-lg" style="background-color: ${
      themes[selectedTheme].color1
    }">
      <div id="board" class="w-[20rem] sm:w-[28rem] h-[20rem] sm:h-[28rem] relative grid grid-cols-4 overflow-hidden items-center justify-center">
        ${Array(16)
          .fill(0)
          .map(
            () =>
              `<div class="w-[4.4rem] sm:w-24 h-[4.4rem] sm:h-24 board-grid rounded-md m-1 sm:m-2 border-yellow-400" style="background-color: ${themes[selectedTheme].color2}"></div>`,
          )
          .join('')}
      </div>
    </div>
    </div>
    <p class="w-full px-8 mt-8 mb-8 text-xs text-center">
    <span class="inline-block text-base tracking-widest font-semibold opacity-50 mb-2">&lt;CODEBLOG/&gt;</span>
    <br/>
      Made with 💖 by <a href="https://thecodeblog.net" class="underline">Melvin Chia</a>. Project under MIT License.
    </p>
  `;

  if (localStorage.getItem('score')) {
    score = Number(localStorage.getItem('score'));
    anime({
      targets: '#score',
      innerHTML: [0, score],
      round: 1,
      easing: 'easeInOutExpo',
    });
  }

  if (localStorage.getItem('bestScore')) {
    bestScore = Number(localStorage.getItem('bestScore'));
    anime({
      targets: '#best-score',
      innerHTML: [0, bestScore],
      round: 1,
      easing: 'easeInOutExpo',
    });
  }

  const boardElement = document.getElementById('board')!;
  return boardElement;
}

function sortBoard(direction: 'up' | 'down' | 'left' | 'right'): Tile[] {
  if (direction === 'up' || direction === 'down') {
    board.sort((a, b) => {
      if (a.position.y === b.position.y) {
        return b.position.x - a.position.x;
      }
      return direction === 'down'
        ? b.position.y - a.position.y
        : a.position.y - b.position.y;
    });
  } else {
    board.sort((a, b) => {
      if (a.position.x === b.position.x) {
        return b.position.y - a.position.y;
      }
      return direction === 'right'
        ? b.position.x - a.position.x
        : a.position.x - b.position.x;
    });
  }

  return board;
}

function createNewTile(tile: Tile, isGenerated: boolean): HTMLDivElement {
  const newTileElement = document.createElement('div');
  newTileElement.id = tile.id;
  newTileElement.classList.add(
    'tile',
    isGenerated ? 'generated-tile' : 'new-tile',
    `tile-pos-${tile.position.x}-${tile.position.y}`,
  );
  newTileElement.innerHTML = `<div class="inner-tile text-slate-100" style="
    background-color: ${colorPalette[Math.log2(tile.value) - 1]};
    color: ${
      isDark(colorPalette[Math.log2(tile.value) - 1])
        ? themes[selectedTheme].fg_light
        : themes[selectedTheme].fg_dark
    };
  ">${tile.value}</div>`;
  boardElement?.appendChild(newTileElement);

  return newTileElement;
}

function compress(direction: 'up' | 'down' | 'left' | 'right'): void {
  sortBoard(direction);

  for (const tile of board) {
    if (
      tile.position[getYX(direction)] !==
      (['left', 'up'].includes(direction) ? 0 : 3)
    ) {
      let i = ['left', 'up'].includes(direction) ? 0 : 3;
      let found = false;
      while (
        ['left', 'up'].includes(direction)
          ? i <= tile.position[getYX(direction)] + 1
          : i >= tile.position[getYX(direction)] - 1
      ) {
        if (
          board.findIndex(
            (t) =>
              t.position[['x', 'y'][isLeftRight(direction)] as 'x' | 'y'] ===
                tile.position[
                  ['x', 'y'][isLeftRight(direction)] as 'x' | 'y'
                ] &&
              t.position[getYX(direction)] === i &&
              !t.toBeRemoved,
          ) === -1
        ) {
          found = true;
          break;
        }
        i += ['left', 'up'].includes(direction) ? 1 : -1;
      }

      if (
        found &&
        (['left', 'up'].includes(direction)
          ? i < tile.position[getYX(direction)]
          : i > tile.position[getYX(direction)])
      ) {
        document
          .getElementById(tile.id)
          ?.classList.remove(`tile-pos-${tile.position.x}-${tile.position.y}`);
        document
          .getElementById(tile.id)
          ?.classList.add(
            `tile-pos-${
              ['left', 'right'].includes(direction) ? i : tile.position.x
            }-${['left', 'right'].includes(direction) ? tile.position.y : i}`,
          );
        tile.position[getYX(direction)] = i;

        for (const t of tile.mergeCells) {
          const tl = document.getElementById(t);
          tl?.classList.remove(
            `tile-pos-${tile.position.x}-${tile.position.y}`,
          );
          tl?.classList.add(
            `tile-pos-${
              ['left', 'right'].includes(direction) ? i : tile.position.x
            }-${['left', 'right'].includes(direction) ? tile.position.y : i}`,
          );
        }
      }
    }
  }
}

function merge(direction: 'up' | 'down' | 'left' | 'right'): void {
  sortBoard(direction).forEach((e) => {
    e.isMerged = false;
  });
  for (const tile of board) {
    if (
      (['left', 'up'].includes(direction)
        ? tile.position[getYX(direction)] < 3
        : tile.position[getYX(direction)] > 0) &&
      !tile.isMerged
    ) {
      const targetIndex = board.findIndex(
        (t) =>
          t.position[getXY(direction)] === tile.position[getXY(direction)] &&
          t.position[getYX(direction)] ===
            tile.position[getYX(direction)] -
              (['left', 'up'].includes(direction) ? -1 : 1) &&
          t.value === tile.value,
      );
      if (targetIndex !== -1) {
        const target = board[targetIndex];
        if (target.isMerged) {
          continue;
        }
        const targetDiv = document.getElementById(target.id);

        targetDiv?.classList.remove(
          `tile-pos-${target.position.x}-${target.position.y}`,
        );
        targetDiv?.classList.add(
          `tile-pos-${
            target.position.x +
            (['left', 'right'].includes(direction)
              ? [1, -1][Number(direction === 'left')]
              : 0)
          }-${
            target.position.y +
            (['up', 'down'].includes(direction)
              ? [1, -1][Number(direction === 'up')]
              : 0)
          }`,
        );
        target.position[getYX(direction)] += ['left', 'up'].includes(direction)
          ? -1
          : 1;

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
          mergeCells: [tile.id, target.id],
        };

        board.push(newTile);
        addScore(tile.value * 2);

        createNewTile(newTile, false);
      }
    }
  }

  const toBeRemoved = board.filter(
    (t) =>
      !t.isNew &&
      board.filter(
        (tile) =>
          tile.isNew &&
          tile.position.x === t.position.x &&
          tile.position.y === t.position.y,
      ).length,
  );
  for (const tile of toBeRemoved) {
    tile.toBeRemoved = true;
  }
}

function generateNewTile(value?: number): void {
  const emptyTiles = Array(16)
    .fill(0)
    .map((_, i) => ({
      x: Math.floor(i / 4),
      y: i % 4,
    }))
    .filter(
      ({ x, y }) =>
        board.findIndex(
          (t) => t.position.x === x && t.position.y === y && !t.toBeRemoved,
        ) === -1,
    );

  if (emptyTiles.length) {
    const randomIndex = Math.floor(Math.random() * emptyTiles.length);
    const randomTile = emptyTiles[randomIndex];
    const newTile = {
      id: v4(),
      value:
        value ?? [2, 2, 2, 2, 2, 2, 2, 2, 2, 4][Math.floor(Math.random() * 10)],
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

    createNewTile(newTile, true);
  }
}

const move = (direction: 'left' | 'right' | 'up' | 'down') => {
  board
    .filter((e) => e.isNew)
    .forEach((e) => {
      document.getElementById(e.id)?.classList.remove('new-tile');
      e.isNew = false;
      e.mergeCells = [];
    });
  board
    .filter((e) => e.toBeRemoved)
    .forEach((e) => {
      const tile = document.getElementById(e.id);
      tile?.remove();
    });
  board = board.filter((e) => !e.toBeRemoved);

  const lastBoard = JSON.parse(JSON.stringify(sortBoard(direction))).map(
    (e: any) => [e.id, e.position],
  );

  compress(direction);
  merge(direction);
  compress(direction);

  sortBoard(direction);

  if (
    JSON.stringify(board.map((e) => [e.id, e.position])) !==
    JSON.stringify(lastBoard)
  ) {
    generateNewTile();
  }

  localStorage.setItem('board', JSON.stringify(board));
};

const boardElement = initBoard();

if (!board.length) {
  generateNewTile(2);
  generateNewTile(2);
} else {
  board.forEach((e) => createNewTile(e, true));
}

window.addEventListener('load', () => {
  setTimeout(() => {
    // This hides the address bar:
    window.scrollTo(0, 1);
  }, 0);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    move('down');
  }

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    move('right');
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    move('left');
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    move('up');
  }
});

document.addEventListener('swiped-left', (e) => {
  e.preventDefault();
  move('left');
});

document.addEventListener('swiped-right', (e) => {
  e.preventDefault();
  move('right');
});

document.addEventListener('swiped-up', (e) => {
  e.preventDefault();
  move('up');
});

document.addEventListener('swiped-down', (e) => {
  e.preventDefault();
  move('down');
});
