import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { BLOCK_SIZE, colorMap, FIELD_SIZE, keyEventCodeMap } from '../../../../constants';
import { Figure, IFigure } from '../../../figure/components/figure/figure.component';
import { GameService } from '../../../game/services/game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  // Get reference to the canvas.
  @ViewChild('board', {static: true})
  canvas!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;
  points: number = 0; // Очки в текущем раунде
  pointsBonus: number = 1;
  maxPoints: number = 0; // Максимальное число очков за игру
  board!: number[][]; // Игровое поле
  figure!: Figure; // Игрок
  requestId!: number; // Значение requestId может быть использовано для отмены анимации:

  gemaStarted: boolean = false;
  theEnd: boolean = false; // Признак окончания раунда
  modalText: string = 'Вы проиграли'; // Текст выводимый при победе или поражении
  winGame: boolean = false; // Признак победы
  timeToEnd: number = 0; // Время до окончания раунда
  timerId!: number[]; // Id таймеров, который запускает игровой цикл
  valueProgressBar: number = 100; // Значение прогресс бара

  numberOfVegetables: number = 10; // Число овощей генерируемых на поле
  numberOfBonuses: number = 1; // Число бонусов генерируем на поле
  numberOfTime: number = 10 * 1000; // Время которое длиться раунд в мс
  playingFieldSize: number = 20; // Размер игрового поля

  // Устанавливаем значения из Input
  setOptions(event: any): void {
    if (Number(event.target.numberOfVegetables.value) >= 5 && Number(event.target.numberOfVegetables.value) <= 15) {
      this.numberOfVegetables = Number(event.target.numberOfVegetables.value);
    }
    if (Number(event.target.numberOfBonuses.value) >= 0 && Number(event.target.numberOfBonuses.value) <= 3) {
      this.numberOfBonuses = Number(event.target.numberOfBonuses.value);
    }
    if (Number(event.target.numberOfTime.value) >= 3 && Number(event.target.numberOfTime.value) <= 20) {
      this.numberOfTime = Number(event.target.numberOfTime.value) * 1000;
    }
    if (Number(event.target.playingFieldSize.value) >= 10 && Number(event.target.playingFieldSize.value) <= 40) {
      this.playingFieldSize = Number(event.target.playingFieldSize.value);
    }
    console.log(this.numberOfVegetables, this.numberOfBonuses, this.numberOfTime, this.playingFieldSize);
  }

  // Передвижения, которые может выполнять игрок
  moves = {
    [keyEventCodeMap.ArrowLeft]: (f: IFigure): IFigure => ({...f, x: f.x - 1}),
    [keyEventCodeMap.ArrowRight]: (f: IFigure): IFigure => ({...f, x: f.x + 1}),
    [keyEventCodeMap.ArrowUp]: (f: IFigure): IFigure => ({...f, y: f.y - 1}),
    [keyEventCodeMap.ArrowDown]: (f: IFigure): IFigure => ({...f, y: f.y + 1}),
  };

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code === keyEventCodeMap.Enter) {
      this.play();
    }
    if (event.code === keyEventCodeMap.Escape) {
      this.gameOver();// @ts-ignore
    } else if (this.moves[event.code]) {
      // If the keyCode exists in our moves stop the event from bubbling.
      event.preventDefault();
      // Get the next state of the piece.
      const f = this.moves[event.code](this.figure);
      // Move the piece
      if (this.service.valid(f)) {
        this.pickUpElement(f);

        f.color = colorMap.gardener;
        this.board[this.figure.spawnPositionY][this.figure.spawnPositionX] = 2;
        // сравниваем координаты игрока и дома
        if (this.service.uniteHomeAndGardener(f)) {
          f.color = colorMap.homeWithGardener;
          this.board[this.figure.spawnPositionY][this.figure.spawnPositionX] = 1;
        }

        this.figure.move(f);
        if (this.service.finishTheGame(f, this.points)) {
          this.gameOver();
        }
      }
      // Clear the old position before drawing
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  constructor(private service: GameService) {
  }

  ngOnInit() {
  }

  // Задаём размеры игрового поля
  initBoard() {
    // Получаем 2D-контекст, который мы используем.
    // @ts-ignore
    this.ctx = this.canvas.nativeElement.getContext('2d');

    // Рассчитываем размер холста.
    this.ctx.canvas.width = this.playingFieldSize * BLOCK_SIZE;
    this.ctx.canvas.height = this.playingFieldSize * BLOCK_SIZE;
    // Scale so we don't need to give size on every draw.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  // Запускаем игру
  play() {
    if (this.gemaStarted) {
      return;
    }
    this.gemaStarted = true;
    this.initBoard(); // Инициализируем тут, потому что в следующем раунде размер игрового поля может поменяться
    // Сбрасываем значения с прошлой игры
    this.theEnd = false;
    this.points = 0;
    this.modalText = 'Вы проиграли';
    this.pointsBonus = 1;
    this.winGame = false;
    this.timerId = [];

    this.gemaStarted = true;
    this.board = this.getEmptyBoard();
    this.figure = new Figure(this.ctx);
    this.figure.spawn(this.playingFieldSize);
    this.generatedHomePosition(this.figure);
    this.generatedItems(this.numberOfVegetables, 6, 8); // Генерирую овощи
    this.generatedItems(this.numberOfBonuses, 4, 5); // Генерирую бонусы

    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
    this.animate();
    this.timerId = this.interval(this.numberOfTime);
  }

  animate() {
    this.draw();
    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  // Каждую анимацию вызываем перерисовку всего игрового поля
  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.figure.draw();
    this.drawBoard();
  }

  // Заполняет массив board[][] нулями
  getEmptyBoard(): number[][] {
    return Array.from({length: FIELD_SIZE}, () => Array(FIELD_SIZE).fill(0));
  }

  // Переносит позицию игрока в массив board[][]
  generatedHomePosition(f: IFigure) {
    this.board[f.spawnPositionY][f.spawnPositionX] = 1;
  }

  // Отрисовывает все значение из массива board[][]
  drawBoard() {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          switch (value) {
            case 1:
              this.ctx.fillStyle = colorMap.homeWithGardener;
              break;
            case  2:
              this.ctx.fillStyle = colorMap.homeWithoutGardener;
              break;
            case  3:
              this.ctx.fillStyle = colorMap.gardener;
              break;
            case  4:
              this.ctx.fillStyle = colorMap.shovelX2;
              break;
            case  5:
              this.ctx.fillStyle = colorMap.barrowX3;
              break;
            case  6:
              this.ctx.fillStyle = colorMap.carrot;
              break;
            case  7:
              this.ctx.fillStyle = colorMap.apple;
              break;
            default:
              this.ctx.fillStyle = colorMap.none;
          }
          // this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  // Генерирует возможное кол-во элементов заданных типов
  generatedItems(count: number, min: number, max: number) {
    if (count === 0) {
      return;
    }
    for (let i = 0; i <= count; i++) {
      const x = Math.abs(Math.round(Math.random() * (this.playingFieldSize - 1)));
      const y = Math.abs(Math.round(Math.random() * (this.playingFieldSize - 1)));
      try {
        if (this.board[x][y] === 0) {
          this.board[x][y] = Math.floor(Math.random() * (max - min)) + min;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  pickUpElement(f: IFigure) {
    if (this.board[f.y][f.x] !== 0 && this.board[f.y][f.x] !== 1) {
      if (this.board[f.y][f.x] === 4 || this.board[f.y][f.x] === 5) {
        this.pointsBonus = 2;
      }
      this.points += this.service.scorePoints(this.board[f.y][f.x], this.pointsBonus);
      this.board[f.y][f.x] = 0;
    }
  }


  gameOver() {
    if (this.maxPoints < this.points) {
      this.maxPoints = this.points;
    }
    if (this.points > 0 && this.timeToEnd > 0) {
      this.modalText = 'Вы выиграли';
      this.winGame = true;
    }
    this.theEnd = true;
    this.gemaStarted = false;
    this.valueProgressBar = 100;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    console.log(this.timerId);
    clearTimeout(this.timerId[0]);
    clearInterval(this.timerId[1]);
    cancelAnimationFrame(this.requestId);

    this.timerId = [];
    this.timeToEnd = 0;
  }

  // Задаёт время игрового цикла
  interval(duration: number = this.numberOfTime, step: number = 1000): number[] {
    let endsAfter = duration;
    let self = this;
    let timer = setTimeout(this.gameOver.bind(this), duration);
    let interval = setInterval(function () {
      endsAfter -= step;
      if (endsAfter <= 0) clearInterval(interval);
      self.timeToEnd = Math.round(endsAfter / 1000);
      self.valueProgressBar -= 100 * 1000 / self.numberOfTime;
      console.log(self.valueProgressBar);
    }, step);
    return [timer, interval];
  }

  getWinGame(): boolean {
    return this.winGame;
  }

  getTheEnd(): boolean {
    return this.theEnd;
  }

  getStyles(value: boolean): { color: string } {
    const color = value ? 'green' : 'red';
    return {color};
  }


}
