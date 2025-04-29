export default function isCollinear(p1, p2, p3) {
    console.log(p1, p2, p3);
    console.log((p1.y - p2.y) * (p1.x - p3.x) === (p1.y - p3.y) * (p1.x - p2.x));
    return (p1.y - p2.y) * (p1.x - p3.x) === (p1.y - p3.y) * (p1.x - p2.x);
}
