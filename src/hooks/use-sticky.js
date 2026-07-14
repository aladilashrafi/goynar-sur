import { useEffect, useRef, useState } from "react";

const useSticky = () => {
    const [sticky, setSticky] = useState(false);
    const stickyRef = useRef(false);

    useEffect(() => {
        let ticking = false;

        const updateSticky = () => {
            const nextSticky = window.scrollY > 80;

            if (stickyRef.current !== nextSticky) {
                stickyRef.current = nextSticky;
                setSticky(nextSticky);
            }

            ticking = false;
        };

        const stickyHeader = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateSticky);
            }
        };

        updateSticky();
        window.addEventListener("scroll", stickyHeader, { passive: true });

        return () => {
            window.removeEventListener("scroll", stickyHeader);
        };
    }, []);

    return {
        sticky,
    }

}

export default useSticky;
