import { Box, Link, Stack, Typography } from '@mui/material'
import BookSearchForm from '@/app/BookSearchForm'
import { Book } from '@/app/actions'

export default function Home() {
  return (
    <Stack component="main" alignItems="center" justifyItems="between" minHeight="100vh">
      <Stack
        component="article"
        flexGrow={1}
        alignItems="center"
        justifyItems="center"
        textAlign="center"
        gap={2}
        useFlexGap
        p={3}
      >
        <Typography variant="h1" gutterBottom>
          Laura&rsquo;s book cover stickers generator
        </Typography>
        <Typography gutterBottom>Enter book titles and authors, one per line.</Typography>

        <BookSearchForm />
      </Stack>

      <Box component="footer" flexShrink="1" p={3}>
        Created with ❤️ and snark by <Link href="https://twitter.com/matmannion">@matmannion</Link>.
      </Box>
    </Stack>
  )
}
