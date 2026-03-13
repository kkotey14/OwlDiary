import { useEffect, useRef, useState } from "react";

function useMinimumLoadingDelay(loading, minimumDuration = 500) {
    const [visible, setVisible] = useState(loading);
    const startedAtRef = useRef(loading ? Date.now() : 0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (loading) {
            startedAtRef.current = Date.now();
            setVisible(true);
            return undefined;
        }

        const elapsed = Date.now() - startedAtRef.current;
        const remaining = Math.max(0, minimumDuration - elapsed);

        timeoutRef.current = window.setTimeout(() => {
            setVisible(false);
            timeoutRef.current = null;
        }, remaining);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [loading, minimumDuration]);

    return visible;
}

export default useMinimumLoadingDelay;
