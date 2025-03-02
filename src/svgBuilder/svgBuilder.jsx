import React from 'react';

import styles from './svgBuilder.module.scss'

export const SvgBuilder = ({points}) => {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    return <div className={styles.svgBuilder}>


        <svg viewBox={`${minX} ${minY} ${width} ${height}`} width="300" height="300">
            {points.map((p, index) => (
                <circle key={index} cx={p.x} cy={p.y} r="2" fill="red"/>
            ))}
        </svg>
    </div>
};