'use client'

import Image from 'next/image'
import { useFormState, useFormStatus } from 'react-dom'
import { Alert, Box, Button, Skeleton, Stack, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useCallback, useMemo, useRef } from 'react'
import { Book, getBooks } from '@/app/actions'
import { saveAs } from 'file-saver'

export default function BookSearchForm() {
  const [state, formAction] = useFormState(getBooks, { message: '' })
  const errorMessage = 'message' in state && state.message

  return (
    <>
      <Box component="form" action={formAction} width="100%">
        <TextField
          variant="outlined"
          name="books"
          label="Book Titles & Authors"
          multiline
          fullWidth
          placeholder="e.g. The Lord of the Rings"
          minRows={4}
          sx={{ mb: 1 }}
          error={!!errorMessage}
          helperText={errorMessage}
        />
        <SubmitButton />
      </Box>

      <LoadingSkeleton />

      {'queries' in state && (
        <>
          {state.errors && (
            <Stack gap={2} useFlexGap>
              {state.errors.map((e, i) => (
                <Alert key={i} severity="error">
                  {e}
                </Alert>
              ))}
            </Stack>
          )}
          {state.data && (
            <>
              <Stack direction="row" useFlexGap gap={2} flexWrap="wrap" maxWidth="660px">
                {state.data.map(({ title, authors, coverImage }, i) => (
                  <Image key={i} src={coverImage} width={80} height={118} alt={`${title} - ${authors.join('\n')}`} />
                ))}
              </Stack>

              <BookCoversSvg books={state.data} />
            </>
          )}
        </>
      )}
    </>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <LoadingButton variant="outlined" type="submit" loading={pending}>
      Get covers
    </LoadingButton>
  )
}

function LoadingSkeleton() {
  const { pending, data } = useFormStatus()

  const pendingQueries = useMemo(() => {
    if (!pending) return []

    const pendingQueryValue = data?.get('books')
    return typeof pendingQueryValue === 'string'
      ? pendingQueryValue
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      : []
  }, [data, pending])

  return (
    pendingQueries.length > 0 && (
      <Stack direction="row" useFlexGap gap={2} flexWrap="wrap">
        {pendingQueries.map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={80} height={118} />
        ))}
      </Stack>
    )
  )
}

function BookCoversSvg({ books }: { books: Book[] }) {
  const svgEl = useRef<SVGSVGElement>(null)

  const downloadSvg = useCallback(() => {
    const svg = svgEl.current
    if (svg) {
      const serializer = new XMLSerializer()
      const source = serializer.serializeToString(svg)

      // Convert to URI data schema
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        `<?xml version="1.0" standalone="no"?>\r\n${source}`
      )}`

      saveAs(url, 'book-covers.svg')
    }
  }, [])

  return (
    <>
      <Box display="none">
        <svg
          width="165.4mm"
          height="252.2mm"
          viewBox="0 0 1654 2522"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          ref={svgEl}
        >
          {books.map(({ coverImage }, i) => {
            const colPos = i % 7
            const rowPos = Math.floor(i / 7)

            return (
              <image
                key={i}
                href={coverImage}
                width={210}
                height={340}
                x={colPos * (210 + 30)}
                y={rowPos * (340 + 23)}
                preserveAspectRatio="xMidYMid meet"
              />
            )
          })}
        </svg>
      </Box>

      <Button variant="outlined" onClick={downloadSvg}>
        Download
      </Button>
    </>
  )
}
