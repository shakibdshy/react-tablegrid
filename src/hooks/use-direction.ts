'use client';
import { atom, useAtom } from 'jotai';

// 1. set initial atom for table direction
const tableDirectionAtom = atom(
  typeof window !== 'undefined' ? localStorage.getItem('table-direction') : 'ltr'
);

const tableDirectionAtomWithPersistence = atom(
  (get) => get(tableDirectionAtom),
  (get, set, newStorage: 'ltr' | 'rtl') => {
    set(tableDirectionAtom, newStorage);
    localStorage.setItem('table-direction', newStorage);
  }
);

// 2. useDirection hook to check which direction is available
export function useDirection() {
  const [direction, setDirection] = useAtom(
    tableDirectionAtomWithPersistence
  );

  return {
    direction: direction === null ? 'ltr' : direction,
    setDirection,
  };
}
