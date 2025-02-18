declare module 'lodash' {
    export function throttle<T extends (...args: unknown[]) => unknown>(
        func: T,
        wait?: number,
        options?: {
            leading?: boolean;
            trailing?: boolean;
        }
    ): T & {
        cancel(): void;
        flush(): void;
    };
} 