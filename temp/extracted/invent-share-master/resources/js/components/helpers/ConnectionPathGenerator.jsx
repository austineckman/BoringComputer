import isCollinear from "./IsCollinear.jsx";

export default function generatePath(points, r) {
    const path = points
        .slice(1)
        .reduce((acc, p, i, points) => {
                let next = points[i + 1];
                let prev = acc.slice(-1);//acc[acc.length - 1];

                if (next && !isCollinear(prev.point, p, next)) {
                    let before = moveTo(prev.point, p, r);
                    let after = moveTo(next, p, r);
                    return acc.concat({
                        point:p,
                        s:`L ${before.x} ${before.y} S ${p.x} ${p.y} ${after.x} ${after.y} `
                    });
                } else {
                    return acc.concat({
                        point:p,
                        s:`L ${p.x} ${p.y} `
                    })
                }
            }
            , [{
                point: points[0],
                s: `M ${points[0].x} ${points[0].y} `
            }])
        .map(p => p.s)
        .join('');
    return path;
}
