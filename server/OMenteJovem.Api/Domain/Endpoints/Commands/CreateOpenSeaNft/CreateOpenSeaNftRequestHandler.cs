using Domain.Database;
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
    string NftUrl,
    bool Edition
) : IRequest<NftArt>;

public class CreateOpenSeaNftRequestHandler(
    IMongoDatabase mongoDatabase
) : IRequestHandler<CreateOpenSeaNftRequest, NftArt>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<NftArt> Handle(CreateOpenSeaNftRequest request, CancellationToken cancellationToken)
    {
        var existentNft = await _nftsCollection.Find(n => n.Name == request.Name).FirstOrDefaultAsync(cancellationToken: cancellationToken);

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
                Edition = request.Edition,
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

        if (!HasChanges(request, existentNft))
        {
            return existentNft;
        }

        existentNft.Name = request.Name;
        existentNft.Description = request.Description;
        existentNft.Address = request.ContractAddress;
        existentNft.NftChain = NftChain.Ethereum;
        existentNft.Collection = request.Collection;
        existentNft.NftUrl = request.NftUrl;
        existentNft.Edition = request.Edition;
        existentNft.ExternalLinks.AddLink(new() { Name = ExternalLinkEnum.OpenSea, Url = request.OpenSeaUrl });

        if (!existentNft.Contracts.Any(c => c.ContractAddress == request.ContractAddress))
        {
            existentNft.Contracts.Add(new Contract
            {
                ContractAddress = request.ContractAddress.ToLower(),
                NftChain = NftChain.Ethereum,
                SourceId = request.TokenId
            });
        }

        await _nftsCollection.ReplaceOneAsync(n => n.Id == existentNft.Id, existentNft, cancellationToken: cancellationToken);

        return existentNft;
    }

    private static bool HasChanges(CreateOpenSeaNftRequest request, NftArt nftArt)
    {
        return
            nftArt.Name != request.Name ||
            nftArt.Description != request.Description ||
            nftArt.Address != request.ContractAddress ||
            nftArt.Collection != request.Collection ||
            nftArt.NftUrl != request.NftUrl ||
            !nftArt.ExternalLinks.Links.Any(l => l.Name == ExternalLinkEnum.OpenSea && l.Url == request.OpenSeaUrl) ||
            !nftArt.Contracts.Any(c => c.ContractAddress == request.ContractAddress && c.NftChain == NftChain.Ethereum && c.SourceId == request.TokenId) ||
            nftArt.Edition != request.Edition;
    }
}