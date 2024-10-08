using Domain.Models;
using Domain.OpenSea.Models.GetCollection;
using Domain.OpenSea.Models.GetCollections;

namespace Domain.OpenSea.Mappers;

public static class CollectionMapper
{
    public static Collection ToDomain(this CollectionResponse response, GetCollectionResponse singleCollectionResponse)
    {
        return new Collection
        {
            Name = response.Name,
            ContractAddress = response.Collection,
            Description = response.Description,
            SourceId = response.Collection,
            Year = singleCollectionResponse.CreatedDate.Year.ToString(),
            BackgroundUrls = [],
            NftIds = []
        };
    }
}