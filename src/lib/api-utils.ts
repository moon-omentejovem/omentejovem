import { NextResponse } from 'next/server'
import z, { ZodError } from 'zod'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.issues.map((err: z.core.$ZodIssue) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    const anyError = error as any
    return NextResponse.json(
      {
        error: error.message,
        code: anyError.code,
        details: anyError.details,
        hint: anyError.hint
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      details: error
    },
    { status: 500 }
  )
}
