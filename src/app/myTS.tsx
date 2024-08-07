'use cient';

import test from "node:test";
import { useState, useRef, useEffect, MutableRefObject, useMemo } from "react";
import profiles from "./profiles.json"
import { createRoot } from "react-dom/client";
import Image from "next/image";

function MyButton({ title }: { title: string }) {
    const [disabled, updater] = useState(false)

    function handleClick() {
        updater(true)
        console.log(disabled);
    }
    return (
        <button onClick={handleClick} disabled={disabled}>{"bhbiebcbk" + disabled}</button>
    );
}

//   https://dev.to/fpaghar/get-and-set-the-scroll-position-of-an-element-with-react-hook-4ooa
export function ScrollContainer() {
    const scrollBarPadding = 30;
    const scrollPadding = 200
    const childSize = 100;
    
    const thisElementRef = useRef(null);
    const gridOrigin = useRef({
        x: 0,
        y: 0
    })
    const [gridColumns , updateGridColumns] = useState(1)
    const [gridRows , updateGridRows] = useState(1)
    const gridElements = useRef([] as JSX.Element[])

    
    
    // Component Initialization
    useEffect(()=>{
        let timeoutID: undefined | NodeJS.Timeout = undefined
        
        // Initial Scroll Into View
        handlePanning()

        const observer = new ResizeObserver(()=>{
            if (thisElementRef.current) {
                const thisElement = thisElementRef.current as HTMLDivElement
                // CSS gets updated as soon as possible to minimize the grid elements shifting
                thisElement.style.setProperty("--gridColumns", `${Math.ceil((thisElement.clientWidth) / childSize + 1)}`);
    
                timeoutID ? clearTimeout(timeoutID) : {};
                timeoutID = setTimeout(()=>{
                    const currentGridColumns = Math.ceil((thisElement.clientWidth) / childSize + 1) 
                    const currentGridRows = Math.ceil((thisElement.clientHeight) / childSize + 1) 
                    
                    if ( (gridColumns != currentGridColumns) || (gridRows != currentGridRows) ) {
                        updateGridColumns(currentGridColumns)
                        updateGridRows(currentGridRows)
                    }  
                }, 200)      
            }
        })
        observer.observe(thisElementRef.current as unknown as HTMLDivElement)
        return ()=>observer.disconnect()
    })


    function updateArray() {
        if (thisElementRef.current) {
            const gridCount = gridColumns * gridRows;

            gridElements.current = (Array(gridCount).fill(0).map((el, i) => 
                (<ScrollElement 
                    key={i}
                    index={i}
                    size={childSize}>
                </ScrollElement>)
            ));
        }
    }
    useMemo(updateArray, [gridColumns])

    const handlePanning = () => {
        if (thisElementRef.current) {
            const thisElement = thisElementRef.current as HTMLDivElement
            let { scrollTop, scrollLeft} = thisElement;
            scrollTop -= scrollPadding
            scrollLeft -= scrollPadding

            if ( (scrollTop < 0) || (scrollTop >= childSize) || (scrollLeft < 0) || (scrollLeft >= childSize) ) {
                const xOffset = Math.floor(scrollLeft / childSize)
                const yOffset = Math.floor(scrollTop / childSize);

                gridOrigin.current.x += xOffset
                gridOrigin.current.y += yOffset

                thisElement.style.setProperty("--gridOriginX", `${gridOrigin.current.x}`);
                thisElement.style.setProperty("--gridOriginY", `${gridOrigin.current.y}`);

                thisElement.scrollBy(-xOffset * childSize, -yOffset * childSize);
            }
        }
    };

    useEffect(()=>{
        const thisElement = thisElementRef.current as unknown as HTMLDivElement; 
        thisElement.onpointerdown = (ev)=>{
            console.log("pointerdown")
            console.log(ev.movementX)
            thisElement.setPointerCapture(ev.pointerId)
        }
        document.addEventListener('gesturestart', (e)=>{console.log(e); e.preventDefault()})
    })
    
    return (
        <div
            className="scrollContainer"
            style={{
                overflow: "hidden"
            }}>
            <div
                ref={thisElementRef}
                onScroll={handlePanning}
                style={{
                    overflow: "scroll",
                    width:  `calc(100% + ${scrollBarPadding}px)`,
                    height: `calc(100% + ${scrollBarPadding}px)`
                }}>
                <div style={{
                    width:  `calc(round(up, 100%, ${childSize}px) + ${childSize + 2*scrollPadding}px)`,
                    height: `calc(round(up, 100%, ${childSize}px) + ${childSize + 2*scrollPadding}px)`,
                    padding: `${scrollPadding}px`,
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fit, ${childSize}px)`,
                    gridTemplateRows: `repeat(auto-fit, ${childSize}px)`,
                }}>
                    {gridElements.current}
                </div>
            </div>
        </div>
    );
}

function ScrollElement({index, size}: {index: number, size: number}) {
    return (
        <div
            style={{
                borderRadius: "50%",
                backgroundSize: `${size * 15}px ${size}px`,
                backgroundImage: `url(${profiles.atlas})`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundPosition: `calc( ${size}px*(var(--gridOriginX) + mod(${index}, var(--gridColumns)) + ${3}*(var(--gridOriginY) + round(down, ${index}/var(--gridColumns), 1) )) )`,
            }}
        >
            {/* <img 
            // alt={profiles.profiles[index % profiles.profiles.length].name} src="00000a"
            width={size}
            height={size}
            >
                
            </img> */}
        </div>
    )
}
