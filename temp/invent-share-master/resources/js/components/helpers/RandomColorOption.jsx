// Array containing colors
const colors = [
    '#000000', '#563831',
    '#ff0000', '#00ff00','#1f5e1f',
    '#852583', '#3c61e3', '#ff6600',
    '#ff3333', '#dada32', '#b925c9'
];

// selecting random color
export default function randomColor(){
    return colors[(Math.floor(
        Math.random() * colors.length))];
}
