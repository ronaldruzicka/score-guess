import type { ReactElement, ReactNode } from "react";

type Falsy = "" | 0 | 0n | false | null | undefined;

type BooleanShowProps = Readonly<{
  children: ReactNode;
  fallback?: ReactElement | null;
  when: boolean;
}>;

type NarrowingShowProps<T> = Readonly<{
  children: (item: Exclude<T, Falsy>) => ReactNode;
  fallback?: ReactElement | null;
  when: T;
}>;

export type ShowProps<T = never> = BooleanShowProps | NarrowingShowProps<T>;

export function Show(props: BooleanShowProps): ReactNode;
export function Show<T>(props: NarrowingShowProps<T>): ReactNode;
export function Show<T>({ when, fallback = null, children }: ShowProps<T>) {
  if (!when) {
    return fallback;
  }

  if (typeof children === "function") {
    return children(when as Exclude<T, Falsy>);
  }

  return children;
}
