using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Commands.CreateOpenSeaNft;

public record CreateOpenSeaNftRequest(
    string Name,
    string Description,
    string ContractAddress,
    string Collection,
    string TokenId,
    string OpenSeaUrl,
    string NftUrl
) : IRequest<NftArt>;

public class CreateOpenSeaNftRequestHandler(
    IMongoDatabase mongoDatabase
) : IRequestHandler<CreateOpenSeaNftRequest, NftArt>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>("nftArts");

    public async Task<NftArt> Handle(CreateOpenSeaNftRequest request, CancellationToken cancellationToken)
    {
        var existentNftCursor = await _nftsCollection.FindAsync(n => n.Name == request.Name);
        var existentNft = await existentNftCursor.FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (existentNft == null)
        {
            var newNft = new NftArt
            {
                Name = request.Name,
                Description = request.Description,
                Address = request.ContractAddress,
                NftChain = NftChain.Ethereum,
                Collection = request.Collection,
                NftUrl = request.NftUrl,
                ExternalLinks = new(new() { Name = ExternalLinkEnum.OpenSea, Url = request.OpenSeaUrl }),
                Contracts =
                [
                    new Contract
                    {
                        ContractAddress = request.ContractAddress,
                        NftChain = NftChain.Ethereum,
                        SourceId = request.TokenId
                    }
                ]
            };

            await _nftsCollection.InsertOneAsync(newNft, cancellationToken: cancellationToken);

            return newNft;
        }

        var foundContract = existentNft.Contracts?.FirstOrDefault(c => c.ContractAddress == request.ContractAddress);
        if (foundContract is not null)
            return existentNft;

        existentNft.Contracts ??=
        [
            new Contract
            {
                ContractAddress = request.ContractAddress,
                NftChain = NftChain.Ethereum,
                SourceId = request.TokenId
            }
        ];

        await _nftsCollection.ReplaceOneAsync(n => n.Id == existentNft.Id, existentNft, cancellationToken: cancellationToken);

        return existentNft;
    }
}