function gaussSolve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
    }
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]

    for (let row = col + 1; row < n; row++) {
      if (M[col][col] === 0) continue
      const f = M[row][col] / M[col][col]
      for (let j = col; j <= n; j++) M[row][j] -= f * M[col][j]
    }
  }

  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n]
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j]
    x[i] /= M[i][i]
  }
  return x
}

// src: 写真上の4点 (0-1), dst: フィールド上の対応点 (0-1)
export function computeHomography(
  src: [number, number][],
  dst: [number, number][]
): number[] {
  const A: number[][] = []
  const b: number[] = []

  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i]
    const [dx, dy] = dst[i]
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy])
    b.push(dx)
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy])
    b.push(dy)
  }

  return gaussSolve(A, b) // h33=1 is implicit
}

export function applyHomography(H: number[], x: number, y: number): [number, number] {
  const [h11, h12, h13, h21, h22, h23, h31, h32] = H
  const w = h31 * x + h32 * y + 1
  return [(h11 * x + h12 * y + h13) / w, (h21 * x + h22 * y + h23) / w]
}
