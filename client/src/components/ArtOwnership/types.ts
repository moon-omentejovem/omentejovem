export interface ArtOwner {
  name: string
  profileUrl: string
}

export interface ArtTransaction {
  previousOwner: ArtOwner
  nextOwner: ArtOwner
  date: string
  transactionUrl: string
}
