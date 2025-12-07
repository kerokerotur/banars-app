/**
 * 値オブジェクトの基底クラス
 *
 * 値オブジェクトは以下の特性を持つ:
 * - 識別子を持たない
 * - 不変（イミュータブル）
 * - 属性によって等価性が決まる
 *
 * @template T - 値の型
 */
export abstract class ValueObject<T> {
  /**
   * @param value - 値オブジェクトが保持する値
   */
  protected constructor(protected readonly value: T) {}

  /**
   * 値オブジェクトが等価かどうかを判定する
   * @param other - 比較対象の値オブジェクト
   * @returns 等価な場合は true
   */
  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false
    }
    if (this.constructor !== other.constructor) {
      return false
    }
    return JSON.stringify(this.value) === JSON.stringify(other.value)
  }
}

