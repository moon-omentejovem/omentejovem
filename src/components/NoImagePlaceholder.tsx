export default function NoImagePlaceholder({
  message = 'Nenhuma imagem cadastrada.'
}: {
  message?: string
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        minHeight: 120
      }}
    >
      {message}
    </div>
  )
}
