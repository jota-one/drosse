interface HelperPayload {
  input: string
  num?: number
}

type Response = { a: string, b: boolean }

export const biggerThan10 = (payload: HelperPayload): Response => {
  const { input, num } = payload
  const res = { a: input, b: false } as Response

  if (num) {
    res.b = num > 10
  }

  return res
}
