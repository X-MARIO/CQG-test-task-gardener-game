export const FIELD_SIZE = 20;
export const BLOCK_SIZE = 30;

export const keyEventCodeMap: {[type: string]: string} = {
  ArrowRight: 'ArrowRight',
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  Escape: 'Escape',
  Enter: 'Enter'
};

// export class KEY {
//   static readonly ESC = 27;
//   static readonly LEFT = 37;
//   static readonly UP = 38;
//   static readonly RIGHT = 39;
//   static readonly DOWN = 40;
//   static readonly ENTER = 13;
// }

// export const COLORS = [
//   'none', // white board
//   'brown', // homeWithGardener
//   'purple', // homeWithoutGardener
//   'blue', // gardener
//   'red', // shovelX2
//   'pink', // barrowX3
//   'orange', // carrot
//   'green' // apple
// ];

export const colorMap: { [key: string]: string } = {
  none: 'none',
  homeWithGardener: 'brown',
  homeWithoutGardener: 'purple',
  gardener: 'blue',
  shovelX2: 'red',
  barrowX2: 'pink',
  carrot: 'orange',
  apple: 'green',
};

export class POINTS {
  static readonly CARROT = 100;
  static readonly APPLE = 200;
}
