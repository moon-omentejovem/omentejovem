namespace DbSeeder.Objkt;

public static class Queries
{
    public static readonly string GetArtistsTokens = """
        query GetArtistTokens($creatorAddress: String!) {
          token(where: {creators: {creator_address: {_eq: $creatorAddress}}}) {
            ...TokenToken
            holders(where: {quantity: {_gt: "0"}}) {
              ...TokenTokenUser
              __typename
            }
            __typename
          }
        }

        fragment TokenToken on token {
          pk
          token_id
          fa_contract
          artifact_uri
          description
          display_uri
          supply
          name
          mime
          metadata
          timestamp
          fa {
            name
            path
            description
            __typename
          }
          __typename
        }

        fragment TokenOfferActive on offer_active {
          marketplace_contract
          bigmap_key
          expiry
          price
          price_xtz
          shares
          buyer {
            address
            alias
            tzdomain
            twitter
            logo
            __typename
          }
          currency {
            fa_contract
            decimals
            type
            symbol
            __typename
          }
          __typename
        }

        fragment TokenTokenUser on token_holder {
          holder_address
          quantity
          holder {
            address
            alias
            tzdomain
            logo
            __typename
          }
          __typename
        }
        """;
}