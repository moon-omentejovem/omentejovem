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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
