/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export type Combinator = <T, U>(acc: U, curr: T) => T;
export type Reducer = (reduce: Combinator) => Transformer;

export interface TransformerResult<T> {
  __value: T;
  reduced: boolean;
}

export type Transformer = <T, U>(acc: U, curr: T, index: number) => U | TransformerResult<U>;
export type Predicate = <T>(x: T) => boolean;
